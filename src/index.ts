import { io } from "./server"
import { getState, setState, addPlayer } from "./store"

io.on(`connection`, socket => {
  console.log(`connect: ${socket.id}`)

  socket.on(`hello!`, data => {
    console.log(`${data} from ${socket.id}`)
  })

  socket.on(`mouse`, data => {
    setState(state => { state.tick++ })
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
  addPlayer()
  console.log(getState())
  setState(state => { state.tick = 0 })
}, 4000)
