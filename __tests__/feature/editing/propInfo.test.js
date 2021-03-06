import { renderApp, createHistory } from 'testUtils'
import { screen } from '@testing-library/react'
import { featureSetup } from 'featureUtils'

featureSetup()

// Mock jquery
global.$ = jest.fn().mockReturnValue({ popover: jest.fn() })
// Mock out document.elementFromPoint used by useNavigableComponent.
global.document.elementFromPoint = jest.fn()
// Mock out scrollIntoView used by useNavigableComponent. See https://github.com/jsdom/jsdom/issues/1695
Element.prototype.scrollIntoView = jest.fn()

describe('getting property related info from a resource', () => {
  it('has tooltip text info or a link based on the content of a top-level property remark', async () => {
    const history = createHistory(['/editor/resourceTemplate:testing:uber3'])
    const { container } = renderApp(null, history)

    // if the tooltip remark is text
    const infoIcon3 = await screen.findByTitle('Uber template3, property1')
    expect(infoIcon3).toHaveAttribute('data-content', 'A literal')

    // if the remark is a Url
    const infoLink = container.querySelector('a[href="http://access.rdatoolkit.org/1.0.html"]')

    expect(infoLink).toHaveClass('prop-remark')
  })

  it('has tooltip text info based on the content of a nested property remark', async () => {
    const history = createHistory(['/editor/resourceTemplate:testing:uber1'])
    renderApp(null, history)

    // Finds the parent property
    const infoIcon1 = await screen.findByTitle('Uber template1, property18')
    expect(infoIcon1).toHaveAttribute('data-content', 'Mandatory nested resource templates.')

    // Finds the nested property info (tooltip remark is text)
    const nestedInfoIcons = await screen.findAllByTitle('Uber template4, property1')
    expect(nestedInfoIcons[0]).toHaveAttribute('data-content', 'A repeatable, required literal')
  }, 10000)
})
