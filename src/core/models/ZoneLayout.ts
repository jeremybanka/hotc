import { immerable } from "immer"
import { ZoneId, ZoneLayoutId } from "../util/Id"

interface IZoneLayoutProps {
  id?: string
}

export class ZoneLayout {
  [immerable] = true

  id: ZoneLayoutId

  content: (ZoneId|ZoneLayoutId)[]

  constructor({ id }: IZoneLayoutProps) {
    this.id = new ZoneLayoutId(id)
    this.content = []
  }
}
