'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'

export default () => {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [key, setKey] = useState('')
  const [mood, setMood] = useState('')
  const [showGuide, setShowGuide] = useState(false)

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold md:text-5xl">Room for Creators!</h1>
      <input placeholder="Please enter a keyword.. The shorter the better!" value={topic} onChange={e => setTopic(e.target.value)} />
      <input placeholder="Please enter the key message!" value={key} onChange={e => setKey(e.target.value)} />
      <select aria-label="mood" value={mood} onChange={e => setMood(e.target.value)}>
        <option>Please select the mood!</option>
        {['Nostalgia', 'Confidence', 'Anxiety', 'Excitement', 'Sadness', 'Cheerfulness', 'Loneliness', 'Depression', 'Peacefulness', 'Anger', 'Hopeful'].map(mood => (
          <option key={mood}>{mood}</option>
        ))}
      </select>
      <div className="flex items-center justify-center space-x-4">
        <button className="w-[200px] rounded-md bg-gray-400 p-2.5 text-center text-xl" onClick={() => router.push(`/graph?${new URLSearchParams({topic, key, mood}).toString()}`)}>
          start
        </button>
        <button className="w-[200px] rounded-md bg-blue-400 p-2.5 text-center text-xl" onClick={() => setShowGuide(true)}>
          User Guide
        </button>
      </div>

      {showGuide && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-[800px] rounded-md bg-white p-4">
            <button className="absolute right-2 top-2 text-xl" onClick={() => setShowGuide(false)}>
              &times;
            </button>
            <img src="how-to.png" alt="User Guide" className="w-full" />
          </div>
        </div>
      )}
    </>
  )
}
