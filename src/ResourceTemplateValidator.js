// Copyright 2019 Stanford University see LICENSE for license

/**
 * Validates a resource template.
 * @param {Object>} resourceTemplate to validate
 * @return {Array<string>} reasons that validation failed
 */
const validateResourceTemplate = (resourceTemplate) => {
  const reasons = [].concat(validateRepeatedPropertyTemplates(resourceTemplate),
    validateNoDefaultURIForLiterals(resourceTemplate))
  return reasons
}

/**
 * Validates that a resource template does not contain repeated property templates.
 * @param {Object>} resourceTemplate to validate
 * @return {Array<string} reasons that validation failed if invalid
 */
const validateRepeatedPropertyTemplates = (resourceTemplate) => {
  const dupes = []
  const propertyTemplateIds = []
  resourceTemplate.propertyTemplates.forEach((propertyTemplate) => {
    const propertyURI = propertyTemplate.propertyURI
    if (propertyTemplateIds.indexOf(propertyURI) !== -1) {
      dupes.push(propertyURI)
    } else {
      propertyTemplateIds.push(propertyURI)
    }
  })
  if (dupes.length > 0) {
    return [`Repeated property templates with same property URI (${dupes}) are not allowed.`]
  }
  return []
}

/**
 * Validates that literal property templates do not have a default URI.
 * @param {Object>} resourceTemplate to validate
 * @return {Array<string} reasons that validation failed if invalid
 */
const validateNoDefaultURIForLiterals = (resourceTemplate) => {
  const propertyTemplateIds = new Set()
  resourceTemplate.propertyTemplates.forEach((propertyTemplate) => {
    if (propertyTemplate.type === 'literal') {
      const defaults = propertyTemplate?.valueConstraint?.defaults || []
      defaults.forEach((defaultItem) => {
        if (defaultItem.defaultURI !== undefined) {
          propertyTemplateIds.add(propertyTemplate.propertyURI)
        }
      })
    }
  })
  if (propertyTemplateIds.size > 0) {
    return [`Literal property templates (${Array.from(propertyTemplateIds)}) cannot have default URIs.`]
  }
  return []
}


export default validateResourceTemplate