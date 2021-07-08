import { CardId } from "./util/Id"
import { privacy } from "./types"

export default class Card {
  id: CardId

  ownedBy: string | null

  privacy: privacy

  rotated: number

  constructor() {
    this.id = new CardId()
    this.ownedBy = null
    this.privacy = `public`
    this.rotated = 0
  }

  straighten(): void {
    this.rotated = 0
  }

  reveal(): void {
    this.privacy = `public`
  }

  hide(): void {
    this.privacy = `hidden`
  }

  seclude(): void {
    this.privacy = `secret`
  }

  // recall(game: Game): void {
  //   if (this.ownedBy === null) return
  //   const owner = game.players.find(player => player.id === this.ownedBy)
  //   owner.present(this)
  // }

  // replace(game: Game): void {
  //   if (this.ownedBy === null) return
  //   const owner = game.players.find(player => player.id === this.ownedBy)
  //   const abode = owner.cycles.find(cycle => cycle.id === this.ownedBy)
  //   abode[this.livesIn].recollect(this)
  // }
}
