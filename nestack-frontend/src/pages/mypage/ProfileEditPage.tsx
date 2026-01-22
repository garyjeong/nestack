export default function ProfileEditPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <a href="/mypage" className="text-stone-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 className="text-xl font-bold text-stone-900">프로필 수정</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <form className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary-100" />
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white shadow">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">이름</label>
                <input
                  type="text"
                  defaultValue="홍길동"
                  className="w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">이메일</label>
                <input
                  type="email"
                  defaultValue="hong@example.com"
                  disabled
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-stone-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary-500 py-4 font-semibold text-white transition hover:bg-primary-600"
          >
            저장하기
          </button>
        </form>
      </main>
    </div>
  )
}
