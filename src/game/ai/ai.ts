// run this with bun ai.ts
import { type Grid, type Player, calculateEndState } from "../game";

let endGridArray: Grid[] = []
let endWinGridArray: Grid[] = []
let endLossGridArray: Grid[] = []

function genEndGrid(endNumFilled: number, currentNumFilled: number, currentGrid: Grid, currentPlayer: Player): Grid | undefined {
    console.log(`genEndGrid: ${endNumFilled}, ${currentNumFilled}, ${currentGrid}, ${currentPlayer}`)

    if (currentNumFilled === endNumFilled) {
        endGridArray.push(currentGrid)
        console.log(`"return currentGrid: ${currentGrid}`)
        const endState = calculateEndState({
            id: "",
            grid: currentGrid,
            currentPlayer: currentPlayer,
        })

        const correctedPlayer = currentPlayer === "red" ? "yellow" : "red"
        console.log(`endState ${endState}, correctedPlayer ${correctedPlayer}`)
        if (endState === correctedPlayer)
            endWinGridArray.push(currentGrid)
        else if (endState !== correctedPlayer && endState !== 'draw')
            endLossGridArray.push(currentGrid)
        return currentGrid
    }

    // if any col has opening, can fill
    for (let col = 0; col < 7; col++) {
        if (currentGrid[0][col] === null) {
            let currentGridClone: Grid = structuredClone(currentGrid)
            // make move on grid with chosen col
            // find lowest row with space, ie. find highest row occupied in col
            let row = 5
            for (row = 5; row >= 0; row--) {
                if (currentGrid[row][col] === null) {
                    break
                }
            }
            currentGridClone[row][col] = currentPlayer
            // return genEndGrid(endNumFilled, currentNumFilled + 1, currentGridClone, currentPlayer === 'red' ? 'yellow' : 'red')
            genEndGrid(endNumFilled, currentNumFilled + 1, currentGridClone, currentPlayer === 'red' ? 'yellow' : 'red')
        }
    }
    // If no move is possible, return undefined
    return undefined;
}

genEndGrid(8, 0, Array.from({ length: 6 }, () => Array(7).fill(null)), 'red')
console.log(endGridArray.length)
console.log(endWinGridArray.length)
console.log(endLossGridArray.length)