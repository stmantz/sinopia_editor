// Copyright 2018 Stanford University see Apache2.txt for license
import React from 'react'
import { shallow } from 'enzyme'
import InputList from '../../../src/components/editor/InputListLOC'

const plProps = {
  "propertyTemplate":
    {
      "propertyURI": "http://id.loc.gov/ontologies/bflc/target",
      "propertyLabel": "Frequency (RDA 2.14)",
      "remark": "http://access.rdatoolkit.org/2.14.html",
      "mandatory": "false",
      "repeatable": "true",
      "type": "lookup",
      "valueConstraint": {
        "defaults": [{
          "defaultURI": "http://id.loc.gov/vocabulary/carriers/nc",
          "defaultLiteral": "volume"
        }],
        "valueTemplateRefs": [],
        "useValuesFrom": [
          "vocabulary:bf2:frequencies"
        ],
        "valueDataType": {
          "dataTypeURI": "http://id.loc.gov/ontologies/bibframe/Frequency"
        }
      }
    }
}

describe('<InputList />', () => {
  // our mock formData function to replace the one provided by mapDispatchToProps
  const mockFormDataFn = jest.fn()
  const wrapper = shallow(<InputList.WrappedComponent {...plProps} handleSelectedChange={mockFormDataFn} />)

  it('contains a label with the value of propertyLabel', () => {
    expect(wrapper.find('label').text()).toMatch('Frequency (RDA 2.14)')
  })

  it('typeahead component should have a placeholder attribute with value propertyLabel', () => {
    expect(wrapper.find('#targetComponent').props().placeholder).toBe('Frequency (RDA 2.14)')
  })

  it('sets the typeahead component required attribute according to the mandatory value from the template', () => {
    expect(wrapper.find('#targetComponent').props().required).toBe(false)
  })

  it('displays FontAwesome Asterisk if mandatory from template is true', () => {
    wrapper.instance().props.propertyTemplate.mandatory = "true"
    wrapper.instance().forceUpdate()
    expect(wrapper.find('label > sup').text()).toBe("<FontAwesomeIcon />")
  })

  it('sets the typeahead component multiple attribute according to the repeatable value from the template', () => {
    expect(wrapper.find('#targetComponent').props().multiple).toBe(true)
  })

  it('sets the typeahead component placeholder attribute', () => {
    expect(wrapper.find('#targetComponent').props().placeholder).toMatch('Frequency (RDA 2.14)')
  })

  it('sets the default values according to the property template if they exist', () => {
    const defaults = [{
      id: 'http://id.loc.gov/vocabulary/carriers/nc',
      uri: 'http://id.loc.gov/vocabulary/carriers/nc',
      label: 'volume'
    }]
    expect(wrapper.state('defaults')).toEqual(defaults)
  })

  it('should call the onFocus event and set the selected option', () => {
    const opts = {id: 'URI', label: 'LABEL', uri: 'URI'}
    wrapper.instance().opts = opts
    const event = (wrap) => {
      global.fetch = jest.fn().mockImplementation(async () => await ({ok: true, resp: wrapper.instance().opts }))
      wrap.setState({options: [ wrapper.instance().opts ]})
      wrap.setState({selected: [ wrapper.instance().opts ]})
    }
    wrapper.find('#targetComponent').simulate('focus', event(wrapper))
    expect(wrapper.state().options[0]).toEqual(opts)

    wrapper.find('#targetComponent').simulate('change', event(wrapper))
    expect(wrapper.state().selected[0]).toEqual(opts)
  })

  it('sets the formData store with the total number or objects sent to "selected" when a change event happens', () => {
    expect(mockFormDataFn.mock.calls.length).toBe(2)
  })
})
