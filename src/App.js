import React, { Component } from 'react';
import './App.css';
import Element from './Element';
import BreadCrumbs from './BreadCrumbs';
import AuthInfo from './AuthInfo';

class App extends Component {
  componentWillMount() {
    this.setState({});
  }
  render() {
    let leftPanelClass  = 'LeftPanel';
    let rightPanelClass = 'RightPanel';

    if (this.state.leftPanelContent)
      leftPanelClass += ' Open';
    else
      leftPanelClass += ' Closed';

    if (this.state.rightPanelContent)
      rightPanelClass += ' Open';
    else
      rightPanelClass += ' Closed';

    return (
      <div className="App">
        <div className={leftPanelClass}>Left Panel</div>
        <div className={rightPanelClass}>Right Panel</div>
        <div className="Header">
          <BreadCrumbs />
          <AuthInfo />
        </div>
        <div className="Body"><Element url="/" /></div>
        <div className="Footer">Footer</div>
      </div>
    );
  }
}

export default App;