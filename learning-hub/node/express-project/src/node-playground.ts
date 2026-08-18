import fs from 'node:fs'

const nodePlayground = () => {
  console.log('1. script start')

  setTimeout(() => {
    console.log('4. timeout')
  }, 0)

  setImmediate(() => {
    console.log('5. immediate')
  })

  fs.readFile('./event-loop.js', () => {
    console.log('2. file callback')

    setTimeout(() => {
      console.log('6. timeout inside file callback')
    }, 0)

    setImmediate(() => {
      console.log('3. immediate inside file callback')
    })
  })

  console.log('7. script end')
}

export default nodePlayground
