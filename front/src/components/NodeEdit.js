import React, { Component } from 'react';
import './NodeEdit.css';

class NodeEdit extends Component {
    state = {
        label: "",
        ref: React.createRef()
    }

    componentDidMount() {
        this.labelInput.focus();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            label: nextProps.label
        });
    }

    changer = (event) => {
        let nextState = {};
        nextState[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    processor = (event) => {
        switch(event.target.name) {
            case 'label':
            case 'modify':
                if(this.state.label !== this.props.label)
                    this.props.modifyNode(this.state.label);
                break;
            case 'delete':
                this.props.deleteNode();
                break;
            default:
                break;
        }
        this.props.togglePop();
    }

    render() {
        let x = this.props.x+'px';
        let y = this.props.y+'px';
        return(
            <div 
            className="modal" 
            onClick={()=>{this.props.togglePop();}}>
                <div
                className="modal_content"
                onClick={(e)=>{e.stopPropagation();}}
                ref={this.state.ref}
                style={{
                    top: y,
                    left: x
                }}>
                    <input
                    name="label" 
                    type="text"
                    value={this.state.label}
                    onChange={this.changer}
                    onKeyPress={(e)=>{
                        if (e.key === "Enter")
                            this.processor(e);
                    }}
                    onKeyDown={(e)=>{
                        if (e.key === "Escape")
                            this.props.togglePop();
                    }}
                    ref={(input)=>{this.labelInput = input}}/>
                    <button 
                    name='modify' 
                    onClick={this.processor}>수정</button>
                    <button 
                    name='delete' 
                    onClick={this.processor}>삭제</button>
                </div>
                
            </div>
        )
    }
}

export default NodeEdit;

