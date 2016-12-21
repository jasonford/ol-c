import React, { Component } from 'react';
import firebase from 'firebase';
import './ReactFireComponent.css';
import credentials from '../credentials.json';

// Initialize Firebase
firebase.initializeApp(credentials.firebase);

class ReactFireComponent extends Component {
  componentWillMount() {
    this.url = this.props.url;
    let component = this;
    this.dbref = firebase.database().ref(this.props.url);
    this.handleDBUpdate = (snapshot)=>{
      let val = snapshot.val();
      if (val) {
        component.setState(val);
      }
    };
    this.dbref.on("value", this.handleDBUpdate);

    firebase.auth().onAuthStateChanged((user)=>{
      component.forceUpdate();
    });
  }
  componentWillUnmount() { 
    this.dbref.off("value", this.handleDBUpdate);
  }
  //  update for new url prop
  componentWillUpdate(nextProps, nextState) {
    if (nextProps.url !== this.props.url) {
      let component = this;
      this.dbref.off("value", this.handleDBUpdate);

      this.dbref = firebase.database().ref(this.props.url);

      this.dbref.on("value", (snapshot)=>{
        let val = snapshot.val();
        if (val) {
          component.setState(val);
        }
      });
    }
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
      </pre>
    );
  }
}

export default ReactFireComponent;