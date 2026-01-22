import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Subject, Observable } from 'rxjs';

export interface SSEMessage {
  type: string;
  data: any;
  timestamp: Date;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly clients = new Map<string, Subject<SSEMessage>>();
  private readonly familyClients = new Map<string, Set<string>>(); // familyGroupId -> Set of userIds

  /**
   * Subscribe user to SSE events
   */
  subscribe(userId: string, familyGroupId?: string | null): Observable<SSEMessage> {
    // Clean up existing subscription if any
    if (this.clients.has(userId)) {
      this.unsubscribe(userId);
    }

    // Create new subject for this client
    const subject = new Subject<SSEMessage>();
    this.clients.set(userId, subject);

    // Track family group membership for partner notifications
    if (familyGroupId) {
      if (!this.familyClients.has(familyGroupId)) {
        this.familyClients.set(familyGroupId, new Set());
      }
      this.familyClients.get(familyGroupId)!.add(userId);
    }

    this.logger.log(`User ${userId} subscribed to SSE`);

    return subject.asObservable();
  }

  /**
   * Unsubscribe user from SSE events
   */
  unsubscribe(userId: string): void {
    const subject = this.clients.get(userId);
    if (subject) {
      subject.complete();
      this.clients.delete(userId);
    }

    // Remove from family tracking
    for (const [familyGroupId, members] of this.familyClients.entries()) {
      members.delete(userId);
      if (members.size === 0) {
        this.familyClients.delete(familyGroupId);
      }
    }

    this.logger.log(`User ${userId} unsubscribed from SSE`);
  }

  /**
   * Send event to specific user
   */
  sendToUser(userId: string, type: string, data: any): void {
    const subject = this.clients.get(userId);
    if (subject) {
      subject.next({
        type,
        data,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Send event to all family members
   */
  sendToFamily(familyGroupId: string, type: string, data: any): void {
    const members = this.familyClients.get(familyGroupId);
    if (members) {
      for (const userId of members) {
        this.sendToUser(userId, type, data);
      }
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.clients.size;
  }

  // ==================== Event Handlers ====================

  @OnEvent('mission.created')
  handleMissionCreated(payload: { mission: any; userId: string }): void {
    this.sendToUser(payload.userId, 'mission_created', {
      missionId: payload.mission.id,
      name: payload.mission.name,
    });

    // Notify family members
    if (payload.mission.familyGroupId) {
      const members = this.familyClients.get(payload.mission.familyGroupId);
      if (members) {
        for (const memberId of members) {
          if (memberId !== payload.userId) {
            this.sendToUser(memberId, 'family_mission_created', {
              missionId: payload.mission.id,
              name: payload.mission.name,
              createdBy: payload.userId,
            });
          }
        }
      }
    }
  }

  @OnEvent('mission.updated')
  handleMissionUpdated(payload: { mission: any; userId: string }): void {
    this.sendToUser(payload.userId, 'mission_updated', {
      missionId: payload.mission.id,
      name: payload.mission.name,
      progressPercent: payload.mission.progressPercent,
    });
  }

  @OnEvent('mission.statusChanged')
  handleMissionStatusChanged(payload: {
    mission: any;
    userId: string;
    oldStatus: string;
    newStatus: string;
  }): void {
    this.sendToUser(payload.userId, 'mission_status_changed', {
      missionId: payload.mission.id,
      name: payload.mission.name,
      oldStatus: payload.oldStatus,
      newStatus: payload.newStatus,
    });

    // Notify family
    if (payload.mission.familyGroupId) {
      this.sendToFamily(payload.mission.familyGroupId, 'family_data_updated', {
        type: 'mission_status',
        missionId: payload.mission.id,
        status: payload.newStatus,
      });
    }
  }

  @OnEvent('mission.completed')
  handleMissionCompleted(payload: { mission: any }): void {
    this.sendToUser(payload.mission.userId, 'mission_completed', {
      missionId: payload.mission.id,
      name: payload.mission.name,
    });

    // Notify family
    if (payload.mission.familyGroupId) {
      const members = this.familyClients.get(payload.mission.familyGroupId);
      if (members) {
        for (const memberId of members) {
          if (memberId !== payload.mission.userId) {
            this.sendToUser(memberId, 'partner_mission_completed', {
              missionId: payload.mission.id,
              name: payload.mission.name,
            });
          }
        }
      }
    }
  }

  @OnEvent('transactions.synced')
  handleTransactionsSynced(payload: {
    userId: string;
    accountId: string;
    transactions: any[];
  }): void {
    this.sendToUser(payload.userId, 'transaction_synced', {
      accountId: payload.accountId,
      count: payload.transactions.length,
    });
  }

  @OnEvent('accounts.synced')
  handleAccountsSynced(payload: { userId: string; accounts: any[] }): void {
    this.sendToUser(payload.userId, 'accounts_synced', {
      count: payload.accounts.length,
    });
  }

  @OnEvent('badge.earned')
  handleBadgeEarned(payload: { userId: string; badge: any; userBadge: any }): void {
    this.sendToUser(payload.userId, 'badge_earned', {
      badgeId: payload.badge.id,
      name: payload.badge.name,
      description: payload.badge.description,
      imageUrl: payload.badge.imageUrl,
    });
  }
}
