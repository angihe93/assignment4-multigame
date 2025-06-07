// precompute optimal moves and upload to DB table
// run this with DATABASE_URL="..." bun precomputeAi.ts
import dotenv from "dotenv"
import { drizzle } from 'drizzle-orm/postgres-js'
import { type miniMaxNode, genEndGrid, calcUtilitiesBestMoves } from "./ai"
import { type Grid, type EndState, type ChosenCol } from "../game"
import { optimalMovesTable } from '../../db/schema'

dotenv.config()

let endGridArray: Grid[] = []
let endWinGridArray: Grid[] = []
let endLossGridArray: Grid[] = []

const endGridSet: Set<string> = new Set()
const endWinGridSet: Set<string> = new Set()
const endNonWinGridSet: Set<string> = new Set()

// track seen grids to avoid duplicate work
const seenGridSet: Set<string> = new Set()

// stores end states for finished games, for easy retrieval later to get end state utilities
const endGridGameMap: Map<Grid, EndState> = new Map()

const miniMaxMap: Map<string, Set<miniMaxNode>> = new Map()

// for given current grid, contains optimal move by current player
// contains optimal moves for both starting and non-starting player
export const optimalMoveMap: Map<string, ChosenCol> = new Map()
// SEPARATE INTO STARTING AND OTHER PLAYER??

// track seen grids in calcUtilities to avoid duplicate work
const seenGridSet2: Set<string> = new Set()

genEndGrid(7, 0, Array.from({ length: 6 }, () => Array(7).fill(null)), 'red', seenGridSet, endGridArray, endGridGameMap)
// genEndGrid(8, 0, Array.from({ length: 6 }, () => Array(7).fill(null)), 'red')
console.log(endGridArray.length)
console.log(endWinGridArray.length)
console.log(endLossGridArray.length)

let counter = 0
for (const grid of endGridArray) {
    counter += 1
    console.log(counter)
    // lastMovedPlayer would be same/diff from startingPlayer depending on how many cells are filled in at game end
    calcUtilitiesBestMoves('red', 'red', grid, seenGridSet2, miniMaxMap, endGridGameMap, optimalMoveMap)
    // calcUtilities('red', 'yellow', grid)
}
console.log(optimalMoveMap.size)


const url = process.env.DATABASE_URL
if (!url)
    throw new Error('DB url not set!')

const db = drizzle(url)

for (const [gridStr, move] of optimalMoveMap.entries()) {
    await db.insert(optimalMovesTable).values({
        grid: gridStr,
        move: move
    })
}