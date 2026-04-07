import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

const TOTAL_TIME = 30
const TOTAL_QUESTIONS = 10

function generateQuestion() {
  const ops = ['+', '-', '×'] as const
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a: number, b: number, answer: number

  if (op === '+') {
    a = Math.floor(Math.random() * 50) + 1
    b = Math.floor(Math.random() * 50) + 1
    answer = a + b
  } else if (op === '-') {
    a = Math.floor(Math.random() * 50) + 10
    b = Math.floor(Math.random() * a) + 1
    answer = a - b
  } else {
    a = Math.floor(Math.random() * 9) + 2
    b = Math.floor(Math.random() * 9) + 2
    answer = a * b
  }

  const wrong = new Set<number>()
  while (wrong.size < 3) {
    const delta = Math.floor(Math.random() * 10) + 1
    const w = Math.random() > 0.5 ? answer + delta : answer - delta
    if (w !== answer && w > 0) wrong.add(w)
  }

  const options = [...wrong, answer].sort(() => Math.random() - 0.5)
  return { question: `${a} ${op} ${b} = ?`, answer, options }
}

type Phase = 'idle' | 'playing' | 'result'

export default function MathQuiz() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [questions] = useState(() => Array.from({ length: TOTAL_QUESTIONS }, generateQuestion))
  const [current, setCurrent] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(0)

  const finish = useCallback(() => setPhase('result'), [])

  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) { finish(); return }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft, finish])

  const handleStart = () => {
    setPhase('playing')
    setCurrent(0)
    setCorrect(0)
    setAnswered(0)
    setTimeLeft(TOTAL_TIME)
    setSelected(null)
  }

  const handleAnswer = (option: number) => {
    if (selected !== null) return
    setSelected(option)
    const isCorrect = option === questions[current].answer
    if (isCorrect) setCorrect(p => p + 1)
    setAnswered(p => p + 1)
    setTimeout(() => {
      if (current + 1 >= TOTAL_QUESTIONS) {
        finish()
      } else {
        setCurrent(p => p + 1)
        setSelected(null)
      }
    }, 600)
  }

  const getResult = () => {
    const speed = answered
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0
    if (accuracy >= 90 && speed >= 8) return { label: '🏆 Математический гений', color: 'text-yellow-400' }
    if (accuracy >= 70 && speed >= 6) return { label: '🚀 Быстрый и точный', color: 'text-green-400' }
    if (accuracy >= 70) return { label: '🎯 Точный, но медленный', color: 'text-blue-400' }
    if (speed >= 6) return { label: '⚡ Быстрый, но торопится', color: 'text-orange-400' }
    return { label: '📚 Нужно потренироваться', color: 'text-neutral-400' }
  }

  const timerPercent = (timeLeft / TOTAL_TIME) * 100
  const q = questions[current]

  return (
    <div className="mt-10 w-full max-w-md">
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-neutral-400 mb-4 text-lg">10 примеров за 30 секунд — проверь свою скорость и точность!</p>
            <Button
              size="lg"
              onClick={handleStart}
              className="bg-[#FF4D00] text-white hover:bg-[#e04400] border-none"
            >
              <Icon name="Zap" size={18} className="mr-2" />
              Попробовать мини-тест
            </Button>
          </motion.div>
        )}

        {phase === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="flex items-center justify-between text-sm text-neutral-400 mb-1">
              <span>Вопрос {current + 1} / {TOTAL_QUESTIONS}</span>
              <span className={timeLeft <= 10 ? 'text-red-400 font-bold' : ''}>⏱ {timeLeft} сек</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#FF4D00] rounded-full"
                animate={{ width: `${timerPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <motion.p
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-white"
            >
              {q.question}
            </motion.p>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt) => {
                let variant: string = 'border-neutral-700 text-white hover:border-[#FF4D00]'
                if (selected !== null) {
                  if (opt === q.answer) variant = 'border-green-500 text-green-400 bg-green-500/10'
                  else if (opt === selected) variant = 'border-red-500 text-red-400 bg-red-500/10'
                  else variant = 'border-neutral-800 text-neutral-600'
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`border rounded-xl py-3 px-4 text-xl font-semibold transition-all ${variant}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className={`text-2xl font-bold ${getResult().color}`}>{getResult().label}</p>
            <div className="flex gap-6 text-white">
              <div>
                <p className="text-4xl font-bold">{answered > 0 ? Math.round((correct / answered) * 100) : 0}%</p>
                <p className="text-neutral-400 text-sm mt-1">Точность</p>
              </div>
              <div className="w-px bg-neutral-700" />
              <div>
                <p className="text-4xl font-bold">{answered}</p>
                <p className="text-neutral-400 text-sm mt-1">Решено за 30 сек</p>
              </div>
              <div className="w-px bg-neutral-700" />
              <div>
                <p className="text-4xl font-bold">{correct}</p>
                <p className="text-neutral-400 text-sm mt-1">Правильно</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <Button
                size="lg"
                className="bg-[#FF4D00] text-white hover:bg-[#e04400] border-none"
              >
                <Icon name="UserPlus" size={16} className="mr-2" />
                Зарегистрироваться бесплатно
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={handleStart}
                className="text-neutral-400 hover:text-white"
              >
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Ещё раз
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}