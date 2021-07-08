import { GameId, PlayerId, TrueId, VirtualId } from "../../util/Id"
import Player from "./Player"

type action = `draw` | `undraw`

interface Request {
  targets: VirtualId[]
  action: action
}

interface Event {
  from: PlayerId
  action: action
  targets: TrueId[]
}

interface VirtualEvent {
  from: PlayerId
  action: action
  targets: VirtualId[]
}

interface GameState {
  players: Map<PlayerId, Player>
  turnOrder: PlayerId[]
  dealer: PlayerId
}

export default class Game {
  id: GameId

  startingStateSnapshot: GameState

  state: GameState

  players: Record<string, Player>

  constructor() {
    this.id = new GameId()
    this.players = {}
    this.state = { players: new Map(), turnOrder: [], dealer: new PlayerId() }
    this.startingStateSnapshot = {
      players: new Map(), turnOrder: [], dealer: new PlayerId(),
    }
  }
}
