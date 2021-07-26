import { CardCycleId, CardGroupId } from "../util/Id"

export class CardCycle {
 id:CardCycleId

 cardGroupIds: CardGroupId[]

 constructor() {
   this.id = new CardCycleId()
   this.cardGroupIds = []
 }
}
