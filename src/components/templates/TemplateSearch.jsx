// Copyright 2019 Stanford University see LICENSE for license

import React, {
  useEffect, useRef, useState, useCallback,
} from 'react'
import { getTemplateSearchResults } from 'sinopiaSearch'
import { useDispatch, useSelector } from 'react-redux'
import { clearSearchResults as clearSearchResultsAction, setSearchResults } from 'actions/search'
import Alert from '../Alert'
import SinopiaResourceTemplates from './SinopiaResourceTemplates'
import SearchResultsPaging from 'components/search/SearchResultsPaging'
import NewResourceTemplateButton from './NewResourceTemplateButton'
import { selectSearchError } from 'selectors/search'
import PropTypes from 'prop-types'


const TemplateSearch = (props) => {
  const dispatch = useDispatch()
  // Tokens allow us to cancel an existing search. Does not actually stop the
  // search, but causes result to be ignored.
  const tokens = useRef([])

  const [query, setQueryText] = useState('')
  const [startOfRange, setStartOfRange] = useState(0)

  const error = useSelector((state) => selectSearchError(state, 'template'))
  const clearSearchResults = useCallback(() => dispatch(clearSearchResultsAction('template')), [dispatch])

  useEffect(() => {
    clearSearchResults()
  }, [clearSearchResults])

  useEffect(() => {
    // Cancel all current searches
    while (tokens.current.length > 0) {
      tokens.current.pop().cancel = true
    }

    // Create a token for this set of searches
    const token = { cancel: false }
    tokens.current.push(token)
    getTemplateSearchResults(query, { startOfRange }).then((response) => {
      if (!token.cancel) dispatch(setSearchResults('template', null, response.results, response.totalHits, {}, null, { startOfRange }, response.error))
    })
  }, [dispatch, query, startOfRange])

  const changePage = (startOfRange) => {
    setStartOfRange(startOfRange)
  }

  const updateSearch = (e) => {
    setStartOfRange(0)
    setQueryText(e.target.value)
  }

  return (
    <React.Fragment>
      <div id="search">
        <Alert text={error} />
        <div className="row">
          <div className="col">
            <form className="form-inline" onSubmit={(event) => event.preventDefault()}>
              <div className="form-group" style={{ paddingBottom: '10px', paddingTop: '10px' }}>
                <label className="font-weight-bold" htmlFor="searchInput">Find a resource template</label>&nbsp;
                <div className="input-group" style={{ width: '750px', paddingLeft: '5px' }}>
                  <input id="searchInput" type="text" className="form-control"
                         onChange={ updateSearch }
                         placeholder="Enter id, label, URI, remark, or author" />
                </div>
              </div>
            </form>
          </div>
          <div className="col-sm-2">
            <NewResourceTemplateButton history={props.history} />
          </div>
        </div>
      </div>


      <SinopiaResourceTemplates history={props.history} />
      <SearchResultsPaging changePage={changePage} searchType="template" />
    </React.Fragment>
  )
}

TemplateSearch.propTypes = {
  history: PropTypes.object,
}

export default TemplateSearch
