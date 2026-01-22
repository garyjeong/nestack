export default function BadgesPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <a href="/mypage" className="text-stone-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 className="text-xl font-bold text-stone-900">뱃지</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <section className="mb-6">
          <h2 className="mb-4 font-semibold text-stone-900">획득한 뱃지 (5)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl">
                🏆
              </div>
              <p className="text-sm font-medium text-stone-900">첫 미션</p>
              <p className="text-xs text-stone-500">2024.01.01</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                💎
              </div>
              <p className="text-sm font-medium text-stone-900">저축왕</p>
              <p className="text-xs text-stone-500">2024.01.10</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                🌟
              </div>
              <p className="text-sm font-medium text-stone-900">연속 7일</p>
              <p className="text-xs text-stone-500">2024.01.07</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-3xl">
                💕
              </div>
              <p className="text-sm font-medium text-stone-900">파트너</p>
              <p className="text-xs text-stone-500">2024.01.01</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-3xl">
                🎯
              </div>
              <p className="text-sm font-medium text-stone-900">목표 달성</p>
              <p className="text-xs text-stone-500">2024.01.15</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-semibold text-stone-900">미획득 뱃지</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white p-4 text-center opacity-50 shadow-sm">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-3xl">
                👑
              </div>
              <p className="text-sm font-medium text-stone-900">VIP</p>
              <p className="text-xs text-stone-500">???</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center opacity-50 shadow-sm">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-3xl">
                🏅
              </div>
              <p className="text-sm font-medium text-stone-900">연속 30일</p>
              <p className="text-xs text-stone-500">???</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
