import { immerable } from "immer"
import { a } from "../../../../eny/src"
import UUID from "./util/Id"
import Card from "./Card"
import { privacy } from "./types"

const { shuffle } = a

interface ICardGroupProps {
  id?: string
  cards: Card[]
  ownedBy: string | null
  rotated: 0
}

const CardGroupDefaults: ICardGroupProps = {
  cards: [],
  ownedBy: null,
  rotated: 0,
}

export default class CardGroup {
  [immerable] = true

  cards: Card[]

  class: string

  id: UUID

  ownedBy: string | null

  privacy: privacy

  rotated: number

  constructor({
    id,
    cards = [],
    ownedBy = null,
    rotated = 0,
  }: ICardGroupProps = CardGroupDefaults) {
    this.id = new UUID(id)
    this.class = `CardGroup`
    this.cards = cards
    this.privacy = `public`
    this.ownedBy = ownedBy
    this.rotated = rotated
  }

  add(newCard: Card, idx = 0): void {
    this.cards.splice(idx, 0, newCard)
  }
}

export class Deck extends CardGroup {
  constructor(props: ICardGroupProps) {
    super(props)
    this.class = `Deck`
    this.privacy = `public`
  }

  shuffle = (): void => (this.cards = shuffle(this.cards))

  draw = (): Card | undefined => this.cards.shift()
}
