import { GameId, PlayerId, TrueId, VirtualId } from "./util/Id"
import Player from "./Player"
import Card from "./Card"
import CardGroup from "./CardGroup"

type action = `draw` | `undraw`

interface Zone {
  content: Card | CardGroup
}

interface Layout {
  zones: Zone[]
}

interface GameState {
  table: Map<PlayerId, Player>
  turnOrder: PlayerId[]
  layouts: {
    common: Layout,
    individual: Map<PlayerId, Layout[]>
  }
}

// export default class Game {
//   id: GameId

//   startingStateSnapshot: GameState

//   state: GameState

//   players: Record<string, Player>

//   constructor() {
//     this.id = new GameId()
//     this.players = {}
//     this.state = {
//       turnOrder: [],
//     }
//     this.startingStateSnapshot = {
//       players: new Map(), turnOrder: [],
//     }
//   }
// }
