'use client'
import {useEffect, useState, useRef, Suspense} from 'react'
import {useSearchParams, useRouter} from 'next/navigation'
import Link from 'next/link'
import * as d3 from 'd3'
import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

function Graph() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [graph, setGraph] = useState({nodes: [{id: 1, name: searchParams.get('topic') || 'No topic', fx: 910, fy: 400}], links: []})
  const [sentence, setSentence] = useState('')
  const [loadingNode, setLoadingNode] = useState(null)
  const [chips, setChips] = useState([]) // 클릭한 단어들을 저장할 상태 변수
  const [history, setHistory] = useState([]) // 응답을 저장할 상태 변수
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false) // 설문조사 팝업 상태 관리
  const [isFirstMakeClick, setIsFirstMakeClick] = useState(true) // 첫 클릭 여부 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const sidebarOpenRef = useRef(sidebarOpen) // 사이드바 상태를 참조할 ref
  const svgRef = useRef(null)
  const openai = new OpenAI({apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY, dangerouslyAllowBrowser: true})

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen
  }, [sidebarOpen]) // sidebarOpen이 변경될 때마다 ref 업데이트

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    document.body.style.overflow = 'hidden'
  }

  const handleNodeClick = async (e, node) => {
    e.stopPropagation()
    if (sidebarOpenRef.current) {
      setSentence(prevSentence => (prevSentence ? `${prevSentence}, ${node.name}` : node.name)) // 사이드바가 열려 있을 때만 입력 필드에 단어 추가
      return
    }
    setLoadingNode(node.id)
    const content = `""키워드"": ${node.name}\n""키메시지"": ${searchParams.get('key') || ''}\n*[최종 답변 형태] 외 답변 금지\n**[답변 금지 단어]: ${graph.nodes.map(node => node.name).join(', ')}`
    const json = await (await fetch(`${searchParams.get('mood')}.json`)).json() // 분위기 json 가져오기
    json.messages.push({role: 'user', content})
    const response = await openai.chat.completions.create(json)
    console.log(response.choices[0].message.content)
    const [keyword, relatedWords] = response.choices[0].message.content.match(/(?<=1개: ).+|(?<=6개: ).+/g).map(words => words.split(', '))
    const newNodes = [keyword, ...relatedWords].map((name, i) => ({id: graph.nodes.length + i + 1, name, x: node.x + 50 * Math.cos(i / 2), y: node.y + 50 * Math.sin(i / 2)}))
    setGraph(prevGraph => ({nodes: [...prevGraph.nodes, ...newNodes], links: [...prevGraph.links, ...newNodes.map(newNode => ({source: node.id, target: newNode.id}))]}))
    setLoadingNode(null)
  }

  const handleChipClick = chip => setSentence(prevSentence => (prevSentence ? `${prevSentence}, ${chip}` : chip))

  const handleMakeClick = async () => {
    if (!sentence.trim()) {
      return; // 입력창에 아무것도 적혀있지 않으면 함수 종료
    }

    if (isFirstMakeClick) {
      setTimeout(() => {
        setShowSurvey(true); // 첫 클릭 시 설문조사 팝업 표시
      }, 3000); // 3초 후에 팝업 표시
      setIsFirstMakeClick(false); // 첫 클릭 상태 업데이트
    }

    const mood = searchParams.get('mood');
    const json = await (await fetch(`${mood}make.json`)).json(); // 분위기 json 가져오기
    json.messages.push({ role: 'user', content: sentence });

    const fetchResponse = async () => {
      const response = await openai.chat.completions.create(json);
      return response;
    };

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
    try {
      setIsLoading(true); // 로딩 시작
      const response = await Promise.race([fetchResponse(), timeout]);
      const answers = response.choices[0].message.content.split('\n'); // 문장을 개별 문장으로 분리

      setHistory((prevHistory) => [
        ...prevHistory,
        { chips: sentence.split(',').map((word) => word.trim()), answers },
      ]);
      setSentence('');
    } catch (error) {
      if (error.message === 'Timeout') {
        alert('다시 시도해 주세요:)');
      } else {
        alert('오류가 발생했습니다: ' + error.message);
      }
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Add zoom functionality
    const containerGroup = svg.append('g') // Add a group to apply zoom transformations

    const linkGroup = containerGroup.append('g').attr('class', 'links')
    const nodeGroup = containerGroup.append('g').attr('class', 'nodes')
    const simulation = d3
      .forceSimulation(graph.nodes)
      .force(
        'link',
        d3
          .forceLink(graph.links)
          .id(d => d.id)
          .distance(70)
          .strength(0.7) // 링크 강도를 낮춰서 노드가 덜 흔들리게 합니다.
      )
      .force('charge', d3.forceManyBody().strength(-30)) // 노드 간의 반발력을 줄입니다.
      .force('collision', d3.forceCollide().radius(40).strength(0.7)) // 충돌 강도를 조정하여 부드럽게 합니다.
      .alphaDecay(0.05) // 시뮬레이션의 알파 감소율을 높여 시뮬레이션이 더 빨리 안정되도록 합니다.
      .on('tick', () => {
        graph.nodes.forEach(d => {
          d.vx = 0
          d.vy = 0
        })
        linkGroup
          .selectAll('line')
          .data(graph.links)
          .join('line')
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
          .attr('stroke', '#999')
          .attr('stroke-width', 2)
        nodeGroup
          .selectAll('g')
          .data(graph.nodes)
          .join(enter => {
            const nodeEnter = enter
              .append('g')
              .attr('class', 'node')
              .on('click', (e, d) => handleNodeClick(e, d))
              .call(
                d3
                  .drag()
                  .on('start', (e, d) => {
                    if (!e.active) simulation.alphaTarget(0.3).restart()
                    d.fx = d.x
                    d.fy = d.y
                  })
                  .on('drag', (e, d) => {
                    d.fx = e.x
                    d.fy = e.y
                  })
                  .on('end', (e, d) => {
                    if (!e.active) simulation.alphaTarget(0)
                    if (d.id !== 1) {
                      d.fx = null
                      d.fy = null
                    }
                  })
              )
              .on('mouseenter', function (e, d) {
                d3.select(this).select('circle').attr('fill', '#ffa500') // Change the node color on hover
                svg.style('cursor', 'pointer') // Change cursor to pointer
              })
              .on('mouseleave', function (e, d) {
                d3.select(this).select('circle').attr('fill', '#d9d9d9') // Revert the node color
                svg.style('cursor', 'default') // Revert cursor to default
              })
            nodeEnter.append('circle').attr('r', 30).attr('fill', '#d9d9d9')
            nodeEnter
              .append('text')
              .attr('dy', 4)
              .attr('x', 0)
              .attr('font-size', 12)
              .attr('text-anchor', 'middle') // 텍스트를 가운데 정렬합니다.
              .text(d => d.name)
            nodeEnter.each(function (d) {
              if (loadingNode === d.id) {
                d3.select(this)
                  .append('svg')
                  .attr('x', -35)
                  .attr('y', -35)
                  .attr('width', 70)
                  .attr('height', 70)
                  .attr('viewBox', '0 0 200 200')
                  .html(
                    "<radialGradient id='a10' cx='.66' fx='.66' cy='.3125' fy='.3125' gradientTransform='scale(1.5)'><stop offset='0' stop-color='#000000'></stop><stop offset='.3' stop-color='#000000' stop-opacity='.9'></stop><stop offset='.6' stop-color='#000000' stop-opacity='.6'></stop><stop offset='.8' stop-color='#000000' stop-opacity='.3'></stop><stop offset='1' stop-color='#000000' stop-opacity='0'></stop></radialGradient><circle transform-origin='center' fill='none' stroke='url(#a10)' stroke-width='15' stroke-linecap='round' stroke-dasharray='200 1000' stroke-dashoffset='0' cx='100' cy='100' r='70'><animateTransform type='rotate' attributeName='transform' calcMode='spline' dur='2' values='360;0' keyTimes='0;1' keySplines='0 0 1 1' repeatCount='indefinite'></animateTransform></circle><circle transform-origin='center' fill='none' opacity='.2' stroke='#000000' stroke-width='15' stroke-linecap='round' cx='100' cy='100' r='70'></circle>"
                  )
              }
            })
            return nodeEnter
          })
          .attr('transform', d => `translate(${d.x},${d.y})`)
      })
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 10]) // Limit the zoom scale
      .on('zoom', event => {
        containerGroup.attr('transform', event.transform)
      })
    svg.call(zoom)
    svg.on('click', () => {
      simulation.stop()
    })
    simulation.nodes(graph.nodes)
    simulation.force('link').links(graph.links)
    simulation.alpha(1).restart()
  }, [graph, loadingNode])

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div className="absolute bottom-0 left-0 top-0 z-30 md:w-[500px] w-2/3 overflow-y-auto bg-gray-200 p-5">
          <button onClick={toggleSidebar} className="mb-2.5 ml-2.5 p-1 md:text-lg text-sm">
            Close
          </button>
          {history.map((entry, index) => (
            <div key={index} className="mb-1.5 p-2.5">
              <div className="mb-2.5 flex flex-wrap">
                {entry.chips.map((chip, chipIndex) => (
                  <div key={chipIndex} className="mb-1.5 mr-1.5 rounded-full bg-gray-300 p-2.5">
                    {chip}
                  </div>
                ))}
              </div>
              <div className="whitespace-pre-wrap break-words"></div>
              {entry.answers.map((answer, answerIndex) => (
                <div key={answerIndex} className="whitespace-pre-wrap break-words text-xs md:text-base">
                  {answer}
                </div>
              ))}
            </div>
          ))}
          {isLoading && <img className="mx-auto size-20" src="loading.svg" />}
        </div>
      )}

      <div className={`flex h-screen flex-1 flex-col items-center overflow-hidden`}>
        <button onClick={toggleSidebar} className="fixed left-2.5 top-0 p-6 text-lg">
          {sidebarOpen ? 'Close' : 'Maker Mode'}
        </button>
        <button onClick={() => router.push('/')} className={`fixed right-2.5 top-0 p-6 text-lg`}>
          Home
        </button>

        <svg ref={svgRef} className="w-full lg:w-[1820px] h-full flex-1"></svg>
        <div className="mb-0 mt-0 flex w-full flex-col items-center justify-center">
          <div className="flex w-full flex-wrap justify-center p-2.5">
            {chips.map((chip, index) => (
              <div key={index} className="m-1.5 cursor-pointer rounded-full bg-gray-300 p-2.5" onClick={() => handleChipClick(chip)}>
                {chip}
              </div>
            ))}
          </div>

          <div className="z-50 mb-8 flex w-screen items-center justify-center md:w-[600px]">
            <input
              type="text"
              placeholder="MAKE A SENTENCE USING THE CHOSEN WORD"
              value={sentence}
              onChange={e => setSentence(e.target.value)}
              className="box-border h-10 w-3/4 p-2.5 text-xs md:w-full md:text-base"
            />
            <button className="ml-1 md:ml-4 flex h-10 items-center justify-center rounded-lg bg-gray-400 px-5 md:text-base text-xs" onClick={handleMakeClick}>
              MAKE
            </button>
          </div>
        </div>
        {showSurvey && (
          <div className="fixed bottom-0 right-0 z-50 m-4 w-96 rounded-lg bg-white p-4 shadow-lg">
            <h2 className="mb-2 text-lg font-bold">Survey</h2>
            <p className="mb-4">
            Please participate in the demo version Google Form feedback. We are giving out a 10,000 won Starbucks gift certificate by lottery, so please show your interest.
              <br /><br />
              <Link className="text-sky-500" href="https://forms.gle/WMtrJzuCT5dkt4267" target="_blank">
                [Lyricist's Room Feedback Google Form]
              </Link>
            </p>
            <button onClick={() => setShowSurvey(false)} className="rounded-md bg-blue-500 px-4 py-2 text-white">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default () => (
  <Suspense>
    <Graph />
  </Suspense>
)
