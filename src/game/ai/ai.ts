// run this with bun ai.ts
import { type Grid, type Player, calculateEndState } from "../game";

let endGridArray: Grid[] = []
let endWinGridArray: Grid[] = []
let endLossGridArray: Grid[] = []

const endGridSet: Set<string> = new Set()
const endWinGridSet: Set<string> = new Set()
const endNonWinGridSet: Set<string> = new Set()

// track seen grids to avoid duplicate work
const seenGridSet: Set<string> = new Set()

function genEndGrid(endNumFilled: number, currentNumFilled: number, currentGrid: Grid, currentPlayer: Player): Grid | undefined {
    // console.log(`genEndGrid: ${endNumFilled}, ${currentNumFilled}, ${currentGrid}, ${currentPlayer}`)
    if (seenGridSet.has(JSON.stringify(currentGrid)))
        return undefined
    else
        seenGridSet.add(JSON.stringify(currentGrid))

    if (currentNumFilled === endNumFilled) {
        // endGridArray.push(currentGrid)
        endGridSet.add(JSON.stringify(currentGrid))
        console.log(`"return currentGrid: ${currentGrid}`)
        const endState = calculateEndState({
            id: "",
            grid: currentGrid,
            currentPlayer: currentPlayer,
        })

        const correctedPlayer = currentPlayer === "red" ? "yellow" : "red"
        console.log(`endState ${endState}, correctedPlayer ${correctedPlayer}`)
        if (endState === correctedPlayer) {
            // endWinGridArray.push(currentGrid)
            endWinGridSet.add(JSON.stringify(currentGrid))
        }

        else if (endState !== correctedPlayer && endState !== 'draw') {
            // endLossGridArray.push(currentGrid)
            endNonWinGridSet.add(JSON.stringify(currentGrid))
        }
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

// genEndGrid(7, 0, Array.from({ length: 6 }, () => Array(7).fill(null)), 'red')
genEndGrid(9, 0, Array.from({ length: 6 }, () => Array(7).fill(null)), 'red')
console.log(endGridArray.length)
console.log(endWinGridArray.length)
console.log(endLossGridArray.length)
console.log(endGridSet.size)
console.log(endWinGridSet.size)
console.log(endNonWinGridSet.size)
// printed counts for 7 filled cells:
// 823536
// 13032
// 810504
// 54859
// 728
// 54131

// set counts for 8 filled cells
// 186389
// 1945
// 184444

// set counts for 9
// 567441
// 23413
// 544028