import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { type ChosenCol, type Game as GameState } from './game/game'
import Confetti from 'react-confetti'
import { Connect4ClientApi } from './api'
import { useLoaderData, useNavigate } from 'react-router'
import { io } from "socket.io-client"
import { GAME_UPDATED, USER_JOINED } from "../constants"

export default function GameView() {
    // client api will call the routes which will call the server api
    const api = useMemo(() => new Connect4ClientApi, [])

    const { game: initialGame } = useLoaderData<{ game: GameState }>()
    console.log("we just loaded data:", initialGame)
    const navigate = useNavigate()

    const [gameState, setGameState] = useState<GameState | undefined>(initialGame)

    async function initializeGame() {
        const initialGameState = await api.createGame()
        setGameState(initialGameState)
        const id = initialGameState.id
        navigate(`/game/${id}`)
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

    const handleReset = async (): Promise<void> => {
        // after user hits reset, create new game, and direct to the new game url
        // so when user refreshes page it is the new game that shows not the previous one
        setConfettiOn(false)
        const newGameState = await api.createGame()
        const id = newGameState.id
        setGameState(newGameState)
        navigate(`/game/${id}`)
    }

    useEffect(() => {
        // need to check for gameState else socket will connect and setGameState to null, which causes a bug for lobby's create new game when navigating to game/id(null)
        if (gameState) {
            const socket = io("http://localhost:3000") // creates new socket io client
            socket.on("connect", () => { // runs when socket is connected
                console.log("connected to socket")
                socket.emit("join-game", gameState?.id)
                socket.on(USER_JOINED, (userId: string) => console.log(`user ${userId} joined`)) // userId is the socket.id emitted from server
                socket.on(GAME_UPDATED, (game: GameState) => {
                    console.log("game updated", game)
                    setGameState(game)
                })
            })
            return () => { socket.disconnect() }
        }
    }, [gameState?.id])


    if (!gameState) {
        return (
            <div>loading...</div>
        )
    }

    return (
        <>
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

                {/* <button onClick={() => { initializeGame(); setConfettiOn(false) }} style={{ margin: '1rem' }}>Reset</button> */}
                {/* <button onClick={() => { setConfettiOn(false); setGameState(undefined); navigate('/game/new') }} style={{ margin: '1rem' }}>Reset</button> */}
                <button onClick={handleReset} style={{ margin: '1rem' }}>Reset</button>
                <button onClick={() => navigate('/')} >back to lobby</button>
            </div >
        </>
    )

}
