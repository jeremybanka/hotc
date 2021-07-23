import { immerable } from "immer"
import Zone from "./Zone"

export default class ZoneLayout {
  [immerable] = true

  id: string

  content: (Zone|ZoneLayout)[]

  constructor() {
    this.id = `foo`
    this.content = []
  }
}
