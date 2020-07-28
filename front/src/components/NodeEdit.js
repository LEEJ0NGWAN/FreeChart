import React, { Component } from 'react';
import { connect } from 'react-redux';
import './NodeEdit.css';

class NodeEdit extends Component {
    render() {
        let x = this.props.x;
        let y = this.props.y;
        return(
            <div className="modal"
            onClick={()=>{this.props.togglePop();}}>
                    <div 
                    className="modal_content"
                    style={{
                        top: y+'px',
                        left: x+'px'
                    }}>
                        hi~hello~
                        <button>hi</button>
                    </div>
                    
            </div>
        )
    }
}

export default NodeEdit;

// export default connect((state) => {
//     return {
//         error_msg: state.commonReducer.error_msg,
//         error_code: state.commonReducer.error_code,
//     };
// }, {})(NodeEdit);

