import React, { Component } from 'react';
import firebase from 'firebase';
import './ReactFireComponent.css';
import credentials from '../credentials.json';

// Initialize Firebase
firebase.initializeApp(credentials.firebase);

class ReactFireComponent extends Component {
  componentWillMount() {
    let component = this;
    let ref = firebase.database().ref(this.props.url);
    ref.on("value", (snapshot)=>{
      let val = snapshot.val();
      if (val) {
        component.setState(val);
      }
    });

    firebase.auth().onAuthStateChanged((user)=>{
      component.forceUpdate();
    });
  }
  componentWillUpdate(propUpdate, stateUpdate) {
    if (stateUpdate) {
      let ref = firebase.database().ref(this.props.url);
      ref.update(stateUpdate);
    }
  }
  push(value) {
    let ref = firebase.database().ref(this.props.url);
    ref.push(value);
  }
  update(value) {
    let ref = firebase.database().ref(this.props.url);
    ref.update(value);
  }
  remove() {
    let ref = firebase.database().ref(this.props.url);
    ref.remove();
  }
  user() {
    return firebase.auth().currentUser;
  }
  render() {
    return (
      <pre className="ReactFireComponent">
        <span className="ReactFireComponentLabel">
          Firebase Data at "{this.props.url}":
        </span>
        {'\n'+JSON.stringify(this.state, null, 4)}
      }
      </pre>
    );
  }
}

export default ReactFireComponent;