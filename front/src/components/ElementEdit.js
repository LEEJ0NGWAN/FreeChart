import React, { Component } from 'react';

function computePos(offset, length, limit) {
    let offset_ = offset;
    let l_ = offset-Math.round(length/2);
    let r_ = offset+Math.round(length/2);

    if (l_ < 0) {
        offset_ -= l_;
    }
    else if (limit < r_) {
        offset_ -= (r_ - limit);
    }
    return offset_;
}

class NodeEdit extends Component {
    state = {
        label: "",
        ref: React.createRef()
    }

    componentDidMount() {
        this.labelInput.focus();
        this.setState({
            label: this.props.label,
            innerWidth: this.state.ref.current.offsetWidth,
            innerHeight: this.state.ref.current.offsetHeight,
            width: this.state.ref.current.parentNode.offsetWidth,
            height: this.state.ref.current.parentNode.offsetHeight
        });
    }

    changer = (event) => {
        let nextState = {};
        nextState[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    processor = (event) => {
        switch(event.target.getAttribute('name')) {
            case 'label':
            case 'modify':
                if(this.state.label !== this.props.label)
                    this.props.modify(this.state.label);
                break;
            case 'delete':
                this.props.delete();
                break;
            default:
                break;
        }
        this.props.togglePop();
    }

    renderSaveIcon() {
        return(<svg name="modify"
        className="element-modal-icon"
        onClick={this.processor}
        width="24" height="24" viewBox="0 0 24 24">
        <path name="modify"
        d="M13 3h2.996v5h-2.996v-5zm11 
        1v20h-24v-24h20l4 4zm-17 
        5h10v-7h-10v7zm15-4.171l-2.828-2.829h-.172v9h-14v-9h-3v20h20v-17.171z"/>
        </svg>);
    }

    renderDeleteIcon() {
        return(<svg name="delete"
        className="element-modal-icon"
        onClick={this.processor}
        width="24" height="24" viewBox="0 0 24 24">
        <path name="delete"
        d="M9 19c0 .552-.448 1-1 
        1s-1-.448-1-1v-10c0-.552.448-1 
        1-1s1 .448 1 1v10zm4 0c0 .552-.448 
        1-1 1s-1-.448-1-1v-10c0-.552.448-1 
        1-1s1 .448 1 1v10zm4 0c0 .552-.448 
        1-1 1s-1-.448-1-1v-10c0-.552.448-1 
        1-1s1 .448 1 1v10zm5-17v2h-20v-2h5.711c.9 0 
        1.631-1.099 1.631-2h5.315c0 .901.73 2 
        1.631 2h5.712zm-3 4v16h-14v-16h-2v18h18v-18h-2z"/></svg>);
    }

    render() {
        const {innerWidth, innerHeight, width, height} = this.state;
        const {x, y} = this.props;

        let x_ = computePos(x,innerWidth,width);
        let y_ = computePos(y,innerHeight,height);

        return(
            <div 
            className="element-modal" 
            onClick={()=>{this.props.togglePop();}}>
                <div
                className="element-modal-content"
                onClick={(e)=>{e.stopPropagation();}}
                ref={this.state.ref}
                style={{
                    top: y_+'px',
                    left: x_+'px'
                }}>
                    <input
                    name="label" 
                    type="text"
                    value={this.state.label}
                    className="element-modal-edit-input"
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
                    {this.renderSaveIcon()}
                    {this.renderDeleteIcon()}
                </div>
                
            </div>
        )
    }
}

export default NodeEdit;

