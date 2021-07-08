import { io } from "./server"

let tick = 0

io.on(`connection`, socket => {
  console.log(`connect: ${socket.id}`)

  socket.on(`hello!`, data => {
    console.log(`${data} from ${socket.id}`)
  })

  socket.on(`mouse`, data => {
    tick++
    const position = JSON.parse(data).passivePosition
    socket.broadcast.emit(`mouse`, position)
    console.log(position)
  })

  socket.on(`action`, data => undefined)

  socket.on(`disconnect`, () => {
    console.log(`disconnect: ${socket.id}`)
  })
})

setInterval(() => {
  console.log(tick)
  tick = 0
}, 1000)
