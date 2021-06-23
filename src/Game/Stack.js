import { v4 as genId } from "uuid"
import { a } from "./lab/eny/build/node"

const { shuffle } = a

export default class Stack {
  constructor(
    { id = genId(), cards = [], ownedBy = null, livesIn = null, rotated = 0 } = {
      id: genId(),
      cards: [],
      ownedBy: null,
      livesIn: null,
      rotated: 0,
    }
  ) {
    this.id = id
    this.class = `Stack`
    this.cards = cards
    this.privacy = `public`
    this.ownedBy = ownedBy
    this.livesIn = livesIn
    this.rotated = rotated
  }

  add(newCard, idx = 0) {
    this.cards.splice(idx, 0, newCard)
  }
}

export class Deck extends Stack {
  constructor(props) {
    super(props)
    this.class = `Deck`
    this.privacy = `public`
  }

  shuffle() {
    this.cards = shuffle(this.cards)
  }

  draw() {
    return this.cards.shift()
  }
}
