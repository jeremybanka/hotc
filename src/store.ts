import create, { State } from 'zustand/vanilla'
import produce from 'immer'

const store = create<State>((
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  set, get
) => ({
  set: fn => set(produce(fn)),
}))

export default store
export const {
  getState,
  setState,
  subscribe,
  destroy,
} = store
