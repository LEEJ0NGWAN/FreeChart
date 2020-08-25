import { BLANK } from './Sheet';
import React, { Component } from 'react';
import { ChromePicker } from 'react-color';

const OFF = 0;
const NODE_SHAPE = 1;
const NODE_COLOR = 2;

const ADD = true;
const SUB = false;

const EDGE_MIN_WIDTH = 1;
const EDGE_MAX_WIDTH = 9;
const NODE_MIN_FONT = 8;
const NODE_MAX_FONT = 20;

const SHAPE_INFO = {
    'text': '(없음)',
    'ellipse': '타원',
    'circle': '원',
    'database': 'DB',
    'box': '박스',
    'diamond': '다이아몬드',
    'star': '별',
    'triangle': '삼각형',
    'triangleDown': '역삼각형',
    'hexagon': '헥사곤',
    'square': '사각형'
};

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
        detailMode: OFF,
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

        if (this.props.type) {
            this.variateTarget = 'width';
            this.variateMinLim = EDGE_MIN_WIDTH;
            this.variateMaxLim = EDGE_MAX_WIDTH;
        }
        else {
            this.variateTarget = 'font';
            this.variateMinLim = NODE_MIN_FONT;
            this.variateMaxLim = NODE_MAX_FONT;
            nextState.data.font = Number(nextState.data.font);
        }

        const {label} = this.props.data;

        if (label === BLANK)
            nextState.data.label = "";

        this.setState(nextState);
    }

    changer = (event) => {
        let nextState = {data: {...this.state.data}};
        nextState.data[event.target.name] = event.target.value;
        this.setState(nextState);
    }

    variator = (mod=ADD) => {
        let nextState = {data: { ...this.state.data}};

        if (mod &&
            this.variateMaxLim === nextState.data[this.variateTarget])
            return;
        
        if (!mod &&
            this.variateMinLim === nextState.data[this.variateTarget])
            return;

        nextState.data[this.variateTarget] += (mod)? 1: -1;
        this.setState(nextState);
    }

    colorChanger = (color) => {
        this.setState({
            data: {
                ...this.state.data,
                color: color.hex
            }
        });
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
                    else if (key === 'font') {
                        pre[key] = String(preVal);
                        newVal = String(newVal);
                    }
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
        onClick={()=>this.variator(SUB)}
        width="18" height="18" viewBox="0 0 24 24">
        <path d="M3 12l18-12v24z"/></svg>);
    }

    renderRightIcon() {
        return(<svg
        onClick={()=>this.variator(ADD)}
        width="18" height="18" viewBox="0 0 24 24">
        <path d="M21 12l-18 12v-24z"/></svg>);
    }

    renderNodeShapeList() {
        let shapeList = [];
        Object.keys(SHAPE_INFO).forEach((key)=>{
            const className = (key === this.state.data.shape)?
                'selected node-shape-item': 'node-shape-item';
            shapeList.push(
                <p className={className} key={key}
                onClick={()=>{
                    this.setState({
                        data: {
                            ...this.state.data,
                            shape: key,
                        }
                    })
                }}>
                    {SHAPE_INFO[key]}
                </p>
            );
        });

        return shapeList;
    }

    renderDetailOption() {
        return (
        <div
        className="detail-modal"
        onClick={e=>{
            e.stopPropagation();
            this.setState({detailMode: OFF})}}>
            {(this.state.detailMode === NODE_SHAPE) &&
            <div className="node-shape-box">
                <label className="node-shape-label">
                    모양
                </label>
                {this.renderNodeShapeList()}
            </div>}
            {(this.state.detailMode === NODE_COLOR) &&
            <div className="color-box"
            onClick={e=>e.stopPropagation()}>
                <ChromePicker
                color={this.state.data.color}
                onChange={this.colorChanger}
                disableAlpha={true}/>
            </div>}
        </div>);
    }

    render() {
        const {innerWidth, innerHeight, outerWidth, outerHeight} = this.state;
        const {x, y} = this.props;

        let x_ = computePos(x,innerWidth,outerWidth);
        let y_ = computePos(y,innerHeight,outerHeight);

        const nodeOption = (
            <div className="element-option-box">
                <div title="font" className="element-option-item">
                    <label className="element-option-label">
                        폰트 크기
                    </label>
                    {this.renderLeftIcon()}
                    {this.state.data.font}
                    {this.renderRightIcon()}
                </div>
                <div title="shape" 
                className="element-option-item"
                onClick={()=>this.setState({detailMode: NODE_SHAPE})}>
                    <label className="element-option-label">
                        모양
                    </label>
                    <label style={{fontSize: '50%'}}>
                        {SHAPE_INFO[this.state.data.shape]}</label>
                </div>
                <div title="shape" 
                className="element-option-item"
                onClick={()=>this.setState({detailMode: NODE_COLOR})}>
                    <label className="element-option-label">
                        색
                    </label>
                    <div className="node-color-sample"
                    style={{backgroundColor:this.state.data.color}}/>
                    <label style={{fontSize: '50%'}}>
                        {this.state.data.color}</label>
                </div>
            </div>
        )
        const edgeOption = (
            <div className="element-option-box">
                <div title="width" className="element-option-item">
                    <label className="element-option-label">
                        굵기
                    </label>
                    {this.renderLeftIcon()}
                    <label>
                        {this.state.data.width}
                    </label>
                    {this.renderRightIcon()}
                </div>
                <div title="dashes" className="element-option-item">
                    <label className="element-option-label">
                        모양
                    </label>
                    {Boolean(this.state.data.arrows) &&
                    <label style={{fontSize:'70%'}}>
                        <input 
                        name="dashes" type="checkbox"
                        onChange={this.optionSwitcher}
                        defaultChecked={this.state.data.dashes}/>
                        점선
                    </label>}
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
                {Boolean(this.state.detailMode) &&
                this.renderDetailOption()}
                <div
                className="element-modal-content"
                onClick={(e)=>{e.stopPropagation();}}
                ref={this.state.ref}
                style={{
                    top: y_+'px',
                    left: x_+'px'
                }}>
                    {Boolean(this.props.type)?
                    edgeOption: nodeOption}
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

