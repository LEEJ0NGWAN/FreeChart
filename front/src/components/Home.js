import React, { Component } from 'react';
import { connect } from 'react-redux';

class Home extends Component {
    componentDidMount() {
        const {logged, history} = this.props;
        if (logged) return;
        
        history.push('/login');

    }

    componentDidUpdate() {
        // pass
    }
  
    renderUser() {
        return JSON.stringify(this.props.user);
    }
  
    render() {
        return (
            <div>
            <h2>Home</h2>
            <ul>
                {this.renderUser()}
            </ul>
            </div>
        );
    }
}

export default connect((state) => {
    return {
      user: state.userReducer.user,
      logged: state.userReducer.logged
    };
  }, {})(Home);

