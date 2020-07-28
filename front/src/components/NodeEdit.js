import React, { Component } from 'react';
import './NodeEdit.css';

class NodeEdit extends Component {
    state = {
        ref: React.createRef()
    }

    render() {
        let x = this.props.x+'px';
        let y = this.props.y+'px';
        return(
            <div className="modal"
            onClick={this.props.togglePop}>
                <div
                onClick={(e)=>{e.stopPropagation();}}
                ref={this.state.ref}
                className="modal_content"
                style={{
                    top: y,
                    left: x
                }}>
                    <input defaultValue="라벨"></input>
                    <button>수정</button>
                    <button>삭제</button>
                </div>
                
            </div>
        )
    }
}

export default NodeEdit;

