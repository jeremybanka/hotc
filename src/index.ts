import { io } from "./server"

setInterval(() => {
  io.emit(`message`, new Date().toISOString())
}, 1000)
