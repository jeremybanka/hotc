import { immerable } from "immer"
import { a } from "eny/build/node"
import { CardGroupId, CardId, PlayerId } from "../util/Id"
import { privacy } from "./types"

const { shuffle } = a

export interface ICardGroupProps {
  id?: string
  cardIds?: CardId[]
  ownerId?: PlayerId | null
  rotated?: 0
}

export class CardGroup {
  [immerable] = true

  cardIds: CardId[]

  class: string

  id: CardGroupId

  ownerId: PlayerId | null

  privacy: privacy

  rotated: number

  constructor({
    id,
    cardIds = [],
    ownerId = null,
    rotated = 0,
  }:ICardGroupProps) {
    this.id = new CardGroupId(id)
    this.class = `CardGroup`
    this.cardIds = cardIds
    this.privacy = `public`
    this.ownerId = ownerId
    this.rotated = rotated
  }

  add(newCard: CardId, idx = 0): void {
    this.cardIds.splice(idx, 0, newCard)
  }
}

export class Deck extends CardGroup {
  constructor(props: ICardGroupProps) {
    super(props)
    this.class = `Deck`
    this.privacy = `public`
  }

  shuffle = (): void => (this.cardIds = shuffle(this.cardIds))

  draw = (): CardId => {
    const drawnCard = this.cardIds.shift()
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
