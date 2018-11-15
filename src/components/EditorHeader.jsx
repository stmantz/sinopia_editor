import React, { Component } from 'react'
import SinopiaLogo from '../styles/editorsinopialogo.png'
import { Link } from 'react-router-dom'

class EditorHeader extends Component {
  render() {
    return (
      <div className="navbar editor-navbar">
        <div>
          <h1 className="editor-logo"><a className="editor-navbar-brand navbar-brand" href="/">SINOPIA</a></h1>
        </div>
        <div>
          <ul className="nav navbar-nav pull-right">
            <li>
              <a className="editor-header-text" href="https://profile-editor.sinopia.io/">Profile Editor</a>
            </li>
            <li className="menu">
              <a href="#" className="editor-help-resources" onClick={this.props.triggerEditorMenu}>Help and Resources</a>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

export default EditorHeader