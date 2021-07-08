import Id from "../src/models/global/util/Id"

describe(`Id ctor`, () => {
  it(`makes a new Id`, () => {
    const id = new Id()
    console.log(id.toString())
    expect(id).toBeInstanceOf(Id)
  })
})
