import socketAuth from 'socketio-auth'
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

async function verifyUser(token) {
  return new Promise((resolve, reject) => {
    // setTimeout to mock a cache or database call
    setTimeout(() => {
      try {
        // this information should come from your cache or database
        const users = [
          {
            id: 1,
            name: `mariotacke`,
            token: `secret token`,
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
    const { token } = data

    try {
      const user = await verifyUser(token)

      socket.user = user

      return callback(null, true)
    } catch (e) {
      console.log(`Socket ${socket.id} unauthorized.`)
      return callback({ message: `UNAUTHORIZED` })
    }
  },
  postAuthenticate: socket => {
    console.log(`Socket ${socket.id} authenticated.`)
  },
  disconnect: socket => {
    console.log(`Socket ${socket.id} disconnected.`)
  },
})

addPlayer()
console.log(getState())

// setInterval(() => {
//   addPlayer()
//   console.log(getState())
//   setState(state => { state.tick = 0 })
// }, 4000)
