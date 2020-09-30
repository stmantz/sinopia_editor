import Config from 'Config'
import { renderApp, createHistory } from 'testUtils'
import { fireEvent, screen } from '@testing-library/react'

jest.spyOn(Config, 'useResourceTemplateFixtures', 'get').mockReturnValue(true)

// Mock jquery
global.$ = jest.fn().mockReturnValue({ popover: jest.fn() })
// Mock out document.elementFromPoint used by useNavigableComponent.
global.document.elementFromPoint = jest.fn()
// Mock out scrollIntoView used by useNavigableComponent. See https://github.com/jsdom/jsdom/issues/1695
Element.prototype.scrollIntoView = jest.fn()

describe('expanding and contracting properties', () => {
  it('shows and hides nested properties', async () => {
    const history = createHistory(['/editor/resourceTemplate:testing:uber1'])
    renderApp(null, history)

    await screen.findByText('Uber template1', { selector: 'h3' })

    // Get rid of Uber template1, property3
    fireEvent.click(screen.getByTestId('Remove Uber template1, property3'))

    await screen.findByText('Uber template2', { selector: 'h5' })
    await screen.findByText('Uber template3', { selector: 'h5' })

    // Add a nested property
    fireEvent.click(screen.getByTestId('Add Uber template2, property1'))
    // Input box displayed
    await screen.findByPlaceholderText('Uber template2, property1')

    // Hide
    fireEvent.click(screen.getByTestId('Hide Uber template2, property1'))
    // Input box not displayed
    expect(screen.queryAllByPlaceholderText('Uber template2, property1')).toHaveLength(0)

    // Show
    fireEvent.click(screen.getByTestId('Show Uber template2, property1'))
    // Input box displayed
    await screen.findByPlaceholderText('Uber template2, property1')
  }, 25000)
})
