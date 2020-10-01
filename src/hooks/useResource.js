import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { newResource, loadResource } from 'actionCreators/resources'
import { selectErrors } from 'selectors/errors'
import { selectCurrentResourceKey, selectNormSubject } from 'selectors/resources'
import _ from 'lodash'
import { showModal } from 'actions/modals'

const useResource = (history, errorKey, errorRef) => {
  const dispatch = useDispatch()
  const errors = useSelector((state) => selectErrors(state, errorKey))
  const resourceKey = useSelector((state) => selectCurrentResourceKey(state))
  const resource = useSelector((state) => selectNormSubject(state, resourceKey))

  const [navigateEditor, setNavigateEditor] = useState(false)

  useEffect(() => {
    // Forces a wait until the root resource has been set in state
    if (navigateEditor && resource && _.isEmpty(errors)) {
      if (navigateEditor === 'new') {
        history.push(`/editor/${resource.subjectTemplateKey}`)
      } else {
        history.push('/editor')
      }
    } else if (!_.isEmpty(errors) && errorRef) {
      window.scrollTo(0, errorRef.current.offsetTop)
    }
  }, [navigateEditor, resource, history, errors, errorRef])

  const handleNew = (resourceTemplateId, event) => {
    if (event) event.preventDefault()
    dispatch(newResource(resourceTemplateId, errorKey)).then((result) => {
      if (result) setNavigateEditor('new')
    })
  }

  const handleCopy = (resourceURI, event) => {
    if (event) event.preventDefault()
    dispatch(loadResource(resourceURI, errorKey, true)).then((result) => {
      if (result) setNavigateEditor('copy')
    })
  }

  const handleEdit = (resourceURI, event) => {
    if (event) event.preventDefault()
    dispatch(loadResource(resourceURI, errorKey)).then((result) => {
      if (result) setNavigateEditor('edit')
    })
  }

  const handleView = (resourceURI, event) => {
    if (event) event.preventDefault()
    dispatch(loadResource(resourceURI, errorKey, false, true)).then(() => {
      dispatch(showModal('ViewResourceModal'))
    })
  }

  return {
    handleNew, handleCopy, handleEdit, handleView,
  }
}

export default useResource
