import { renderApp, createHistory } from 'testUtils'
import { fireEvent, wait, screen } from '@testing-library/react'
import * as sinopiaApi from 'sinopiaApi'
import Config from 'Config'

// This forces Sinopia server to use fixtures
jest.spyOn(Config, 'useResourceTemplateFixtures', 'get').mockReturnValue(true)
jest.spyOn(sinopiaApi, 'postResource').mockResolvedValue('http://localhost:3000/resource/c7db5404-7d7d-40ac-b38e-c821d2c3ae3f')

// Mock out document.elementFromPoint used by useNavigableComponent.
global.document.elementFromPoint = jest.fn()

describe('saving a resource', () => {
  describe('after opening a new resource', () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn() // required to allow scrolling in the jsdom

    const history = createHistory(['/editor/resourceTemplate:bf2:Title:Note'])
    renderApp(null, history)

    it('edits, saves, and copies the resource template', async () => {
      await screen.findByText('Title note', { selector: 'h3' })

      const saveBtn = screen.getAllByText('Save', { selector: 'button' })[0] // there are multiple save buttons, grab the first
      const copyBtn = await screen.getAllByTestId('Copy this resource to a new resource')[0]

      expect(saveBtn).toBeDisabled()
      expect(copyBtn).toBeDisabled()

      const input = screen.getByPlaceholderText('Note Text')
      fireEvent.change(input, { target: { value: 'foo' } })
      fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 })

      // There is foo text. Perhaps check css.
      await wait(() => expect(screen.getByText('foo')).toHaveClass('rbt-token'))
      // There is remove button
      expect(screen.getByTestId('Remove foo')).toHaveTextContent('×')
      // There is edit button.
      const editBtn = screen.getByTestId('Edit foo')
      expect(editBtn).toHaveTextContent('Edit')
      // There is language button.
      expect(screen.getByTestId('Change language for foo')).toHaveTextContent('Language: English')
      // Input is Empty
      expect(input).toHaveValue('')

      expect(saveBtn).not.toBeDisabled()
      fireEvent.click(saveBtn)

      // A modal for group choice and save appears
      const modalSave = screen.getByRole('button', { name: 'Save Group' })
      fireEvent.click(modalSave)
      // The resource is saves and is assigned a URI
      await screen.findByText(/URI for this resource/)

      // The copy resource button is active
      expect(copyBtn).not.toBeDisabled()
      fireEvent.click(copyBtn)
      screen.findByText(/Copied http:\/\/localhost\/something\/or\/other to new resource./)

      // There are nav tabs and a duplicate resource with the same content
      await screen.findAllByText('Title note', { selector: '.nav-item.active .nav-link' })
      await screen.findAllByText('Title note', { selector: '.nav-item:not(.active) .nav-link' })
      expect(editBtn).toHaveTextContent('Edit')
    })
  })
})
