const app = require('express')()
const port = process.env.PORT || 9090
const http = require('http').createServer(app)
/**dev */
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
    allowedHeaders: ['Access-Control-Allow-Origin', 'X-Forwarded-For', 'Host', 'Upgrade', 'Connection'],
    transports: ['websocket', 'polling']
  },
  allowEIO3: true
})


let clients = {}
let serverInfo = {}


io.on('connection', client => {
  console.log('A user connected, id: ' + client.id + ' Total: ' + io.engine.clientsCount)

  let query = client.handshake.query
  let room = query.room
  clients[client.id] = { id: client.id, modelName: query.modelName, username: query.username, room: room }
  client.join(room)
  client.broadcast.to(room).emit('newUser', clients[client.id])
  client.emit('introduction', { others: getOthers(client, room), id: client.id })

  client.on('clientFrame', (result) => {
    // only update the latest info
    if (new Date() > serverInfo.timestamp || !serverInfo.timestamp) {
      serverInfo[client.id] = {
        currentAction: result.currentAction,
        quaternion: result.quaternion,
        walkDir: result.walkDir,
        position: result.position
      }
      serverInfo.timestamp = new Date()
    }
    client.broadcast.to(room).emit('serverFrame', serverInfo)
  })

  client.on('speak', result => {
    client.broadcast.to(room).emit('speak', {
      username: clients[client.id].username,
      message: result.message,
      modelName: clients[client.id].modelName
    })
  })

  client.on('create', result => {
    io.to(room).emit('create', {
      name: result.name,
      position: result.position
    })
  })


  client.on('disconnect', () => {
    if (clients[client.id]) {
      let id = clients[client.id].id
      delete clients[client.id]
      console.log('A user disconnected, id: ' + client.id + ' Total: ' + io.engine.clientsCount)
      // refresh info and queue
      client.broadcast.to(room).emit('removeUser', id)
    }

    // clear
    if (!io.engine.clientsCount) {
      serverInfo = {}
      clients = {}
    }
  })
});

http.listen(port, () => {
  console.log('listening on ' + port)
});

function getOthers(client, room) {
  let others = []
  Object.keys(clients).forEach(key => {
    if (key !== client.id && clients[key].room === room) {
      others.push(clients[key])
    }
  })
  return others
}