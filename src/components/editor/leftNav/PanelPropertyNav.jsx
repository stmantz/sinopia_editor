import React from 'react'
import PropTypes from 'prop-types'
import { setCurrentComponent } from 'actions/index'
import { useDispatch, useSelector } from 'react-redux'
import { displayResourceValidations } from 'selectors/errors'
import { selectNormProperty } from 'selectors/resources'
import { selectPropertyTemplate } from 'selectors/templates'
import _ from 'lodash'

const PanelPropertyNav = (props) => {
  const dispatch = useDispatch()
  const property = useSelector((state) => selectNormProperty(state, props.propertyKey))
  const propertyTemplate = useSelector((state) => selectPropertyTemplate(state, property?.propertyTemplateKey))

  const hasValue = !_.isEmpty(property.descUriOrLiteralValueKeys)
  const liClassNames = hasValue ? 'li-checked' : ''

  const hasError = !_.isEmpty(property.descWithErrorPropertyKeys)
  const displayValidations = useSelector((state) => displayResourceValidations(state, property?.rootSubjectKey))
  const headingClassNames = ['left-nav-header']
  if (displayValidations && hasError) headingClassNames.push('text-danger')

  if (!property) return null

  return (<li className={liClassNames}>
    <button
              type="button"
              className="btn btn-link"
              aria-label={`Go to ${propertyTemplate.label}`}
              data-testid={`Go to ${propertyTemplate.label}`}
              onClick={() => dispatch(setCurrentComponent(property.rootSubjectKey, property.rootPropertyKey, property.key))}>
      <h5 className={headingClassNames.join(' ')}>
        {propertyTemplate.label}
      </h5>
    </button>
  </li>)
}

PanelPropertyNav.propTypes = {
  propertyKey: PropTypes.string.isRequired,
}

export default PanelPropertyNav
