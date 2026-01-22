import {
  Controller,
  Get,
  Sse,
  Req,
  MessageEvent,
} from '@nestjs/common';
import { Observable, map, finalize, interval, merge } from 'rxjs';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventsService, SSEMessage } from './events.service';
import { CurrentUser } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('events')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'events', version: '1' })
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('subscribe')
  @Sse()
  @ApiOperation({ summary: 'SSE 이벤트 구독' })
  @ApiResponse({ status: 200, description: 'SSE 스트림 연결' })
  subscribe(
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Observable<MessageEvent> {
    // Subscribe user to SSE events
    const events$ = this.eventsService.subscribe(user.id, user.familyGroupId);

    // Create heartbeat to keep connection alive
    const heartbeat$ = interval(30000).pipe(
      map(() => ({
        type: 'heartbeat',
        data: { timestamp: new Date() },
        timestamp: new Date(),
      } as SSEMessage)),
    );

    // Merge events with heartbeat
    const stream$ = merge(events$, heartbeat$);

    // Handle disconnect
    req.on('close', () => {
      this.eventsService.unsubscribe(user.id);
    });

    // Transform to MessageEvent format
    return stream$.pipe(
      map((message: SSEMessage) => ({
        data: JSON.stringify({
          type: message.type,
          data: message.data,
          timestamp: message.timestamp.toISOString(),
        }),
      })),
      finalize(() => {
        this.eventsService.unsubscribe(user.id);
      }),
    );
  }

  @Get('status')
  @ApiOperation({ summary: 'SSE 연결 상태' })
  @ApiResponse({ status: 200, description: '연결된 사용자 수 반환' })
  getStatus() {
    return {
      connectedUsers: this.eventsService.getConnectedUsersCount(),
    };
  }
}
