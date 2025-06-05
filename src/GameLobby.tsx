import { Link, useLoaderData } from "react-router"
import type { Game as GameState } from './game/game'
import { useState } from "react"
// import './App.css'
// import './index.css'
import './gameLobby.css'

export default function GameLobby() {

    const { games: initialGames } = useLoaderData<{ games: { open: GameState[], closed: GameState[] } }>()

    // const [games, setGames] = useState<GameState[]>(initialGames)
    // display currently open games (ie. no result yet), and <= 10 completed games
    const [openGames, setOpenGames] = useState<GameState[]>(initialGames.open)
    const [closedGames, setClosedGames] = useState<GameState[]>(initialGames.closed)

    return (
        <div>
            {/* fix tailwind and plain css styles conflicting and making GameView table weird */}
            {/* maybe just use one or the other */}
            {/* for now use plain css, later try use tailwind only for whole app*/}
            {/* <div className='flex-col justify-center my-15' style={{}}> */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '5rem', marginBottom: '5rem' }}>
                {/* <h2 className='text-3xl font-bold'>Game Lobby</h2> */}
                <h1>Game Lobby</h1>
                {/* <div className='my-5'> */}
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    Click to join a game, or
                    <Link to="/game/new">
                        {/* <span className='bg-white rounded-lg ml-1'> start a new game </span> */}
                        <span style={{ backgroundColor: 'white', borderRadius: '0.5rem', marginLeft: '0.5rem' }}> start a new game </span>
                    </Link>
                </div>

                {/* <div className='bg-white opacity-70'> */}
                <div style={{ backgroundColor: 'white', opacity: 0.7, height: '300px', overflowY: 'auto' }}>
                    {openGames.map(game => (
                        <div key={game.id}>
                            <Link to={`/game/${game.id}`}>{game.id}</Link>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>Recent games</div>
                <div style={{ backgroundColor: 'white', opacity: 0.7 }}>
                    {closedGames.map(game => (
                        <div key={game.id}>
                            <Link to={`/game/${game.id}`}>{game.id}</Link>
                        </div>
                    ))}
                </div>
            </div>
        </div >

    )
}
