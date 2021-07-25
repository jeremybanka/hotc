import socketAuth from 'socketio-auth'
import installCoreActions, {
  IVirtualActionRequest,
  IVirtualImperative,
} from './models/global/Action'
import Player from './models/global/Player'
import { PlayerId } from './models/global/util/Id'
import { io } from "./server"
import createGame, { GameSession } from "./store/game"

const game = createGame()

const g = () => game.getState()

installCoreActions(game)

io.on(`connection`, socket => {
  console.log(`connect: ${socket.id}`)

  game.subscribe(
    (state:IVirtualImperative[]) => socket.emit(`message`, state),
    state =>
      state.playersById[state.playerIdsBySocketId[socket.id]]?.imperativeLog,
    (prev, next) => {
      console.log(`prev`, prev?.length)
      console.log(`next`, next?.length)
      const isEqual = prev?.length === next?.length
      // console.log(`isEqual?`, isEqual)
      return isEqual
    }

  )

  socket.on(`hello!`, data => {
    console.log(data)
  })

  socket.on(`actionRequest`, (virtualActionRequest:IVirtualActionRequest) => {
    const player = g().getSocketOwner(socket.id)
    const actionRequest = player.devirtualizeRequest(virtualActionRequest)
    console.log(`request`, actionRequest)
    g().dispatch(actionRequest)
  })

  socket.on(`disconnect`, () => {
    console.log(`disconnect: ${socket.id}`)
  })
})

async function verifyUser(token) {
  return new Promise((resolve, reject) => {
    // setTimeout to mock a cache or database call
    setTimeout(() => {
      try {
        // this information should come from your cache or database
        const users = [
          {
            id: 1,
            name: `jeremy`,
            token: `banka`,
          },
        ]
        const user = users.find(user => user.token === token)
        if (!user) throw new Error(`User not Found.`)
        return resolve(user)
      } catch (error) { return reject(error) }
    }, 200)
  })
}

/* eslint-disable max-len */
// https:// medium.com/hackernoon/enforcing-a-single-web-socket-connection-per-user-with-node-js-socket-io-and-redis-65f9eb57f66a
/* eslint-enable max-len */
socketAuth(io, {
  authenticate: async (socket, data, callback) => {
    console.log(data)
    const { token } = data

    try {
      const user = await verifyUser(token)

      socket.user = user

      return callback(null, true)
    } catch (e) {
      console.log(e)
      console.log(`Socket ${socket.id} unauthorized.`)
      return callback({ message: `UNAUTHORIZED` })
    }
  },
  postAuthenticate: socket => {
    console.log(`Socket ${socket.id} authenticated as ${socket.user.name}.`)
    g().onPlayerJoin(socket.user.id, socket.id)
    socket.playerId = g().playerIdsBySocketId[socket.id]

    console.log(`idConfirmed`)

    // game.playersBySocketId.forEach(logIdMap)
  },
  disconnect: socket => {
    console.log(`Socket ${socket.id} disconnected.`)
  },
})
