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
      <h1 className="mb-4 text-3xl font-bold md:text-5xl">Lyricist's Room</h1>
      <input placeholder="키워드를 입력해주세요.. 한 단어일수록 좋아요!" value={topic} onChange={e => setTopic(e.target.value)} />
      <input placeholder="키메시지를 입력해주세요!" value={key} onChange={e => setKey(e.target.value)} />
      <select aria-label="분위기" value={mood} onChange={e => setMood(e.target.value)}>
        <option>가사 분위기를 선택해주세요!</option>
        {['그리움', '당당함', '불안함', '설렘', '슬픔', '신남', '외로움', '우울함', '평화로움', '화남', '희망찬'].map(mood => (
          <option key={mood}>{mood}</option>
        ))}
      </select>
      <div className="flex items-center justify-center space-x-4">
        <button className="w-[200px] rounded-md bg-gray-400 p-2.5 text-center text-xl" onClick={() => router.push(`/graph?${new URLSearchParams({topic, key, mood}).toString()}`)}>
          start
        </button>
        <button className="w-[200px] rounded-md bg-blue-400 p-2.5 text-center text-xl" onClick={() => setShowGuide(true)}>
          사용자가이드
        </button>
      </div>

      {showGuide && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-[800px] rounded-md bg-white p-4">
            <button className="absolute right-2 top-2 text-xl" onClick={() => setShowGuide(false)}>
              &times;
            </button>
            <img src="how-to.png" alt="사용자 가이드" className="w-full" />
          </div>
        </div>
      )}
    </>
  )
}
