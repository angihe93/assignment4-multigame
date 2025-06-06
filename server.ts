//e.g server.js
import express from "express";
import ViteExpress from "vite-express";
import { Connect4InMemoryApi } from './src/api'
import { Connect4DbApi } from './src/db/db'
import { Server } from "socket.io"
import { GAME_UPDATED, USER_JOINED } from "./constants";
import cors from "cors" // needed for frontend to backend requests with express

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "https://assignment4-multigame-oid6u.kinsta.app", "*"],
    methods: ["GET", "POST"]
}))
// const api = new Connect4InMemoryApi();
const api = new Connect4DbApi();

app.get("/message", (_, res) => res.send("Hello from express!"));

app.get("/api/game/:id", async (req, res) => {
    const game = await api.getGame(req.params.id)
    res.json(game) // return is optional on last line
})

app.get("/api/games", async (_, res) => {
    const games = await api.getGames()
    res.json(games)
})

app.post("/api/game", async (req, res) => {
    const game = await api.createGame()
    res.json(game)
})

app.post("/api/game/:id/move", async (req, res) => {
    const game = await api.makeMove(req.params.id, req.body.chosenCol)
    io.to(makeRoomId(game.id)).emit(GAME_UPDATED, game)
    res.json(game)
})

const server = ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));

const PORT = parseInt(process.env.PORT || "3000")

// const server = app.listen(PORT,
//     () => console.log(`Server is listening at http://localhost:${PORT}`))

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://assignment4-multigame-oid6u.kinsta.app", "*"],
        methods: ["GET", "POST"]
    }
})

const makeRoomId = (gameId: string) => `game-${gameId}`

io.on("connection", (socket) => {
    console.log(`a user connected on socket id: ${socket.id}`)
    socket.on("join-game", async (gameId: string) => {
        const game = await api.getGame(gameId)
        if (!game) {
            console.error(`Game ${gameId} not found`)
            return
        }
        // https://socket.io/docs/v3/rooms/
        // A room is an arbitrary channel that sockets can join and leave. It can be used to broadcast events to a subset of clients
        const roomId = makeRoomId(gameId)
        socket.join(roomId)
        console.log(`Socket ${socket.id} joined room ${roomId}`)
        io.to(roomId).emit(USER_JOINED, socket.id)
    })
})