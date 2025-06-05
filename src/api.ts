import { type Game as GameState, initialGameState as createGame, move as makeMove, type ChosenCol } from './game/game.js';

export interface Connect4Api {
    createGame(): Promise<GameState>
    makeMove(gameId: string, chosenCol: ChosenCol): Promise<GameState>
    getGame(gameId: string): Promise<GameState>
    getGames(): Promise<GameState[]>
}

// server implementation, using an in-memory data structure to store and manage games
export class Connect4InMemoryApi implements Connect4Api {
    private games: Map<string, GameState> = new Map()

    async createGame(): Promise<GameState> {
        const game = createGame()
        this.games.set(game.id, game)
        return game
    }

    async getGame(gameId: string): Promise<GameState> {
        const game = this.games.get(gameId)
        if (!game)
            throw new Error("game not found")
        return game
    }

    async getGames(): Promise<GameState[]> {
        return Array.from(this.games.values())
    }

    async makeMove(gameId: string, chosenCol: ChosenCol) {
        const game = await this.getGame(gameId)
        const newGame = makeMove(game, chosenCol)
        this.games.set(gameId, newGame)
        return newGame
    }
}

const BASE_URL = "http://localhost:3000"

// client implementation, using fetch to communicate with the sever
export class Connect4ClientApi implements Connect4Api {
    async createGame(): Promise<GameState> {
        // const response = await fetch(`${BASE_URL}/api/game`, {
        const response = await fetch(`/api/game`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
        const game = await response.json()
        return game
    }

    async getGame(gameId: string): Promise<GameState> {
        // const response = await fetch(`${BASE_URL}/api/game/${gameId}`)
        const response = await fetch(`/api/game/${gameId}`)
        const game = await response.json()
        return game
    }

    async getGames(): Promise<GameState[]> {
        // const response = await fetch(`${BASE_URL}/api/games`)
        const response = await fetch(`/api/games`)
        const games = await response.json()
        return games
    }

    async makeMove(gameId: string, chosenCol: ChosenCol) {
        // const response = await fetch(`${BASE_URL}/api/game/${gameId}/move`, {
        const response = await fetch(`/api/game/${gameId}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chosenCol })
        })
        const game = await response.json()
        return game
    }

}