import React, { Component } from 'react';
import './NodeEdit.css';

class NodeEdit extends Component {
    state = {
        label: "",
        ref: React.createRef()
    }

    changer = (event) => {
        let nextState = {};
        nextState[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    render() {
        let x = this.props.x+'px';
        let y = this.props.y+'px';
        return(
            <div className="modal"
            onClick={()=>{this.props.togglePop();}}>
                <div
                onClick={(e)=>{e.stopPropagation();}}
                ref={this.state.ref}
                className="modal_content"
                style={{
                    top: y,
                    left: x
                }}>
                    <input 
                    name="label" 
                    type="text" 
                    value={this.state.label}
                    onChange={this.changer}/>
                    <button
                    onClick={()=>{
                        this.props.fetchInfo(
                            this.props.nodeId,
                            null,null,
                            this.state.label,true)}}>수정</button>
                    <button>삭제</button>
                </div>
                
            </div>
        )
    }
}

export default NodeEdit;

