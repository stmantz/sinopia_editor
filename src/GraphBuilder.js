// Copyright 2019 Stanford University see LICENSE for license

import N3Writer from 'n3/lib/N3Writer'
import Stream from 'stream'
import rdf from 'rdf-ext'

/**
 * Builds RDF graphs for a full resource
 */
export default class GraphBuilder {
  /**
   * @param {Object} resource to be converted to graph
   */
  constructor(resource) {
    this.resource = resource
    this.dataset = rdf.dataset()
  }

  /**
   * @return {Dataset} an RDF graph that represents the data in the state
   */
  get graph() {
    if (this.resource) {
      const resourceTerm = rdf.namedNode(this.resource.uri || '')
      this.addGeneratedByTriple(resourceTerm, this.resource.subjectTemplate.id)
      this.buildSubject(this.resource, resourceTerm)
    }
    return this.dataset
  }

  /**
   * @return {string} a Turtle representation of a graph
   */
  toTurtle() {
    const turtleChunks = []

    const stream = new Stream.Writable()
    stream._write = (chunk, _encoding, next) => {
      turtleChunks.push(chunk.toString())
      next()
    }

    const writer = new N3Writer(stream, { end: false })
    writer.addQuads(this.graph.toArray())
    writer.end()
    return turtleChunks.join('')
  }

  buildSubject(subject, subjectTerm) {
    this.dataset.add(rdf.quad(subjectTerm, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), rdf.namedNode(subject.subjectTemplate.class)))
    subject.properties.forEach((property) => this.buildProperty(property, subjectTerm))
  }

  buildProperty(property, subjectTerm) {
    if (!this.shouldAddProperty(property)) return

    if (property.propertyTemplate.ordered) {
      let nextNode = rdf.blankNode()
      this.dataset.add(rdf.quad(subjectTerm, rdf.namedNode(property.propertyTemplate.uri), nextNode))
      property.values.forEach((value, index) => {
        const thisNode = nextNode
        nextNode = index !== property.values.length - 1 ? rdf.blankNode() : rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')
        this.dataset.add(rdf.quad(thisNode, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'), nextNode))
        this.buildValue(value, thisNode, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'))
      })
    } else {
      property.values.forEach((value) => this.buildValue(value, subjectTerm, rdf.namedNode(property.propertyTemplate.uri)))
    }
  }

  buildValue(value, subjectTerm, propertyTerm) {
    // Can't use type to distinguish between uri and literal because inputlookups allow providing a literal for a uri.
    if (value.property.propertyTemplate.type === 'resource') {
      this.buildValueSubject(value, subjectTerm, propertyTerm)
    } else if (value.uri) {
      this.buildUriValue(value, subjectTerm, propertyTerm)
    } else {
      this.buildLiteralValue(value, subjectTerm, propertyTerm)
    }
  }

  buildLiteralValue(value, subjectTerm, propertyTerm) {
    const valueTerm = rdf.literal(value.literal, value.lang)
    this.dataset.add(rdf.quad(subjectTerm, propertyTerm, valueTerm))
  }

  buildUriValue(value, subjectTerm, propertyTerm) {
    const valueTerm = rdf.namedNode(value.uri)
    this.dataset.add(rdf.quad(subjectTerm, propertyTerm, valueTerm))
    if (value.label) {
      this.dataset.add(rdf.quad(valueTerm,
        rdf.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
        rdf.literal(value.label)))
    }
  }

  buildValueSubject(value, subjectTerm, propertyTerm) {
    if (!this.shouldAddValueSubject(value)) return
    const bnode = rdf.blankNode()
    this.dataset.add(rdf.quad(subjectTerm, propertyTerm, bnode))
    this.buildSubject(value.valueSubject, bnode)
  }

  // Add only if there is actually a value somewhere.
  shouldAddValueSubject(value) {
    return this.checkSubjectHasValue(value.valueSubject)
  }

  shouldAddProperty(property) {
    return this.checkPropertyHasValue(property)
  }

  checkSubjectHasValue(subject) {
    return subject.properties.some((property) => this.checkPropertyHasValue(property))
  }

  checkPropertyHasValue(property) {
    if (!property.values) return false
    return property.values.some((value) => this.checkValueHasValue(value))
  }

  checkValueHasValue(value) {
    if (value.literal || value.uri) return true
    if (value.valueSubject) return this.checkSubjectHasValue(value.valueSubject)
    return false
  }

  /**
   * Adds the assertion that points at the resourceTemplate we used to generate this node
   * @param {rdf.Term} baseURI
   * @param {string} resourceTemplateId the identifier of the resource template
   */
  addGeneratedByTriple(baseURI, resourceTemplateId) {
    this.dataset.add(rdf.quad(baseURI,
      rdf.namedNode('http://sinopia.io/vocabulary/hasResourceTemplate'),
      rdf.literal(resourceTemplateId)))
  }
}
