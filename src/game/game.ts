// connect4
// two players, drop disc into 7colx6row grid

export type Player = 'red' | 'yellow';
export type Cell = Player | null;
export type Grid = Cell[][];
export type ChosenCol = 0 | 1 | 2 | 3 | 4 | 5 | 6; // column index where the player wants to drop their disc
export type EndState = 'red' | 'yellow' | 'draw' | undefined | null;

export type Game = {
    id: string,
    grid: Grid,
    currentPlayer: Player,
    endState?: EndState,
}

export const initialGameState = (): Game => {
    return {
        id: crypto.randomUUID(),
        grid: Array.from({ length: 6 }, () => Array(7).fill(null)),
        currentPlayer: 'red',
        endState: null
    }
}

export function calculateEndState(game: Game) {
    // count if currentPlayer has 4 cells in a row
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = game.grid[row][col];
            if (cell === null) continue;

            // Check horizontal
            if (col <= 3 && game.grid[row].slice(col, col + 4).every(c => c === cell)) {
                return cell;
            }
            // Check vertical
            if (row <= 2 && game.grid.slice(row, row + 4).every(r => r[col] === cell)) {
                return cell;
            }
            // Check diagonal down-right
            if (row <= 2 && col <= 3 && [0, 1, 2, 3].every(i => game.grid[row + i][col + i] === cell)) {
                return cell;
            }
            // Check diagonal down-left
            if (row <= 2 && col >= 3 && [0, 1, 2, 3].every(i => game.grid[row + i][col - i] === cell)) {
                return cell;
            }
        }
    }
    // Check for draw ie. grid is full
    if (game.grid.every(row => row.every(cell => cell !== null))) {
        return 'draw';
    }
    return undefined;
}

export function move(game: Game, chosenCol: ChosenCol): Game {
    if (game.grid[0][chosenCol] != null) {
        return game; // column is full
    }
    if (game.endState) return game // game has ended
    const nextGame = structuredClone(game);
    // find highest row occupied in chosenCol
    let row = 5;
    for (row = 5; row >= 0; row--) {
        if (nextGame.grid[row][chosenCol] === null) {
            break;
        }
    }
    nextGame.grid[row][chosenCol] = game.currentPlayer;
    nextGame.endState = calculateEndState(nextGame);
    nextGame.currentPlayer = nextGame.currentPlayer === 'red' ? 'yellow' : 'red';
    return nextGame;
}