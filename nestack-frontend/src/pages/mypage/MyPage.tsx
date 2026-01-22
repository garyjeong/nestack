export default function MyPage() {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="bg-white px-4 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-stone-900">마이페이지</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary-100" />
            <div>
              <h2 className="text-lg font-bold text-stone-900">홍길동</h2>
              <p className="text-sm text-stone-500">hong@example.com</p>
            </div>
          </div>
          <a
            href="/mypage/profile"
            className="mt-4 block w-full rounded-lg border border-stone-300 py-2 text-center text-sm font-medium text-stone-600"
          >
            프로필 수정
          </a>
        </section>

        <section className="mb-6 rounded-xl bg-white shadow-sm">
          <h3 className="border-b border-stone-100 px-4 py-3 font-semibold text-stone-900">뱃지</h3>
          <a href="/mypage/badges" className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 ring-2 ring-white">
                  🏆
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 ring-2 ring-white">
                  💎
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 ring-2 ring-white">
                  🌟
                </div>
              </div>
              <span className="text-stone-600">5개 획득</span>
            </div>
            <svg className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </section>

        <section className="mb-6 rounded-xl bg-white shadow-sm">
          <h3 className="border-b border-stone-100 px-4 py-3 font-semibold text-stone-900">가족 그룹</h3>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary-100 ring-2 ring-white" />
                <div className="h-10 w-10 rounded-full bg-accent-100 ring-2 ring-white" />
              </div>
              <div>
                <p className="font-medium text-stone-900">김영희님과 함께</p>
                <p className="text-sm text-stone-500">100일째 함께하고 있어요</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white shadow-sm">
          <a href="/mypage/settings" className="flex items-center justify-between p-4">
            <span className="text-stone-900">설정</span>
            <svg className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <button className="w-full border-t border-stone-100 p-4 text-left text-red-500">
            로그아웃
          </button>
        </section>
      </main>
    </div>
  )
}
