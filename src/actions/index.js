// Copyright 2019 Stanford University see LICENSE for license
/* eslint max-params: ["warn", 6] */

export const loadingQaResults = () => ({
  type: 'LOADING_QA_RESULTS',
})

export const qaResultsReceived = results => ({
  type: 'QA_RESULTS_RECEIVED',
  payload: results,
})

export const setResource = (resource, resourceTemplates) => ({
  type: 'SET_RESOURCE',
  payload: { resource, resourceTemplates },
})

export const setResourceTemplate = resourceTemplate => ({
  type: 'SET_RESOURCE_TEMPLATE',
  payload: resourceTemplate,
})

export const setResourceTemplateSummary = resourceTemplateSummary => ({
  type: 'SET_RESOURCE_TEMPLATE_SUMMARY',
  payload: resourceTemplateSummary,
})

export const stubResource = () => ({
  type: 'STUB_RESOURCE',
})

export const retrieveError = (resourceTemplateId, reason) => ({
  type: 'RETRIEVE_ERROR',
  payload: { resourceTemplateId, reason },
})

export const itemsSelected = item => ({
  type: 'ITEMS_SELECTED',
  payload: item,
})

export const showGroupChooser = show => ({
  type: 'SHOW_GROUP_CHOOSER',
  payload: show,
})

export const closeGroupChooser = () => ({
  type: 'CLOSE_GROUP_CHOOSER',
})

export const showResourceTemplateChooser = () => ({
  type: 'SHOW_RESOURCE_TEMPLATE_CHOOSER',
})

export const closeResourceTemplateChooser = () => ({
  type: 'CLOSE_RESOURCE_TEMPLATE_CHOOSER',
})

export const copyNewResource = copyInfo => ({
  type: 'COPY_NEW_RESOURCE',
  payload: copyInfo,
})

export const showCopyNewMessage = showInfo => ({
  type: 'SHOW_COPY_NEW_MESSAGE',
  payload: showInfo,
})

export const languageSelectOpened = () => ({
  type: 'LANGUAGE_SELECT_OPENED',
})


export const removeItem = reduxPath => ({
  type: 'REMOVE_ITEM',
  payload: reduxPath,
})

export const removeResource = reduxPath => ({
  type: 'REMOVE_RESOURCE',
  payload: reduxPath,
})

export const removeAllItems = item => ({
  type: 'REMOVE_ALL',
  payload: item,
})

export const assignBaseURL = item => ({
  type: 'SET_BASE_URL',
  payload: item,
})

export const updateStarted = () => ({
  type: 'UPDATE_STARTED',
})

export const updateFinished = checksum => ({
  type: 'UPDATE_FINISHED',
  payload: checksum,
})

export const publishStarted = () => ({
  type: 'PUBLISH_STARTED',
})

export const publishError = reason => ({
  type: 'PUBLISH_ERROR',
  payload: reason,
})

export const retrieveResourceStarted = uri => ({
  type: 'RETRIEVE_STARTED',
  payload: uri,
})

export const retrieveResourceTemplateStarted = resourceTemplateId => ({
  type: 'RETRIEVE_RESOURCE_TEMPLATE_STARTED',
  payload: resourceTemplateId,
})

export const changeSelections = item => ({
  type: 'CHANGE_SELECTIONS',
  payload: item,
})

export const languageSelected = item => ({
  type: 'LANGUAGE_SELECTED',
  payload: item,
})

export const showRdfPreview = show => ({
  type: 'SHOW_RDF_PREVIEW',
  payload: show,
})

export const authenticationFailure = authenticationResult => ({
  type: 'AUTHENTICATION_FAILURE',
  payload: authenticationResult,
})

export const authenticationSuccess = authenticationResult => ({
  type: 'AUTHENTICATION_SUCCESS',
  payload: authenticationResult,
})

export const signOutSuccess = () => ({
  type: 'SIGN_OUT_SUCCESS',
})

export const saveAppVersion = version => ({
  type: 'SAVE_APP_VERSION',
  payload: version,
})

export const updateProperty = (reduxPath, resourceFragment, resourceTemplates) => ({
  type: 'UPDATE_PROPERTY',
  payload: { reduxPath, resourceFragment, resourceTemplates },
})

export const appendResource = (reduxPath, resource, resourceTemplates) => ({
  type: 'APPEND_RESOURCE',
  payload: { reduxPath, resource, resourceTemplates },
})

export const toggleCollapse = reduxPath => ({
  type: 'TOGGLE_COLLAPSE',
  payload: { reduxPath },
})

export const clearResourceTemplates = () => ({
  type: 'CLEAR_RESOURCE_TEMPLATES',
})

export const clearSearchResults = () => ({
  type: 'CLEAR_SEARCH_RESULTS',
})

export const setSearchResults = (uri, searchResults, totalResults, query, startOfRange, error) => ({
  type: 'SET_SEARCH_RESULTS',
  payload: {
    uri,
    searchResults,
    totalResults,
    query,
    startOfRange,
    error,
  },
})

export const setLastSaveChecksum = checksum => ({
  type: 'SET_LAST_SAVE_CHECKSUM',
  payload: checksum,
})

export const setUnusedRDF = rdf => ({
  type: 'SET_UNUSED_RDF',
  payload: rdf,
})
