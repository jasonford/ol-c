import React, { Component } from 'react';
import './App.css';
import Element from './Element';
import BreadCrumbs from './BreadCrumbs';
import AuthInfo from './AuthInfo';

class App extends Component {
  componentWillMount() {
    this.setState({});
  }
  componentDidMount() {
    let component = this;
    this.refs.left.addEventListener('touch', (event)=>{
      event.stopPropagation();
    });
    this.refs.root.addEventListener('swipeleft', (event)=>{
      component.setState({
        left : null
      });
    });
  }
  setPanel() {
    let component = this;
    return (panel, content)=>{
      let update = {};
      update[panel] = content;
      component.setState(update);
    };
  }
  render() {
    let leftPanelClass  = 'LeftPanel';
    let rightPanelClass = 'RightPanel';
    let mainPanelClass = 'MainPanel'

    if (this.state.left) {
      leftPanelClass += ' Open';
      mainPanelClass += ' LeftPanelOpen';
    }
    else {
      leftPanelClass += ' Closed';
    }

    if (this.state.right) {
      rightPanelClass += ' Open';
      mainPanelClass  += ' RightPanelOpen';
    }
    else {
      rightPanelClass += ' Closed';
    }

    return (
      <div className="App" ref="root">
        <div className={leftPanelClass} ref="left">{this.state.left}</div>
        <div className={rightPanelClass} ref="right">{this.state.right}</div>
        <div className={mainPanelClass}>
          <div className="Header">
            <BreadCrumbs />
            <AuthInfo />
          </div>
          <div className="Body"><Element url="/" setPanel={this.setPanel()}/></div>
          <div className="Footer"></div>
        </div>
      </div>
    );
  }
}

export default App;