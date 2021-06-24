import { Server as HttpServer } from "http"
import { Server as WebSocketServer } from "socket.io"
import express from "express"
import { SERVER_PORT_HTTP } from "./config/constants"

export const server = new HttpServer(express())
export const io = new WebSocketServer(server)

io.on(`connection`, socket => {
  console.log(`connect: ${socket.id}`)

  socket.on(`hello!`, () => {
    console.log(`hello from ${socket.id}`)
  })

  socket.on(`disconnect`, () => {
    console.log(`disconnect: ${socket.id}`)
  })
})

server.listen(SERVER_PORT_HTTP, () =>
  console.log(`Listening on port ${SERVER_PORT_HTTP}`)
)
