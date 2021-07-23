import { immerable } from "immer"
import Card from "./Card"
import CardGroup from "./CardGroup"
import { ZoneId } from "./util/Id"

export default class Zone {
  [immerable] = true

  id: ZoneId

  content: null|Card|CardGroup

  constructor() {
    this.id = new ZoneId()
    this.content = null
  }
}
