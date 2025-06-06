// set of tests for in-memory version of the API
// run `bun test`
import { Connect4InMemoryApi } from "./src/api"

describe('Connect4InMemoryApi', () => {
    let api: Connect4InMemoryApi
    beforeEach(() => {
        api = new Connect4InMemoryApi()
    })
    describe('createGame', () => {
        it('should create a new game with correct initial state', async () => {
            const game = await api.createGame()

            expect(game).toBeDefined() // toBeDefined assets a value is defined, not undefined
            expect(game.id).toBeDefined()
            expect(game.currentPlayer).toBe('red')
            expect(game.endState).toBeNull()
            expect(game.grid).toEqual([
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null]
            ])
        })

        it('should create games with unique IDs', async () => {
            const game1 = await api.createGame()
            const game2 = await api.createGame()

            expect(game1.id).not.toBe(game2.id)
        })
    })

    describe('makeMove', () => {
        it('should make a valid move and update the game state', async () => {
            const game = await api.createGame()
            let updatedGame = await api.makeMove(game.id, 0)

            expect(updatedGame.grid[5][0]!).toBe('red') // ! assures typescript this value will not be undefined
            expect(updatedGame.currentPlayer).toBe('yellow')

            updatedGame = await api.makeMove(game.id, 0)
            expect(updatedGame.grid[4][0]!).toBe('yellow')
        })

        it('should reject moves on non-existent games', async () => {
            await expect(api.makeMove('non-existent-id', 0))
                .rejects.toThrow('game not found')
        })

        it('should not allow moves after game is won', async () => {
            const game = await api.createGame()
            // Make moves to create a winning condition
            await api.makeMove(game.id, 0) // red
            await api.makeMove(game.id, 1) // yellow
            await api.makeMove(game.id, 0) // r
            await api.makeMove(game.id, 1) // y
            await api.makeMove(game.id, 0) // r
            await api.makeMove(game.id, 1) // y
            const finalGame = await api.makeMove(game.id, 0) // red wins

            expect(finalGame.endState).toBe('red')

            // Try to make another move
            const unchangedGame = await api.makeMove(game.id, 2)
            expect(unchangedGame).toEqual(finalGame)
        })
    })

    describe('getGame', () => {
        it('should return undefined for non-existent game', async () => {
            await expect(api.getGame('non-existent-id')).rejects.toThrow('game not found')
        })

        it('should return the correct game state', async () => {
            const createdGame = await api.createGame()
            const retrievedGame = await api.getGame(createdGame.id)

            expect(retrievedGame).toEqual(createdGame)
        })

        it('should return updated game state after moves', async () => {
            const game = await api.createGame()
            await api.makeMove(game.id, 3)
            const updatedGame = await api.getGame(game.id)

            expect(updatedGame?.grid[5][3]).toBe('red')
            expect(updatedGame?.currentPlayer).toBe('yellow')
        })

    })
}
)