import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { showToast } from '@/shared/components/feedback/Toast';
import { Button } from '@/shared/components/ui/Button';
import { AlertTriangle, AlertCircle, X, Shield, ChevronRight } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';

type ShareStatusType = 'FULL' | 'BALANCE_ONLY' | 'PRIVATE';

interface Account {
  id: string;
  bankName: string;
  accountNumberMasked: string;
  balance: number;
  shareStatus: ShareStatusType;
  isHidden: boolean;
}

export default function FamilySettingsPage() {
  const navigate = useNavigate();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [password, setPassword] = useState('');
  const [keepMissions, setKeepMissions] = useState<'keep' | 'delete'>('keep');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ [accountId: string]: ShareStatusType }>({});

  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['family', 'share-settings'],
    queryFn: async () => {
      const response = await apiClient.get('/family/share-settings');
      return response.data.data.accounts;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { accounts: { accountId: string; shareStatus: ShareStatusType }[] }) => {
      const response = await apiClient.patch('/family/share-settings', { accounts: data });
      return response.data;
    },
    onSuccess: () => {
      showToast.success('공유 설정이 변경되었습니다.');
      setPendingChanges({});
    },
    onError: (error: Error & { response?: { data?: { error?: { message?: string } } } }) => {
      showToast.error(error.response?.data?.error?.message || '공유 설정 변경에 실패했습니다.');
    },
  });

  const handleShareStatusChange = (accountId: string, status: ShareStatusType) => {
    setPendingChanges((prev) => ({
      ...prev,
      [accountId]: status,
    }));
  };

  const handleSave = () => {
    const updates: { accountId: string; shareStatus: ShareStatusType }[] = [];
    
    accounts.forEach((account: Account) => {
      const pendingStatus = pendingChanges[account.id];
      if (pendingStatus && pendingStatus !== account.shareStatus) {
        updates.push({
          accountId: account.id,
          shareStatus: pendingStatus,
        });
      }
    });
    
    if (updates.length > 0) {
      updateMutation.mutate({ accounts: updates });
    }
  };

  const handleLeaveFamily = async () => {
    if (!password) {
      showToast.error('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.delete('/family/leave', { data: { password, keepMissions } });
      showToast.success('가족 그룹에서 탈퇴하였습니다.');
      setShowLeaveModal(false);
      setPendingChanges({});
      navigate('/onboarding');
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { error?: { message?: string } } } };
      showToast.error(err.response?.data?.error?.message || '탈퇴에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/onboarding')}
            className="flex items-center text-stone-600 hover:text-stone-900"
          >
            <X className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium">돌아가기</span>
          </button>
          <h1 className="text-2xl font-bold text-stone-900">데이터 공유 설정</h1>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-stone-600" />
          <span className="text-sm text-stone-500">
            {accounts.length}개 계좌의 공유 범위를 설정할 수 있습니다
          </span>
        </div>
      </div>

      {isLoadingAccounts ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-20 bg-stone-200 rounded"></div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <AlertCircle className="h-16 w-16 mx-auto text-stone-400 mb-4" />
          <p className="text-stone-600">연동된 계좌가 없습니다</p>
          <p className="mt-4 text-sm text-stone-500">
            먼저 오픈뱅킹을 통해 계좌를 연동해주세요.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/finance/openbanking')}
            className="mt-4"
          >
            오픈뱅킹 연동하기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account: Account) => (
            <div key={account.id} className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-stone-600" />
                  <div>
                    <p className="font-medium text-stone-900">{account.bankName}</p>
                    <p className="text-sm text-stone-500">{account.accountNumberMasked}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-stone-900">
                    {new Intl.NumberFormat('ko-KR').format(account.balance)}원
                  </p>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-700">공유 범위</span>
                    <select
                      value={pendingChanges[account.id] || account.shareStatus}
                      onChange={(e) => handleShareStatusChange(account.id, e.target.value as ShareStatusType)}
                      className="border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      <option value="FULL">모두 공유</option>
                      <option value="BALANCE_ONLY">잔액만</option>
                      <option value="PRIVATE">비공개</option>
                    </select>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-stone-500">
                    {account.isHidden ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-stone-400 flex-shrink-0" />
                        <span className="ml-1">숨김 상태</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 text-stone-400 flex-shrink-0" />
                        <span className="ml-1">공개 상태</span>
                      </>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 text-store-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg border-t border-stone-200">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {hasPendingChanges && (
              <span className="flex items-center gap-1 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>변경사항이 있습니다</span>
              </span>
            )}
            <span className="text-sm text-stone-500">
              {hasPendingChanges
                ? '변경사항을 저장하거나 취소할 수 있습니다.'
                : '저장 버튼을 눌러 변경사항을 적용하세요.'}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowLeaveModal(false)}
              disabled={!hasPendingChanges}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isLoading || updateMutation.isPending}
              disabled={!hasPendingChanges}
              className="flex-1"
            >
              {isLoading || updateMutation.isPending ? '저장 중...' : '저장하기'}
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding')}
              className="flex-1"
            >
              돌아가기
            </Button>
            <Button
              onClick={() => setShowLeaveModal(true)}
              className="flex-1"
            >
              가족 그룹 탈퇴
            </Button>
          </div>
        </div>
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md mx-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-stone-900">가족 그룹 탈퇴</h2>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-12 w-12 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-stone-900">
                    탈퇴 주의사항
                  </h3>
                  <p className="text-sm text-stone-600">
                    가족 그룹을 탈퇴하면 다음 작업이 수행됩니다:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-stone-700 list-disc list-inside">
                    <li className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-stone-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-stone-900">개인 미션 유지</p>
                        <p className="text-sm text-stone-600">
                          탈퇴 후에는 미션 데이터가 삭제됩니다. 이를 유지하시겠습니까?
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-stone-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-stone-900">전체 미션 삭제</p>
                        <p className="text-sm text-stone-600">
                          탈퇴 후에는 모든 미션 데이터가 영구적으로 삭제됩니다.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <form onSubmit={handleLeaveFamily} className="space-y-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    비밀번호
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="mt-2"
                    maxLength={20}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-stone-700">
                    미션 처리 방식
                  </label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="missionOption"
                        id="keep"
                        value={keepMissions}
                        onChange={() => setKeepMissions('keep')}
                        checked={keepMissions === 'keep'}
                        className="mr-2 accent-primary-500"
                      />
                      <span className="text-sm font-medium text-stone-700">
                        개인 미션 유지 (현재 미션 유지)
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="missionOption"
                        id="delete"
                        value={keepMissions}
                        onChange={() => setKeepMissions('delete')}
                        checked={keepMissions === 'delete'}
                        className="mr-2 accent-primary-500"
                      />
                      <span className="text-sm font-medium text-stone-700">
                        전체 미션 삭제 (현재 미션 삭제)
                      </span>
                    </label>
                  </div>
                </div>
              </form>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowLeaveModal(false)}
                  disabled={isLoading}
                  className="px-4"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={!password || isLoading}
                  className="px-4"
                >
                  {isLoading ? '탈퇴 중...' : '탈퇴하기'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
