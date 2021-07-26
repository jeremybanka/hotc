import { immerable } from "immer"
import { a } from "eny/build/node"
import { CardGroupId, CardId, PlayerId } from "../util/Id"
import { privacy } from "./types"

const { shuffle } = a

export interface ICardGroupProps {
  id?: string
  cards: CardId[]
  ownerId: PlayerId | null
  rotated: 0
}

const CardGroupDefaults: ICardGroupProps = {
  cards: [],
  ownerId: null,
  rotated: 0,
}

export class CardGroup {
  [immerable] = true

  cards: CardId[]

  class: string

  id: CardGroupId

  ownerId: PlayerId | null

  privacy: privacy

  rotated: number

  constructor({
    id,
    cards = [],
    ownerId = null,
    rotated = 0,
  }: ICardGroupProps = CardGroupDefaults) {
    this.id = new CardGroupId(id)
    this.class = `CardGroup`
    this.cards = cards
    this.privacy = `public`
    this.ownerId = ownerId
    this.rotated = rotated
  }

  add(newCard: CardId, idx = 0): void {
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

  draw = (): CardId => {
    const drawnCard = this.cards.shift()
    if (!drawnCard) throw new Error(`deck is empty`)
    return drawnCard
  }
}

export class Hand extends CardGroup {
  constructor(props:ICardGroupProps) {
    super(props)
    this.class = `Hand`
    this.privacy = `secret`
  }
}
