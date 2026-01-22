export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600">Nestack</h1>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm text-stone-500">연결됨</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Partner Status */}
        <section className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="h-12 w-12 rounded-full bg-primary-100 ring-2 ring-white" />
              <div className="h-12 w-12 rounded-full bg-accent-100 ring-2 ring-white" />
            </div>
            <div>
              <p className="font-semibold text-stone-900">함께하는 중</p>
              <p className="text-sm text-stone-500">100일째 함께하고 있어요</p>
            </div>
          </div>
        </section>

        {/* Mission Progress */}
        <section className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold text-stone-900">이번 달 미션</h2>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-stone-600">결혼자금 모으기</span>
                <span className="font-medium text-primary-600">45%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full w-[45%] rounded-full bg-primary-500" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-stone-600">비상금 만들기</span>
                <span className="font-medium text-primary-600">72%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full w-[72%] rounded-full bg-primary-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Total Savings */}
        <section className="mb-6 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white shadow-sm">
          <p className="text-sm opacity-80">총 저축액</p>
          <p className="mt-1 font-mono text-3xl font-bold">12,450,000원</p>
          <p className="mt-2 text-sm opacity-80">지난달 대비 +520,000원</p>
        </section>

        {/* Recent Transactions */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">최근 거래</h2>
            <a href="/finance" className="text-sm text-primary-600">더보기</a>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <span className="text-green-600">+</span>
                </div>
                <div>
                  <p className="font-medium text-stone-900">월급</p>
                  <p className="text-sm text-stone-500">KB국민은행</p>
                </div>
              </div>
              <span className="font-mono font-medium text-green-600">+3,500,000</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <span className="text-red-600">-</span>
                </div>
                <div>
                  <p className="font-medium text-stone-900">식비</p>
                  <p className="text-sm text-stone-500">카카오페이</p>
                </div>
              </div>
              <span className="font-mono font-medium text-red-600">-45,000</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-lg">
          <a href="/" className="flex flex-1 flex-col items-center py-3 text-primary-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="mt-1 text-xs">홈</span>
          </a>
          <a href="/missions" className="flex flex-1 flex-col items-center py-3 text-stone-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="mt-1 text-xs">미션</span>
          </a>
          <a href="/finance" className="flex flex-1 flex-col items-center py-3 text-stone-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="mt-1 text-xs">가계부</span>
          </a>
          <a href="/mypage" className="flex flex-1 flex-col items-center py-3 text-stone-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="mt-1 text-xs">마이</span>
          </a>
        </div>
      </nav>
    </div>
  )
}
