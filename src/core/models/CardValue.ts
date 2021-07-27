import { CardValueId } from "../util/Id"
import { ICardGroupProps } from "./CardGroup"

interface ICardValueProps {
  id?: string
  content: unknown
}

export class CardValue {
  id: CardValueId

  content: unknown

  constructor({ id, content } : ICardValueProps) {
    this.id = new CardValueId(id)
    this.content = content
  }
}
