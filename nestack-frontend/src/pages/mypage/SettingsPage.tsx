export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <a href="/mypage" className="text-stone-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 className="text-xl font-bold text-stone-900">설정</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <section className="mb-6 rounded-xl bg-white shadow-sm">
          <h3 className="border-b border-stone-100 px-4 py-3 font-semibold text-stone-900">알림</h3>
          <div className="divide-y divide-stone-100">
            <div className="flex items-center justify-between p-4">
              <span className="text-stone-900">푸시 알림</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-stone-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:translate-x-full" />
              </label>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-stone-900">이메일 알림</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-stone-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl bg-white shadow-sm">
          <h3 className="border-b border-stone-100 px-4 py-3 font-semibold text-stone-900">공유 설정</h3>
          <div className="p-4">
            <p className="mb-3 text-sm text-stone-500">파트너와 공유할 정보를 선택하세요</p>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-stone-300 text-primary-500" />
                <span className="ml-3 text-stone-900">계좌 잔액</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-stone-300 text-primary-500" />
                <span className="ml-3 text-stone-900">거래 내역</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 rounded border-stone-300 text-primary-500" />
                <span className="ml-3 text-stone-900">뱃지 획득 알림</span>
              </label>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl bg-white shadow-sm">
          <h3 className="border-b border-stone-100 px-4 py-3 font-semibold text-stone-900">계정</h3>
          <div className="divide-y divide-stone-100">
            <a href="#" className="flex items-center justify-between p-4">
              <span className="text-stone-900">비밀번호 변경</span>
              <svg className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#" className="flex items-center justify-between p-4">
              <span className="text-stone-900">연결된 계정 관리</span>
              <svg className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>

        <section className="rounded-xl bg-white shadow-sm">
          <h3 className="border-b border-stone-100 px-4 py-3 font-semibold text-stone-900">기타</h3>
          <div className="divide-y divide-stone-100">
            <a href="#" className="flex items-center justify-between p-4">
              <span className="text-stone-900">이용약관</span>
              <svg className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#" className="flex items-center justify-between p-4">
              <span className="text-stone-900">개인정보처리방침</span>
              <svg className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <div className="flex items-center justify-between p-4">
              <span className="text-stone-900">버전</span>
              <span className="text-stone-500">1.0.0</span>
            </div>
          </div>
        </section>

        <button className="mt-6 w-full rounded-lg border border-red-300 py-3 text-red-500 transition hover:bg-red-50">
          회원 탈퇴
        </button>
      </main>
    </div>
  )
}
