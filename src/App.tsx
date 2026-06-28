import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 text-slate-900">
      <h1 className="text-4xl font-bold tracking-tight">
        React + TS + Tailwind
      </h1>
      <p className="text-slate-500">Vite · ESLint · Prettier</p>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700"
      >
        count is {count}
      </button>
    </main>
  )
}

export default App
