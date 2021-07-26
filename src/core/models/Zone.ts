import { immerable } from "immer"
import { Card, CardGroup } from "."
import { ZoneId } from "../util/Id"

export class Zone {
  [immerable] = true

  id: ZoneId

  content: null|Card|CardGroup

  constructor() {
    this.id = new ZoneId()
    this.content = null
  }
}
