import { immerable } from "immer"
import { Zone } from "."

export class ZoneLayout {
  [immerable] = true

  id: string

  content: (Zone|ZoneLayout)[]

  constructor() {
    this.id = `foo`
    this.content = []
  }
}
