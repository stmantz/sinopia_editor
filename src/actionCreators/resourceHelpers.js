// Copyright 2020 Stanford University see LICENSE for license

import rdf from 'rdf-ext'
import shortid from 'shortid'
import _ from 'lodash'
import { loadResourceTemplate } from 'actionCreators/templates'
import { addSubject as addSubjectAction } from 'actions/resources'
import {
  selectProperty, selectSubject, selectValue,
} from 'selectors/resources'
import { newLiteralValue, newUriValue, newValueSubject } from 'utilities/valueFactory'

/**
 * Helper methods that should only be used in 'actionCreators/resources'
 */

export const addResourceFromDataset = (dataset, uri, resourceTemplateId, errorKey, asNewResource, group) => (dispatch) => {
  const subjectTerm = rdf.namedNode(chooseURI(dataset, uri))
  const newUri = asNewResource ? null : uri
  const usedDataset = rdf.dataset()
  usedDataset.addAll(dataset.match(subjectTerm, rdf.namedNode('http://sinopia.io/vocabulary/hasResourceTemplate')))
  usedDataset.addAll(dataset.match(subjectTerm, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')))
  return dispatch(recursiveResourceFromDataset(subjectTerm, newUri, resourceTemplateId, {}, dataset, usedDataset, errorKey))
    .then((resource) => {
      resource.group = group
      dispatch(addSubjectAction(resource))
      return [resource, usedDataset]
    })
}

// The provided URI or <>.
export const chooseURI = (dataset, uri) => (dataset.match(rdf.namedNode(uri)).size > 0 ? uri : '')

export const addEmptyResource = (resourceTemplateId, errorKey) => (dispatch) => dispatch(newSubject(null, resourceTemplateId, {}, errorKey))
  .then((subject) => dispatch(newPropertiesFromTemplates(subject, false, errorKey))
    .then((properties) => {
      const promises = properties.map((property) => dispatch(expandProperty(property, errorKey)))
      return Promise.all(promises)
        .then((expandedProperties) => {
          subject.properties = expandedProperties
          dispatch(addSubjectAction(subject))
          return subject
        })
    }))

const expandProperty = (property, errorKey) => (dispatch) => {
  if (property.propertyTemplate.type === 'resource') {
    property.values = []
    const promises = property.propertyTemplate.valueSubjectTemplateKeys.map((resourceTemplateId) => dispatch(newSubject(null,
      resourceTemplateId, {}, errorKey))
      .then((subject) => dispatch(newPropertiesFromTemplates(subject, false, errorKey))
        .then((properties) => {
          subject.properties = properties
          const newValue = newValueSubject(property, subject)
          property.values.push(newValue)
          property.show = true
        })))
    return Promise.all(promises)
      .then(() => property)
  }
  property.values = defaultValuesFor(property)
  property.show = true
  return property
}

const recursiveResourceFromDataset = (subjectTerm, uri, resourceTemplateId, resourceTemplatePromises, dataset,
  usedDataset, errorKey) => (dispatch) => dispatch(newSubject(uri, resourceTemplateId, resourceTemplatePromises, errorKey))
  .then((subject) => dispatch(newPropertiesFromTemplates(subject, true, errorKey))
    .then((properties) => Promise.all(
      properties.map((property) => dispatch(newValuesFromDataset(subjectTerm, property, resourceTemplatePromises, dataset, usedDataset, errorKey))
        .then((values) => {
          const compactValues = _.compact(values)
          if (!_.isEmpty(compactValues)) property.values = compactValues
          return compactValues
        })),
    )
      .then(() => {
        subject.properties = properties
        return subject
      })))

export const newSubject = (uri, resourceTemplateId, resourceTemplatePromises, errorKey) => (dispatch) => {
  const key = shortid.generate()
  return dispatch(loadResourceTemplate(resourceTemplateId, resourceTemplatePromises, errorKey))
    .then((subjectTemplate) => {
      // This handles if there was an error fetching resource template
      if (!subjectTemplate) {
        const err = new Error(`Unable to load ${resourceTemplateId}`)
        err.name = 'ResourceTemplateError'
        console.error(err.toString())
        throw err
      }

      return {
        key,
        uri: _.isEmpty(uri) ? null : uri,
        subjectTemplate,
        properties: [],
      }
    })
}

export const newPropertiesFromTemplates = (subject, noDefaults, errorKey) => (dispatch) => Promise.all(
  subject.subjectTemplate.propertyTemplates.map((propertyTemplate) => dispatch(newProperty(subject, propertyTemplate, noDefaults, errorKey))),
)

const newValuesFromDataset = (subjectTerm, property, resourceTemplatePromises, dataset, usedDataset, errorKey) => (dispatch) => {
  // Get the objects for the values. How depends on whether property is ordered.
  const objectsFunc = property.propertyTemplate.ordered ? orderedObjects : unorderedObjects
  const objects = objectsFunc(subjectTerm, property, dataset, usedDataset)
  if (property.propertyTemplate.type === 'resource') {
    // Get the values based on the template and the dataset then merge.
    const objPromises = _.compact(objects.map((obj) => dispatch(newNestedResourceFromObject(obj,
      property, resourceTemplatePromises, dataset, usedDataset, errorKey))))
    return Promise.all(objPromises)
      .then((valuesFromObjs) => {
        if (_.isEmpty(valuesFromObjs)) return []
        const templatePromises = templatePromisesFor(property, errorKey, dispatch)
        return Promise.all(templatePromises)
          .then((valuesFromTemplates) => mergeValues(valuesFromTemplates, valuesFromObjs))
      })
  }
  return Promise.all(objects.map((obj) => {
    if (obj.termType === 'NamedNode') {
      // URI
      return Promise.resolve(newUriFromObject(obj, property, dataset, usedDataset))
    }
    // Literal
    return Promise.resolve(newLiteralFromObject(obj, property))
  }))
}

// Promises that return values based on template
const templatePromisesFor = (property, errorKey, dispatch) => property.propertyTemplate.valueSubjectTemplateKeys
  .map((resourceTemplateId) => dispatch(newSubject(null, resourceTemplateId, {}, errorKey))
    .then((subject) => dispatch(newPropertiesFromTemplates(subject, false, errorKey))
      .then((properties) => {
        subject.properties = properties
        return newValueSubject(property, subject)
      })))

// Merge the values from the dataset and templates
const mergeValues = (valuesFromTemplates, valuesFromObjs) => {
  const valuesFromObjsMap = valuesMapFor(valuesFromObjs)
  const newValues = []
  valuesFromTemplates.forEach((valueFromTemplate) => {
    // Use values from dataset.
    // Otherwise, use values from template.
    const subjectTemplateKey = valueFromTemplate.valueSubject.subjectTemplate.key
    if (valuesFromObjsMap[subjectTemplateKey]) {
      valuesFromObjsMap[subjectTemplateKey].forEach((valueFromObj) => newValues.push(valueFromObj))
    } else {
      newValues.push(valueFromTemplate)
    }
  })
  return newValues
}

// Construct map of subject template key to value
const valuesMapFor = (values) => {
  const valuesMap = {}
  values.forEach((value) => {
    if (_.isEmpty(value)) return
    const subjectTemplateKey = value.valueSubject.subjectTemplate.key
    if (!valuesMap[subjectTemplateKey]) valuesMap[subjectTemplateKey] = []
    valuesMap[subjectTemplateKey].push(value)
  })
  return valuesMap
}

const orderedObjects = (subjectTerm, property, dataset, usedDataset) => {
  // All quads for this property
  const quads = dataset.match(subjectTerm, rdf.namedNode(property.propertyTemplate.uri)).toArray()
  // Should only be one.
  if (quads.length > 1) {
    console.error(`More than one quad for ordered property ${property.propertyTemplate.uri}.`)
    return []
  }
  if (quads.length === 0) return []
  usedDataset.addAll(quads)
  const objects = []
  recursiveOrderedObjects(quads[0].object, objects, dataset, usedDataset)
  return objects
}

const recursiveOrderedObjects = (subjectTerm, objects, dataset, usedDataset) => {
  const firstQuad = dataset.match(subjectTerm, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first')).toArray()[0]
  usedDataset.add(firstQuad)
  objects.push(firstQuad.object)
  const restQuad = dataset.match(subjectTerm, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest')).toArray()[0]
  usedDataset.add(restQuad)
  if (restQuad.object.value !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil') recursiveOrderedObjects(restQuad.object, objects, dataset, usedDataset)
}

const unorderedObjects = (subjectTerm, property, dataset, usedDataset) => {
  // All quads for this property
  const quads = dataset.match(subjectTerm, rdf.namedNode(property.propertyTemplate.uri)).toArray()
  usedDataset.addAll(quads)
  return quads.map((quad) => quad.object)
}

const newNestedResourceFromObject = (obj, property, resourceTemplatePromises, dataset, usedDataset, errorKey) => (dispatch) => {
  // Only build this embedded resource if can find the resource template.
  // Multiple types may be provided.
  const typeQuads = dataset.match(obj, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')).toArray()

  // Among the valueTemplateRefs, find all of the resource templates that match a type.
  // Ideally, only want 1 but need to handle other cases.
  return Promise.all(
    typeQuads.map((typeQuad) => dispatch(selectResourceTemplateId(property.propertyTemplate,
      typeQuad.object.value, resourceTemplatePromises, errorKey))),
  )
    .then((childRtIds) => {
      const compactChildRtIds = _.compact(_.flatten(childRtIds))

      // Don't know which to pick, so error.
      if (compactChildRtIds.length > 1) {
        throw `More than one resource template matches: ${compactChildRtIds}`
      }
      // No matching resource template, so do nothing
      if (_.isEmpty(compactChildRtIds)) {
        return null
      }
      usedDataset.addAll(typeQuads)

      // One resource template
      return dispatch(recursiveResourceFromDataset(obj, null, compactChildRtIds[0], resourceTemplatePromises, dataset, usedDataset, errorKey))
        .then((subject) => newValueSubject(property, subject))
    })
}

const selectResourceTemplateId = (propertyTemplate, resourceURI, resourceTemplatePromises, errorKey) => (dispatch) => Promise.all(
  // The keys are resource template ids. They may or may not be in state
  propertyTemplate.valueSubjectTemplateKeys.map((resourceTemplateId) => dispatch(loadResourceTemplate(resourceTemplateId, resourceTemplatePromises, errorKey))
    .then((subjectTemplate) => (subjectTemplate.class === resourceURI ? resourceTemplateId : undefined))),
)

const newLiteralFromObject = (obj, property) => newLiteralValue(property, obj.value, obj.language)

const newUriFromObject = (obj, property, dataset, usedDataset) => {
  const uri = obj.value
  const labelQuads = dataset.match(obj, rdf.namedNode('http://www.w3.org/2000/01/rdf-schema#label')).toArray()
  let label = uri
  if (labelQuads.length > 0) {
    // First that doesn't start with http or first
    const labelQuad = labelQuads.find((labelQuad) => !labelQuad.object.value.startsWith('http')) || labelQuads[0]
    label = labelQuad.object.value
    // Adding all to usedData, even though only using first. This is to avoid user confusion over extra triples, e.g., https://github.com/LD4P/sinopia_editor/issues/2634
    usedDataset.addAll(labelQuads)
  }
  return newUriValue(property, uri, label)
}

const newProperty = (subject, propertyTemplate, noDefaults, errorKey) => (dispatch) => {
  const key = shortid.generate()
  const property = {
    key,
    subject,
    propertyTemplate,
    values: null,
    show: false,
  }
  if (!noDefaults && !_.isEmpty(property.propertyTemplate.defaults)) {
    property.values = defaultValuesFor(property)
    if (!_.isEmpty(property.values)) property.show = true
  }

  // If required and we do not already have some default values, then expand the property.
  if (propertyTemplate.required && !property.values) {
    property.show = true
    return dispatch(valuesForExpandedProperty(property, noDefaults, errorKey))
      .then((values) => {
        property.values = values
        return property
      })
  }

  return property
}

export function defaultValuesFor(property) {
  return property.propertyTemplate.defaults.map((defaultValue) => {
    if (property.propertyTemplate.type === 'uri') {
      return newUriValue(property, defaultValue.uri, defaultValue.label)
    }
    return newLiteralValue(property, defaultValue.literal, defaultValue.lang)
  })
}

const valuesForExpandedProperty = (property, noDefaults, errorKey) => (dispatch) => {
  if (property.propertyTemplate.type === 'resource') {
    return Promise.all(property.propertyTemplate.valueSubjectTemplateKeys.map((resourceTemplateId) => dispatch(newSubject(null,
      resourceTemplateId, {}, errorKey))
      .then((subject) => dispatch(newPropertiesFromTemplates(subject, noDefaults, errorKey))
        .then((properties) => {
          subject.properties = properties
          return newValueSubject(property, subject)
        }))))
  }
  return Promise.resolve([])
}

export const newSubjectCopy = (subjectKey, value) => (dispatch, getState) => {
  const subject = selectSubject(getState(), subjectKey)
  const newSubject = { ...subject }

  // Add to value
  if (value) value.valueSubject = newSubject

  // New key
  const key = shortid.generate()
  newSubject.key = key

  // Clear some values
  newSubject.uri = null
  delete newSubject.propertyKeys
  newSubject.properties = []

  // Add properties
  return Promise.all(subject.properties.map((property) => dispatch(newPropertyCopy(property.key, newSubject))))
    .then(() => newSubject)
}

const newPropertyCopy = (propertyKey, subject) => (dispatch, getState) => {
  const property = selectProperty(getState(), propertyKey)
  const newProperty = { ...property }

  // Add to subject
  subject.properties.push(newProperty)

  // New key
  const key = shortid.generate()
  newProperty.key = key

  // Clear some values
  delete newProperty.subjectKey
  newProperty.subject = subject
  delete newProperty.valueKeys
  newProperty.values = property.valueKeys === null ? null : []

  // Add values
  if (property.values) {
    return Promise.all(property.values.map((value) => dispatch(newValueCopy(value.key, newProperty))))
      .then(() => newProperty)
  }
  return newProperty
}

const newValueCopy = (valueKey, property) => (dispatch, getState) => {
  const value = selectValue(getState(), valueKey)
  const newValue = { ...value }

  // Add to property
  property.values.push(newValue)

  // New key
  const key = shortid.generate()
  newValue.key = key

  // Clear some values
  delete newValue.propertyKey
  newValue.property = property
  delete newValue.valueSubjectKey
  newValue.valueSubject = null

  if (value.valueSubject) {
    return dispatch(newSubjectCopy(value.valueSubject.key, newValue))
      .then(() => newValue)
  }

  return newValue
}
