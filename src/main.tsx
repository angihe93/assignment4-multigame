import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'
import GameLobby from './GameLobby.tsx'
import GameView from './GameView'
import { Connect4ClientApi } from './api.ts'

const api = new Connect4ClientApi

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "/",
        Component: GameLobby,
        loader: async () => {
          const games = await api.getGames()
          return { games } // brackets return an object {games: games}
        }
      },
      {
        path: "/game/:gameId",
        Component: GameView,
        loader: async ({ params }) => {
          // TODO: display no game matching id on the page
          if (!params.gameId) {
            throw new Error("Game ID is required")
          }
          const game = await api.getGame(params.gameId)
          return { game }
        }
      },
      {
        path: "/game/new",
        Component: GameView,
        loader: async () => {
          const game = null
          return { game }
        }
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
