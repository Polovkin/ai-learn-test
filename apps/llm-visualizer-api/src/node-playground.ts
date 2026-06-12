import process from 'node:process'
import { setImmediate, setTimeout } from 'node:timers'

export const nodePlayground = () => {
  console.log('1 sync start')

  setTimeout(() => {
    console.log('2 timeout')
  }, 0)

  Promise.resolve().then(() => {
    console.log('3 promise')
  })

  queueMicrotask(() => {
    console.log('4 microtask')
  })

  console.log('5 sync end')
}
