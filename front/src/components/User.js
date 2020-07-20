import React, { Component } from 'react';
import { connect } from 'react-redux';

class User extends Component {
    render() {
        if (this.props.user){
            return(
                <div>
                <h2>YEE</h2>
                <ul>
                    {JSON.stringify(this.props.user)}
                </ul>
                </div>
            );
        }
        else{
            return(
                <div>
                    <h1>NOOOOO</h1>
                </div>
            )
        }
    }
}

export default connect((state) => {
    return {
      user: state.userReducer.user,
      logged: state.userReducer.logged
    };
  }, {})(User);

