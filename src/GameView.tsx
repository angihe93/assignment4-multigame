import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { type ChosenCol, type Game as GameState } from './game/game'
import Confetti from 'react-confetti'
import { Connect4ClientApi } from './api'
import { useLoaderData, useNavigate } from 'react-router'

export default function GameView() {
    // client api will call the routes which will call the server api
    const api = useMemo(() => new Connect4ClientApi, [])

    const { game: initialGame } = useLoaderData<{ game: GameState }>()
    const navigate = useNavigate()

    const [gameState, setGameState] = useState<GameState | undefined>(initialGame)

    async function initializeGame() {
        const initialGameState = await api.createGame()
        setGameState(initialGameState)
    }
    useEffect(() => {
        if (!gameState)
            initializeGame()
    }, [])

    const [confettiOn, setConfettiOn] = useState(false);
    const [flashOn, setFlashOn] = useState(false);

    const colClick = async (col: ChosenCol) => {
        console.log(col)
        if (!gameState || gameState.endState) return; // game is not ready or is over, do nothing
        const audio = new Audio('/mixkit-video-game-retro-click-237.wav');
        audio.play();
        const updatedGameState = await api.makeMove(gameState.id, col)
        setGameState(updatedGameState)
    }

    const capitalizeString = (str: string): string => {
        return str[0].toUpperCase() + str.slice(1);
    }

    function endStateUI() {
        if (!gameState) return
        if (gameState.endState) {
            const audio = new Audio('/mixkit-final-level-bonus-2061.wav');
            audio.play();
            if (gameState.endState === 'red' || gameState.endState === 'yellow') {
                setConfettiOn(true);
                setFlashOn(true);
                setTimeout(() => { setConfettiOn(false) }, 7000);
                setTimeout(() => { setFlashOn(false) }, 2000);
            }
        }
    }
    useEffect(() => {
        endStateUI()
    }, [gameState])

    console.log(gameState)

    if (!gameState) {
        return (
            <div>loading...</div>
        )
    }

    return (
        <>
            {/* style={{ all: 'unset' }} */}


            <div>

                <h1>Connect 4</h1>

                {!gameState.endState && <div style={{ margin: '1rem' }}>Player: {capitalizeString(gameState.currentPlayer)}'s turn</div>}
                {
                    gameState.endState === 'yellow' || gameState.endState === 'red' ?
                        <>
                            {confettiOn && <Confetti gravity={0.4} />}
                            <div style={{ margin: '1rem' }}>Winner: {capitalizeString(gameState.endState)} 🎉</div> </> :
                        gameState.endState === 'draw' ?
                            <div style={{ margin: '1rem' }}>Draw</div> : ''
                }

                {flashOn && gameState.endState === 'red' && <div className="flash-overlay" style={{ background: 'rgba(255,0,0,0.3)' }} />}
                {flashOn && gameState.endState === 'yellow' && <div className="flash-overlay" style={{ background: 'rgba(255,255,0,0.3)' }} />}

                <table>
                    <thead>
                        <tr className="row">
                            {[0, 1, 2, 3, 4, 5, 6].map(
                                (col) => <th style={{ margin: '1rem' }} className="cell"
                                    onClick={() => colClick(col as ChosenCol)}>
                                    {col}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {gameState.grid.map((row, rowIndex) => (
                            <tr key={rowIndex} className="row">
                                {row.map((cell, colIndex) => (
                                    <td key={colIndex} style={{ margin: '1rem' }} className="cell">
                                        {cell === 'red' ? '🔴' : cell === 'yellow' ? '🟡' : ' '}
                                    </td>
                                ))}
                            </tr>
                        )
                        )}
                    </tbody>
                </table>

                {/* TODO: after hitting reset, and user refresh the page the old game still shows bc url hasn't changed
                try update the loader url  */}
                <button onClick={() => { initializeGame(); setConfettiOn(false) }} style={{ margin: '1rem' }}>Reset</button>
                <button onClick={() => navigate('/')} >back to lobby</button>
            </div >
        </>
    )

}
