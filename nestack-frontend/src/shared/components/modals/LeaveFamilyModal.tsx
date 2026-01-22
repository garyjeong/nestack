import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { familyApi } from '@/features/family/api/familyApi';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { showToast } from '@/shared/components/feedback/Toast';

export default function LeaveFamilyModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [keepMissions, setKeepMissions] = useState<'keep' | 'delete'>('keep');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    setPassword('');
    setKeepMissions('keep');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      showToast.error('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await familyApi.leaveFamily({ password, keepMissions });
      showToast.success('가족 그룹에서 탈퇴하였습니다.');
      handleClose();
      navigate('/onboarding');
    } catch (error: any) {
      showToast.error(error.response?.data?.error?.message || '탈퇴에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="가족 그룹 탈퇴"
      size="md"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-stone-900">
              탈퇴 주의사항
            </h3>
            <p className="text-sm text-stone-600 mt-2">
              가족 그룹을 탈퇴하면 다음 작업이 수행됩니다:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700 list-disc list-inside">
              <li className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-stone-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-stone-900">개인 미션 유지</p>
                  <p className="text-stone-600">
                    탈퇴 후에는 미션 데이터가 삭제됩니다. 이를 유지하시겠습니까?
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <X className="h-5 w-5 text-stone-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-stone-900">전체 미션 삭제</p>
                  <p className="text-stone-600">
                    탈퇴 후에는 모든 미션 데이터가 영구적으로 삭제됩니다.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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
                  value="keep"
                  checked={keepMissions === 'keep'}
                  onChange={(e) => setKeepMissions('keep')}
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
                  value="delete"
                  checked={keepMissions === 'delete'}
                  onChange={(e) => setKeepMissions('delete')}
                  className="mr-2 accent-primary-500"
                />
                <span className="text-sm font-medium text-stone-700">
                  전체 미션 삭제 (현재 미션 삭제)
                </span>
              </label>
            </div>
          </div>
        </form>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="outline"
          onClick={handleClose}
          className="px-4"
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!password || isLoading}
          className="px-4"
        >
          {isLoading ? '탈퇴 중...' : '탈퇴하기'}
        </Button>
      </div>
    </Modal>
  );
}
