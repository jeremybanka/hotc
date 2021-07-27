import { immerable } from "immer"
import { CardGroupId, CardId, PlayerId, TrueId, ZoneId } from "../util/Id"
import { Card } from "./Card"
import { CardGroup } from "./CardGroup"

type typeCheckable = {prototype:{constructor:{name:string}}}

interface IZoneProps {
  id?: string
  ownerId?: PlayerId
  contentType?: null | `Card` | `Deck` | `Pile`
  content?: CardGroup | Card
}

export class Zone<T extends |CardGroupId|CardId> {
  [immerable] = true

  id: ZoneId

  ownerId: PlayerId | null

  contentType: null | `Card` | `Deck` | `Pile`

  content: null | CardId | CardGroupId

  constructor({ id, ownerId, contentType, content }: IZoneProps) {
    this.id = new ZoneId(id)
    this.ownerId = ownerId || null
    this.contentType = contentType || null
    this.content = content?.id || null
  }

  place = (entity:T): void => {
    if (this.content) throw new Error(`zone is full`)
    if (this.contentType) {
      const entityCheckable = entity as unknown as typeCheckable // pure evil 🤡
      const entityType = entityCheckable.prototype.constructor.name
      if (entityType !== this.contentType) {
        throw new Error(`the placed entity does not match the contentType`)
      }
    }
  }
}
