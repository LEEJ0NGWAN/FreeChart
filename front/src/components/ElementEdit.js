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
        label: "",
        ref: React.createRef()
    }

    componentDidMount() {
        this.labelInput.focus();
        let nextState = {
            innerWidth: this.state.ref.current.offsetWidth,
            innerHeight: this.state.ref.current.offsetHeight,
            outerWidth: this.state.ref.current.parentNode.offsetWidth,
            outerHeight: this.state.ref.current.parentNode.offsetHeight,
        };
        const {label, width, arrows, dashes} = this.props.data;

        if (label !== BLANK)
            nextState.label = label;
        
        if (width)
            nextState.width = width;
        if (arrows)
            nextState.arrows = arrows;
        if (dashes !== undefined)
            nextState.dashes = dashes;

        this.setState(nextState);
    }

    changer = (event) => {
        let nextState = {};
        nextState[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    optionSwitcher = (event) => {
        const {name} = event.target;
        let nextState = {};

        switch (name) {
            case 'dashes':
                nextState.dashes = !this.state.dashes;
                break;
            case 'arrows':
                nextState.arrows = {
                    to:{enabled:!this.state.arrows.to.enabled}};
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
                const {label} = this.state;
                let _label = label? label: BLANK;
                if (this.props.type) {
                    const pre = this.props.data;
                    const {width, dashes, arrows} = this.state;
                    const arrow = arrows.to.enabled;

                    let label_ = (_label !== pre.label)? _label: null;
                    let width_ = (width !== pre.width)? width: null;
                    let dashes_ = (dashes !== pre.dashes)? dashes: null;
                    let arrow_ = 
                        (arrow !== pre.arrows.to.enabled)? arrow: null;
                    
                    this.props.modifyEdge(label_,dashes_,arrow_,width_);
                }
                else {
                    if (_label !== this.props.data.label)
                        this.props.modify(_label);
                }
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
            if (1 < this.state.width)
            this.setState({width:this.state.width-1})}}
        width="18" height="18" viewBox="0 0 24 24">
        <path d="M3 12l18-12v24z"/></svg>);
    }

    renderRightIcon() {
        return(<svg
        onClick={()=>{
            if (this.state.width < 9)
            this.setState({width:this.state.width+1})}}
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
                        {this.state.width}
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
                        defaultChecked={this.state.dashes}/>
                        점선
                    </label>
                    {Boolean(this.state.arrows) &&
                    <label style={{fontSize:'70%'}}>
                        <input 
                        name="arrows" type="checkbox"
                        onChange={this.optionSwitcher}
                        defaultChecked={this.state.arrows.to.enabled}/>
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
                    <input
                    name="label" 
                    type="text"
                    autoComplete="off"
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

