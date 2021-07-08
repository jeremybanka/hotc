import { Server as HttpServer } from "http"
import { Server as WebSocketServer } from "socket.io"
import express from "express"
import { SERVER_PORT_HTTP } from "./config/constants"
// import Game from "./models/global/Game"

export const server = new HttpServer(express())
export const io = new WebSocketServer(
  server,
  { cors: {
    origin: [`http://localhost:3000`, `http://selena.local:3000`],
    methods: [`GET`, `POST`],
  } })

server.listen(SERVER_PORT_HTTP, () =>
  console.log(`Listening on port ${SERVER_PORT_HTTP}`)
)

// const myGame = new Game()
// console.log(myGame)
