import { useMutation } from '@tanstack/react-query'
import { familyApi } from '../api/familyApi'

export function useValidateInviteCode() {
  const validateMutation = useMutation({
    mutationFn: (code: string) => familyApi.validateInviteCode(code),
  })

  return {
    validate: validateMutation.mutate,
    validateAsync: validateMutation.mutateAsync,
    isValidating: validateMutation.isPending,
    isValid: validateMutation.data?.valid ?? null,
    familyGroup: validateMutation.data?.familyGroup ?? null,
    error: validateMutation.error,
    reset: validateMutation.reset,
  }
}
