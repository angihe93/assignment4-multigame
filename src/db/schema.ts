import { jsonb, pgTable, smallint, text, varchar } from "drizzle-orm/pg-core"
import type { Grid } from "../game/game"

export const gamesTable = pgTable("connect4_games", {
    id: varchar({ length: 255 }).primaryKey(),
    currentPlayer: varchar({ length: 255 }).notNull(),
    aiPlayer: varchar({ length: 255 }),
    grid: jsonb().$type<Grid>().notNull(),
    result: varchar({ length: 255 }),
})

export const optimalMovesTable = pgTable("connect4_optimal_moves", {
    grid: text().primaryKey(),
    move: smallint()
})