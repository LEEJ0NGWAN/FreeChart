import { BLANK } from './Sheet';
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
        data: {label: ""},
        ref: React.createRef(),
    }

    componentDidMount() {
        this.keyPressed = {};
        this.labelInput.focus();
        let nextState = {
            data: this.props.data,
            innerWidth: this.state.ref.current.offsetWidth,
            innerHeight: this.state.ref.current.offsetHeight,
            outerWidth: this.state.ref.current.parentNode.offsetWidth,
            outerHeight: this.state.ref.current.parentNode.offsetHeight,
        };
        const {label} = this.props.data;

        if (label === BLANK)
            delete nextState.data.label;

        this.setState(nextState);
    }

    changer = (event) => {
        let nextState = {data: {...this.state.data}};
        nextState.data[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    optionSwitcher = (event) => {
        const {name} = event.target;
        let nextState = {
            data: { ...this.state.data}};

        switch (name) {
            case 'dashes':
                nextState.data.dashes = !this.state.data.dashes;
                break;
            case 'arrows':
                nextState.data.arrows = {
                    to:{enabled:!this.state.data.arrows.to.enabled}};
                break;
            default:
                break;
        }

        this.setState(nextState);
    }

    processor = (event) => {
        switch(event.target.getAttribute('name')) {
            case 'label':
            case 'modify':
                const now = this.state.data;
                const pre = this.props.data;
                const keys = Object.keys(pre);

                let data = {};

                keys.forEach((key)=>{
                    let newVal = now[key];
                    let preVal = pre[key];
                    if (key === 'label')
                        newVal = now.label || BLANK;
                    else if (key === 'arrows')
                        newVal = 
                            (preVal.to.enabled === newVal.to.enabled)?
                                preVal: newVal;
                    
                    if (newVal !== preVal)
                        data[key] = newVal;
                });

                this.props.modify(data);
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

    renderLeftIcon() {
        return(<svg
        onClick={()=>{
            if (1 < this.state.data.width)
                this.setState({
                    data: {
                        ...this.state.data,
                        width: this.state.data.width-1}});
        }}
        width="18" height="18" viewBox="0 0 24 24">
        <path d="M3 12l18-12v24z"/></svg>);
    }

    renderRightIcon() {
        return(<svg
        onClick={()=>{
            if (this.state.data.width < 9)
                this.setState({
                    data: {
                        ...this.state.data,
                        width: this.state.data.width+1}});
        }}
        width="18" height="18" viewBox="0 0 24 24">
        <path d="M21 12l-18 12v-24z"/></svg>);
    }

    render() {
        const {innerWidth, innerHeight, outerWidth, outerHeight} = this.state;
        const {x, y} = this.props;

        let x_ = computePos(x,innerWidth,outerWidth);
        let y_ = computePos(y,innerHeight,outerHeight);

        const edgeOption = (
            <div className="element-modal-edge-option-box">
                <div title="width" className="edge-option-item">
                    <label className="edge-option-label">
                        굵기
                    </label>
                    {this.renderLeftIcon()}
                    <label>
                        {this.state.data.width}
                    </label>
                    {this.renderRightIcon()}
                </div>
                <div title="dashes" className="edge-option-item">
                    <label className="edge-option-label">
                        모양
                    </label>
                    <label style={{fontSize:'70%'}}>
                        <input 
                        name="dashes" type="checkbox"
                        onChange={this.optionSwitcher}
                        defaultChecked={this.state.data.dashes}/>
                        점선
                    </label>
                    {Boolean(this.state.data.arrows) &&
                    <label style={{fontSize:'70%'}}>
                        <input 
                        name="arrows" type="checkbox"
                        onChange={this.optionSwitcher}
                        defaultChecked={
                            this.state.data.arrows.to.enabled}/>
                        화살표
                    </label>}
                </div>
            </div>
        )
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
                    {Boolean(this.props.type) && edgeOption}
                    <textarea
                    name="label" 
                    autoComplete="off"
                    value={this.state.data.label}
                    className="element-modal-edit-input"
                    onChange={this.changer}
                    onKeyDown={e=>{
                        this.keyPressed[e.key] = true;
                        if (!this.keyPressed.Shift && 
                            this.keyPressed.Enter)
                            this.processor(e);
                        if (e.key === "Escape")
                            this.props.togglePop();
                    }}
                    onKeyUp={e=>{
                        delete this.keyPressed[e.key];
                    }}
                    ref={(input)=>{this.labelInput = input}}>
                    </textarea>
                    {this.renderSaveIcon()}
                    {this.renderDeleteIcon()}
                </div>
                
            </div>
        )
    }
}

export default NodeEdit;

