import { v4 as genId } from "uuid"

export default class Card {
  constructor(content) {
    this.id = genId()
    this.content = content
    this.ownedBy = null
    this.livesIn = null
    this.privacy = `public`
    this.rotated = 0
  }

  straighten() {
    this.rotated = 0
  }

  reveal() {
    this.privacy = `public`
  }

  hide() {
    this.privacy = `hidden`
  }

  seclude() {
    this.privacy = `secret`
  }

  recall(game) {
    if (this.belongsTo === null) return false
    const owner = game.players.find(player => player.id === this.belongsTo)
    owner.present(this)
  }

  replace(game) {
    if (this.belongsTo === null) return false
    const owner = game.players.find(player => player.id === this.belongsTo)
    const abode = owner.cycles.find(cycle => cycle.id === this.belongsTo)
    abode[this.livesIn].recollect(this)
  }
}
