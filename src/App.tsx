import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
<main className="flex flex-col h-screen">
  <header className="flex w-full items-center justify-between h-[48px] bg-slate-100 p-4">
    <h1>STICKY NOTES</h1>
  </header>
  <div className="bg-red-200 flex-1">
    asd
  </div>
</main>
  )
}

export default App
