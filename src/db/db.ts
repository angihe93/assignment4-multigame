import { drizzle } from 'drizzle-orm/postgres-js'
import type { Connect4Api } from '../api'
import { type Grid, type EndState, type Game as GameState, type Player, initialGameState as createGame, move as makeMove, type ChosenCol, type Game } from '../game/game'
// import { type Game as GameState, initialGameState as createGame, move as makeMove, type ChosenCol } from './game/game.js';
import { gamesTable, optimalMovesTable } from './schema'
import { eq, isNotNull, isNull } from 'drizzle-orm'

const url = process.env.DATABASE_URL
if (!url)
    throw new Error('DB url not set!')

const db = drizzle(url)

export class Connect4DbApi implements Connect4Api {
    async createGame(aiPlayer?: Player): Promise<GameState> {
        console.log("Connect4DbApi createGame aiPlayer", aiPlayer)
        const game = createGame()
        const values = {
            id: game.id,
            currentPlayer: game.currentPlayer,
            grid: game.grid
        }
        if (aiPlayer)
            await db.insert(gamesTable).values({ ...values, aiPlayer: aiPlayer })
        else
            await db.insert(gamesTable).values(values)
        return game
    }

    async getGame(gameId: string) {
        const results = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId))
        if (results.length === 0) {
            throw new Error('game not found')
        }
        const game = results[0] // always get list of items, so take the first one
        return {
            id: game.id,
            currentPlayer: game.currentPlayer as Player,
            aiPlayer: game.aiPlayer as Player,
            grid: game.grid as Grid,
            endState: game.result as EndState
        }
    }

    async getGames() {
        const open = await db.select().from(gamesTable).where(isNull(gamesTable.result))
        const closed = await db.select().from(gamesTable).where(isNotNull(gamesTable.result)).limit(10)

        const mapFn: (game: any) => GameState = (game: any): GameState => {
            return {
                id: game.id,
                currentPlayer: game.currentPlayer as Player,
                grid: game.grid as Grid,
                endState: game.result as EndState
            }
        }

        return {
            open: open.map(mapFn),
            closed: closed.map(mapFn)
        }
    }

    async makeMove(gameId: string, chosenCol: ChosenCol) {
        const game = await this.getGame(gameId)
        const newGame = makeMove(game, chosenCol)
        await db
            .update(gamesTable)
            .set({
                currentPlayer: newGame.currentPlayer,
                grid: newGame.grid,
                result: newGame.endState
            })
            .where(eq(gamesTable.id, gameId))
        return newGame
    }

    async makeAiMove(gameId: string, gridStr: string): Promise<Game> {
        const results = await db.select().from(optimalMovesTable).where(eq(optimalMovesTable.grid, gridStr))
        console.log("optimalMovesTable results", results)
        let moveCol = results.length > 0 ? results[0]['move'] as ChosenCol : null
        if (moveCol === null) { // return a random available col
            // use Fisher-Yates shuffle the col numbers then find one that is available
            const shuffle = (array: number[]): number[] => {
                let currentIndex = array.length
                let randomIndex: number
                const shuffledArray = [...array]
                while (currentIndex !== 0) {
                    randomIndex = Math.floor(Math.random() * currentIndex)
                    currentIndex--
                    const temp = shuffledArray[currentIndex]
                    shuffledArray[currentIndex] = shuffledArray[randomIndex]
                    shuffledArray[randomIndex] = temp
                }
                return shuffledArray
            }

            const cols = shuffle([0, 1, 2, 3, 4, 5, 6])
            const grid = JSON.parse(gridStr)
            for (const col of cols) {
                if (grid[0][col] === null) {
                    moveCol = col as ChosenCol
                    break
                }
            }
        }

        const game = await this.getGame(gameId)
        const newGame = makeMove(game, moveCol!, true)

        await db
            .update(gamesTable)
            .set({
                currentPlayer: newGame.currentPlayer,
                grid: newGame.grid,
                result: newGame.endState
            })
            .where(eq(gamesTable.id, gameId))

        return newGame
    }
}
