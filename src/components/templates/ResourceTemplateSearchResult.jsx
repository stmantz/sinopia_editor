// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import PropTypes from 'prop-types'
import ResourceTemplateRow from './ResourceTemplateRow'

/**
 * This is the list view of all the templates
 */
const ResourceTemplateSearchResult = (props) => {
  const resourceTemplateSummaries = props.results
  const rows = resourceTemplateSummaries.map((row) => (
    <ResourceTemplateRow
        row={row}
        key={row.id}
        handleClick={props.handleClick}
        handleEdit={props.handleEdit}
        handleCopy={props.handleCopy} />
  ))

  return (
    <div className="row">
      <div className="col">
        <table className="table table-bordered resource-template-list">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>
                Label / ID
              </th>
              <th style={{ width: '20%' }}>
                Resource URI
              </th>
              <th style={{ width: '12%' }}>
                Author
              </th>
              <th style={{ width: '10%' }}>
                Date
              </th>
              <th style={{ width: '24%' }}>
                Guiding statement
              </th>
              <th style={{ width: '4%' }}
                  data-testid="action-col-header">
              </th>
            </tr>
          </thead>
          <tbody>
            { rows }
          </tbody>
        </table>
      </div>
    </div>
  )
}

ResourceTemplateSearchResult.propTypes = {
  handleClick: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleCopy: PropTypes.func.isRequired,
  results: PropTypes.array,
}

export default ResourceTemplateSearchResult
