// run this with bun ai.ts
import { type ChosenCol, type Grid, type Player, type Game, calculateEndState, type EndState } from "../game";

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

type miniMaxNode = {
    utility: number, // utility for starting player
    move?: ChosenCol
}

function genEndGrid(endNumFilled: number, currentNumFilled: number, currentGrid: Grid, currentPlayer: Player): Grid | undefined {
    // console.log(`genEndGrid: ${endNumFilled}, ${currentNumFilled}, ${currentGrid}, ${currentPlayer}`)
    if (seenGridSet.has(JSON.stringify(currentGrid)))
        return undefined
    else
        seenGridSet.add(JSON.stringify(currentGrid))

    // check if a winner already exists, if so, can't keep filling grid
    if (currentNumFilled >= 7) {
        const endState = calculateEndState({
            id: "",
            grid: currentGrid,
            currentPlayer: currentPlayer,
        })
        if (endState && currentNumFilled < endNumFilled)
            return undefined
    }

    if (currentNumFilled === endNumFilled) {
        endGridArray.push(currentGrid)
        // endGridSet.add(JSON.stringify(currentGrid))
        // console.log(`"return currentGrid: ${currentGrid}`)
        const endState = calculateEndState({
            id: "",
            grid: currentGrid,
            currentPlayer: currentPlayer,
        })

        endGridGameMap.set(currentGrid, endState)

        // sanity checks, take out later
        const correctedPlayer = currentPlayer === "red" ? "yellow" : "red"
        // console.log(`endState ${endState}, correctedPlayer ${correctedPlayer}`)
        if (endState === correctedPlayer) {
            endWinGridArray.push(currentGrid)
            // endWinGridSet.add(JSON.stringify(currentGrid))
        }
        else if (endState !== correctedPlayer && endState !== 'draw') {
            endLossGridArray.push(currentGrid)
            // endNonWinGridSet.add(JSON.stringify(currentGrid))
        }

        return currentGrid
    }

    // If any col has opening, can fill
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


// maps parent state to set of its children's utility and move
// use string of grid for key so can get item by value rather than reference
const miniMaxMap: Map<string, Set<miniMaxNode>> = new Map()

// for given current grid, contains optimal move by current player
const optimalMoveMap: Map<string, ChosenCol> = new Map()
// SEPARATE INTO STARTING AND OTHER PLAYER??

// this calculates utility for startingPlayer
// function calcUtilities(startingPlayer: Player, lastMovedPlayer: Player, grid: Grid, childGrids: Grid[]) {
function calcUtilities(startingPlayer: Player, lastMovedPlayer: Player, grid: Grid) {
    // TODO
    // base case: when to stop?? when grid is all null

    let utility

    if (!miniMaxMap.get(JSON.stringify(grid))) { // at leaves ie. game end, we get utility from endGridGameMap
        const endState: EndState = endGridGameMap.get(grid)
        const otherPlayer = startingPlayer === "red" ? "yellow" : "red"
        if (endState === startingPlayer)
            utility = 1
        else if (endState === otherPlayer)
            utility = -1
        else
            utility = 0
        // miniMaxMap.set(grid, { utility: utility })
        // set childGridsMap instead??
        miniMaxMap.set(JSON.stringify(grid), new Set<miniMaxNode>([{ utility: utility }]))
    }

    else { // non leaf, look at children to get utility for starting player
        const childNodes = miniMaxMap.get(JSON.stringify(grid))
        // let bestMove
        let bestUtility = -2

        if (childNodes) {

            // Get utility
            for (const childNode of childNodes) {
                if (childNode.utility > bestUtility) {
                    bestUtility = childNode.utility
                    if (bestUtility === 1)
                        break
                }
            }

            // Compute optimal move
            // if lastMovedPlayer != startingPlayer, we compute for the starting player's next move, ie. we try to maximize utility
            // else we are compute for the non-starting player's next move, ie. we minimize utility

            // if (lastMovedPlayer !== startingPlayer) {
            //     bestUtility = -2
            //     for (const childNode of childNodes) {
            //         if (childNode.utility > bestUtility) {
            //             bestMove = childNode.move

            //             if (bestUtility === 1)
            //                 break
            //         }
            //     }
            // }
            // else {
            //     bestUtility = 2
            //     for (const childNode of childNodes) {
            //         if (childNode.utility < bestUtility) {
            //             bestMove = childNode.move
            //             // set stuff?

            //             if (bestUtility === -1)
            //                 break
            //         }
            //     }
            // }
        }

        utility = bestUtility
        console.log("grid", grid)
        console.log("utility", utility)

        // optimalMoveMap.set(JSON.stringify(grid), bestMove!)

        // Generate params for the next calcUtilities call for one level above in tree
        const newLastMovedPlayer = lastMovedPlayer === "red" ? "yellow" : "red"
        for (let col = 0; col < 7; col++) {
            let row = 6
            for (row = 6; row >= 1; row--) {
                if (grid[row - 1][col] === null) {
                    break
                }
            }
            // clone grid and remove a top most filled cell by last moved player
            if (row < 6 && grid[row][col] === lastMovedPlayer) {

                let prevGrid: Grid = structuredClone(grid)
                prevGrid[row][col] = null

                if (miniMaxMap.get(JSON.stringify(prevGrid)))
                    miniMaxMap.get(JSON.stringify(prevGrid))?.add({ utility: utility!, move: col as ChosenCol })
                else {
                    // why isn't this called??
                    calcUtilities(startingPlayer, newLastMovedPlayer, prevGrid)
                }
            }
        }

    }
}

// function to get best move at each cell for given grid and currentPlayer


// for debugging:
// genEndGrid(7, 0, Array.from({ length: 6 }, () => Array(7).fill(null)), 'red')
genEndGrid(9, 0, Array.from({ length: 6 }, () => Array(7).fill(null)), 'red')
console.log(endGridArray.length)
console.log(endWinGridArray.length)
console.log(endLossGridArray.length)
console.log(endGridSet.size)
console.log(endWinGridSet.size)
console.log(endNonWinGridSet.size)


for (const grid of endGridArray) {
    // lastMovedPlayer would be same/diff from startingPlayer depending on how many cells are filled in at game end
    calcUtilities('red', 'red', grid)
    // calcUtilities('red', 'yellow', grid)
}

// consonle.log(miniMaxMap)
const gridsWithUtility1: string[] = []
const gridsWithUtility0: string[] = []
const gridsWithUtilityNeg1: string[] = []
for (const [gridKey, nodeSet] of miniMaxMap.entries()) {
    for (const node of nodeSet) {
        if (node.utility === 1) {
            gridsWithUtility1.push(gridKey)
            // break // Only need to add once per grid
            if (gridsWithUtility1.length > 5)
                break
        }
        else if (node.utility === 0) {
            gridsWithUtility0.push(gridKey)
            // break // Only need to add once per grid
            if (gridsWithUtility0.length > 5)
                break
        }
        else if (node.utility === -1) {
            gridsWithUtilityNeg1.push(gridKey)
            // break // Only need to add once per grid
            if (gridsWithUtilityNeg1.length > 5)
                break
        }
    }
}

console.log('gridsWithUtility1', gridsWithUtility1)
console.log('gridsWithUtility0', gridsWithUtility0)
console.log('gridsWithUtilityNeg1', gridsWithUtilityNeg1)

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
