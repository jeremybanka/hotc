const mapObject
= <I, O> (
  obj: Record<string, I>,
  fn: (val: I) => O
)
: Record<string, O> => {
  const newObj = {}
  const entries = Object.entries(obj)
  const newEntries = entries.map(entry =>
    [entry[0], fn(entry[1])] as [string, O]
  )
  newEntries.forEach(entry => {
    newObj[entry[0]] = entry[1]
  })
  return newObj
}

export default mapObject
