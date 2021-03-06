// Copyright 2020 Stanford University see LICENSE for license

export const setLanguage = (state, action) => ({
  ...state,
  values: {
    ...state.values,
    [action.payload.valueKey]: {
      ...state.values[action.payload.valueKey],
      lang: action.payload.lang,
    },
  },
})

export const languagesReceived = (state, action) => {
  const options = createOptions(action.payload)
  return {
    ...state,
    languageLookup: options,
    languages: createMap(options),
  }
}

const createOptions = (json) => json.reduce((result, item) => {
  // Object.getOwnPropertyDescriptor is necessary to handle the @
  const id = Object.getOwnPropertyDescriptor(item, '@id').value.replace('http://id.loc.gov/vocabulary/iso639-2/', '')
  const labelArrayDescr = Object.getOwnPropertyDescriptor(item, 'http://www.loc.gov/mads/rdf/v1#authoritativeLabel')

  // Some of the LOC items do not have labels so ignore them.
  if (!labelArrayDescr) return result
  const labelArray = labelArrayDescr.value

  let label = null

  // Looking for English label
  labelArray.forEach((langItem) => {
    if (langItem['@language'] === 'en') {
      label = langItem['@value']
    }
  })

  // But not every language has an English label.
  if (!label) return result

  result.push({ id, label })
  return result
}, [])

const createMap = (options) => {
  const langMap = {}
  options.forEach((item) => langMap[item.id] = item.label)
  return langMap
}
