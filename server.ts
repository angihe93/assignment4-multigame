//e.g server.js
import express from "express";
import ViteExpress from "vite-express";
import { Connect4InMemoryApi } from './src/api'
import { Connect4DbApi } from './src/db/db'

const app = express();
app.use(express.json());
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
    res.json(game)
})

ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));