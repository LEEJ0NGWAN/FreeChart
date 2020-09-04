import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError } from '../actions/common';
import { getElement, editElement, RESET } from '../actions/element_api';
import { action, fetch } from '../actions/common';
import { Network } from 'vis-network/standalone/esm/vis-network';
import ElementEdit from './ElementEdit';
import { v4 as uuid } from 'uuid';

const DELETE = 0;
const CREATE = 1;
const MODIFY = 2;

const NODE = 0;
const EDGE = 1;

export const BLANK = " ";

const historySize = 15;

const DEFAULT_NODE_SHAPE = 'ellipse';
const DEFAULT_NODE_COLOR = '#dddddd';
const DEFAULT_NODE_FONT = '14';
const DEFAULT_NODE_NAME = '새로운 노드';

const DEFAULT_EDGE_WIDTH = 3;
const DEFAULT_EDGE_ARROW = true;
const DEFAULT_EDGE_DASHES = false;

const SELECTED_NODE_COLOR = '#faebd7'; //antique white;

const SELECTED_NODE_TOOLTIP = "새로운 선을 그리기 위한 목적지 노드를 길게 눌러주세요";

const getSubset = 
    (obj, ...keys) => keys.reduce(
        (a, c) => ({ ...a, [c]: obj[c] }), {});

const style = {
    position: 'absolute',
    left: '5px',
    right: '5px',
    bottom: '25px',
    height: 'calc(100% - 100px)',
    border: '1px solid #000000',
    borderRadius: '0.25em'
};

const nodePreset = {
    font: DEFAULT_NODE_FONT,
    label: DEFAULT_NODE_NAME,
    shape: DEFAULT_NODE_SHAPE,
    color: DEFAULT_NODE_COLOR,
}

const edgePreset = {
    arrow: DEFAULT_EDGE_ARROW,
    arrows: {
        to: {
            enabled: true,
            imageHeight: 1,
            imageWidth: 1,
            scaleFactor: 1,
            type: 'arrow'
        }
    },
    label: BLANK,
    width: DEFAULT_EDGE_WIDTH,
    dashes: DEFAULT_EDGE_DASHES,
};

const options = {
    edges: {
        arrowStrikethrough: false,
        arrows: {
            from: {
                enabled: true,
                imageHeight: 1,
                imageWidth: 1,
                scaleFactor: 0,
                type: "image"
            },
            to: {
                enabled: true,
                imageHeight: 1,
                imageWidth: 1,
                scaleFactor: 0,
                type: "arrow"
            },
        },
        label: BLANK,
        width: DEFAULT_EDGE_WIDTH,
        dashes: DEFAULT_EDGE_DASHES,
        smooth: {
            type: "continuous",
            forceDirection: "none"
        },
        color: 'rgba(0,0,0,0.85)',
    },
    autoResize: true,
    physics: {
        enabled: false,
    },
    layout: {
        randomSeed: 0
    },
};

function truncHistory(history, pivot) {
    if (history.length > historySize)
        history.splice(0, 1);
    else
        history.splice(pivot);
}

function makeEvent(elementId, elementType, state, data=null) {
    let newEvent = {
        id: elementId,
        type: elementType,
        state: state,
    }
    if (data) {
        Object.keys(data).forEach((key)=> {
            newEvent[key] = data[key];
        });
    }

    return newEvent;
}

function eventGenerator() {
    const events = {
        click: function(event) {
            const {nodes} = event;
            if (!nodes.length && this.state.from)
                this.setState({from: null});
        }.bind(this),
        hold: function(event) {
            const network = this.network.body.data;
            const {nodes, edges} = event;
            if (nodes.length) {
                const nodeId = nodes[0];
                if (this.state.from) {
                    if (this.state.to[nodeId]) {
                        this.setState({from: null});
                    }
                    else {
                        let edge = {
                            id: uuid(),
                            from: this.state.from,
                            to: nodeId,
                            ...edgePreset,
                        };
    
                        let nextState = {
                            from: null,
                            edgeStates: { ...this.state.edgeStates},
                            history: [ ...this.state.history],
                            historyPivot: this.nextPivot(),
                        };
                        nextState.history[this.state.historyPivot] =
                            makeEvent(edge.id,EDGE,CREATE,edge);
                        nextState.edgeStates[edge.id] = CREATE;
                        truncHistory(
                            nextState.history, nextState.historyPivot);
    
                        this.setState(nextState);
                        network.edges.add(edge);
                    }
                    this.network.unselectAll();
                }
                else {
                    let nextState = {
                        from: nodeId,
                        to: {}
                    };
                    
                    edges.forEach((edgeId)=>{
                        const edge = network.edges._data.get(edgeId);

                        if (edge.from === nodeId) {
                            nextState.to[edge.to] = true;
                        }
                    });

                    this.setState(nextState);
                }
            }
            else if (!nodes.length && edges.length) {
                const edgeId = edges[0];
                const {x, y} = event.pointer.DOM;
                const edgeData = network.edges._data.get(edgeId);

                this.setElementInfo(edgeId,EDGE,edgeData,x,y);
            }
        }.bind(this),
        doubleClick: function(event) {
            const network = this.network.body.data;
            const {nodes, edges} = event;
            if (!nodes.length && !edges.length) {
                const {x, y} = event.pointer.canvas;
                let node = {
                    id: uuid(),
                    x: x, y: y,
                    x_: x, y_: y,
                    ...nodePreset,
                };

                let nextState = {
                    nodeStates: { ...this.state.nodeStates},
                    history: [ ...this.state.history],
                    historyPivot: this.nextPivot(),
                };
                nextState.history[this.state.historyPivot] =
                    makeEvent(node.id,NODE,CREATE,node);
                truncHistory(
                    nextState.history, nextState.historyPivot);

                if (this.state.from)
                    nextState.from = null;

                nextState.nodeStates[node.id] = CREATE;
                
                this.setState(nextState);
                network.nodes.add(node);
            }
            else if (!nodes.length && edges.length) {
                const edgeId = edges[0];
                const {x, y} = event.pointer.DOM;
                const edgeData = network.edges._data.get(edgeId);

                this.setElementInfo(edgeId,EDGE,edgeData,x,y);
            }
            else {
                const nodeId = nodes[0];
                const {x, y} = event.pointer.DOM;
                const nodeData = network.nodes._data.get(nodeId);
                const {edges} = event;

                this.setElementInfo(nodeId,NODE,nodeData,x,y,edges);
            }
        }.bind(this),
        dragEnd: function(event) {
            const nodeId = event.nodes[0];
            if (!nodeId)
                return;

            const {x, y} = event.pointer.canvas;
            const network = this.network.body.data;
            const _x = network.nodes._data.get(nodeId).x;
            const _y = network.nodes._data.get(nodeId).y;

            network.nodes._data.get(nodeId).x_ = x;
            network.nodes._data.get(nodeId).y_ = y;

            let nextState = {
                nodeStates: {
                    ...this.state.nodeStates
                },
                history: [ ...this.state.history],
                historyPivot: this.nextPivot(),
            };
            let data = {x: [_x, x], y: [_y, y]};

            if (!nextState.nodeStates[nodeId]) {
                nextState.nodeStates[nodeId] = MODIFY;
                data.isFirstUpdate = true;
            }
            
            nextState.history[this.state.historyPivot] =
                makeEvent(nodeId, NODE, MODIFY, data);
            truncHistory(
                nextState.history, nextState.historyPivot);

            this.setState(nextState);
        }.bind(this),
        zoom: function() {
            this.setState({
                isZoomMode: true,
            });
        }.bind(this),
    };
    return events;
}

class Sheet extends Component {
    state = {
        history: [],
        historyPivot: 0,
        networkRef: React.createRef(),
        popped: false,
        nodeStates: {},
        edgeStates: {},
        from: null,
        to: {},
        tooltipMessage: "",
        isZoomMode: false,
    };

    prevPivot = () => {
        const {historyPivot} = this.state;
        return (!historyPivot)? historyPivot: historyPivot-1;
    }

    nextPivot = () => {
        const {historyPivot} = this.state;
        return (historyPivot === historySize)? 
                historyPivot: historyPivot+1;
    }

    togglePop = () => {
        this.setState({popped: !this.state.popped});
    }

    setElementInfo = 
    (elementId, elementType, elementData=null, x=null, y=null, edges=null) => {        
        let nextState = {
            popped: !this.state.popped,
            elementId: elementId,
            elementType: elementType,
            elementData: elementData,
            x: x, y: y,
            edges: edges
        };

        if (this.state.from)
            nextState.from = null;
        
        this.setState(nextState);
    }

    fetchElements = async () => {
        const {sheetId} = this.props;
        await this.props.getElement(sheetId);
    }

    graphInitializer = () => {
        const {nodes, edges} = this.props;

        const data = {
            nodes: nodes,
            edges: edges
        }

        const {networkRef} = this.state;
        this.network = new Network(networkRef.current, data, options);
        this.network.redraw();
    }

    eventInitializer = () => {
        const events = eventGenerator.bind(this)();
        Object.keys(events).forEach((key)=>{
            this.network.on(key, events[key]);
        });
    }

    backgroundInitializer = () => {
        const ctx = this.network.canvas.getContext();

        ctx.save();

        ctx.globalAlpha = 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.filter = "none";


        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.restore();
    }

    initializer = async () => {
        this.props.toggleProfile(false);
        await this.fetchElements();
        this.graphInitializer();
        this.eventInitializer();
    }

    modifyElement = (data) => {
        const keys = Object.keys(data);
        if (!keys.length)
            return;

        const network = this.network.body.data;
        const {elementId, elementData, elementType} = this.state;
        let elements, elementStates;
        let element = {id:elementId}, info = {};
        let nextState = {
            historyPivot: this.nextPivot(),
            history: [ ...this.state.history]
        };

        if (elementType) {
            elements = network.edges;
            elementStates = { ...this.state.edgeStates};
            nextState.edgeStates = elementStates;
        }
        else {
            elements = network.nodes;
            elementStates = { ...this.state.nodeStates};
            nextState.nodeStates = elementStates;
        }

        keys.forEach((key)=>{
            element[key] = data[key];
            info[key] = [elementData[key], data[key]];
        });

        elements.update(element);

        if (!elementStates[elementId]) {
            elementStates[elementId] = MODIFY;
            info.isFirstUpdate = true;
        }

        nextState.history[this.state.historyPivot] =
            makeEvent(elementId, elementType, MODIFY, info);
        truncHistory(nextState.history, nextState.historyPivot);

        this.setState(nextState);
    }

    deleteElement = () => {
        const network = this.network.body.data;
        const {elementId, elementData, elementType} = this.state;
        let elements, elementStates;
        let info = { ...elementData};
        let nextState = {
            historyPivot: this.nextPivot(),
            history: [ ...this.state.history]
        };

        if (elementType) {
            elements = network.edges;
            elementStates = { ...this.state.edgeStates};
            nextState.edgeStates = elementStates;
        }
        else {
            elements = network.nodes;
            elementStates = { ...this.state.nodeStates};
            nextState.nodeStates = elementStates;
        }

        if (elementStates[elementId] === CREATE)
            delete elementStates[elementId];
        
        else {
            info.isFirstUpdate = 
                !Boolean(elementStates[elementId]);
            elementStates[elementId] = DELETE;
        }

        elements.remove(elementId);

        nextState.history[this.state.historyPivot] = 
            makeEvent(elementId, elementType, DELETE, info);
        truncHistory(nextState.history, nextState.historyPivot);

        this.setState(nextState);
    }

    save = async () => {
        const network = this.network.body.data;
        const {sheetId} = this.props;
        const {nodeStates, edgeStates} = this.state;

        const nodes = getSubset(
            Object.fromEntries(network.nodes._data.entries()), 
            ...Object.keys(nodeStates));
        const edges = getSubset(
            Object.fromEntries(network.edges._data.entries()),
            ...Object.keys(edgeStates));
        
        this.props.update();
        await this.props.editElement(
            sheetId,nodes,edges,nodeStates,edgeStates);
        await this.fetchElements();
    }

    reset = () => {
        const {nodes, edges} = this.network.body.data;

        this.setState({
            nodeStates: {},
            edgeStates: {},
            history: [],
            historyPivot: 0,
            from: null,
        });

        this.props.action(RESET);
        nodes.clear();
        edges.clear();
        nodes.add(this.props.nodes);
        edges.add(this.props.edges);
    }

    undo = () => {
        let nextState = {historyPivot: this.prevPivot()};
        const network = this.network.body.data;
        const {history} = this.state;
        const element = history[nextState.historyPivot];
        let elements, elementStates;

        if (element.type) {
            elements = network.edges;
            elementStates = { ...this.state.edgeStates};
            nextState.edgeStates = elementStates;
        }
        else {
            elements = network.nodes;
            elementStates = { ...this.state.nodeStates};
            nextState.nodeStates = elementStates;
        }

        switch (element.state) {
            case DELETE:
                elements.add(element);
                if (elementStates[element.id] === DELETE) {
                    if (element.isFirstUpdate)
                        delete elementStates[element.id];
                    else
                        elementStates[element.id] = MODIFY;
                }
                else
                    elementStates[element.id] = CREATE;
                break;
            case CREATE:
                elements.remove(element.id);
                delete elementStates[element.id];
                break;
            case MODIFY:
                let data = {id: element.id};
                Object.keys(element).forEach((key)=>{
                    if (key !== 'id' && key !== 'isFirstUpdate')
                        data[key] = element[key][0];
                });
                elements.update(data);
                if (element.isFirstUpdate)
                    delete elementStates[element.id];
                break;
            default:
                break;
        }
        this.setState(nextState);
    }

    redo = () => {
        let nextState = {historyPivot: this.nextPivot()};
        const network = this.network.body.data;
        const {history} = this.state;
        let element = history[this.state.historyPivot];
        let elements, elementStates;

        if (element.type) {
            elements = network.edges;
            elementStates = { ...this.state.edgeStates};
            nextState.edgeStates = elementStates;
        }
        else {
            elements = network.nodes;
            elementStates = { ...this.state.nodeStates};
            nextState.nodeStates = elementStates;
        }

        switch (element.state) {
            case DELETE:
                elements.remove(element.id);
                if (elementStates[element.id] === CREATE)
                    delete elementStates[element.id];
                else
                    elementStates[element.id] = DELETE;
                break;
            case CREATE:
                elements.add(element);
                elementStates[element.id] = CREATE;
                break;
            case MODIFY:
                let data = {id: element.id};
                Object.keys(element).forEach((key)=>{
                    if (key !== 'id' && key !== 'isFirstUpdate')
                        data[key] = element[key][1];
                });
                elements.update(data);
                if (element.isFirstUpdate)
                    elementStates[element.id] = MODIFY;
                break;
            default:
                break;
        }
        this.setState(nextState);
    }

    saveFile = () => {
        this.backgroundInitializer();
        const canvas = this.network.canvas.getContext().canvas;
        const dataURL = canvas.toDataURL('jpg');

        let a  = document.createElement('a');
        a.href = dataURL;
        a.download = 'image.jpg';
        a.click();
    }

    zoomReset = () => {
        this.network.fit();
        this.setState({
            isZoomMode: false
        });
    }

    componentDidMount() {
        this.initializer();
    }

    componentDidUpdate(prevProps, prevStates) {
        const {history, historyPivot} = this.state;
        const {saved} = this.props;
        if (!prevProps.saved && saved) {
            this.setState({
                nodeStates: {},
                edgeStates: {},
                history: [],
                historyPivot: 0,
                from: null,
            });
            this.props.action(RESET);
        }

        if (prevStates.historyPivot !== historyPivot) {
            this.resetIcon.style.fill =
                (historyPivot)? 'black': 'darkgray';
            this.undoIcon.style.fill = 
                (historyPivot)? 'black': 'darkgray';
            this.redoIcon.style.fill =
                (historyPivot !== history.length)? 
                    'black': 'darkgray';
            
            this.resetIcon.onclick =
                (historyPivot)? this.reset: null;
            this.undoIcon.onclick = 
                (historyPivot)? this.undo: null;
            
            this.redoIcon.onclick =
                (historyPivot !== history.length)?
                    this.redo: null;
        }

        if (!prevStates.from && this.state.from) {
            const fromId = this.state.from;
            const network = this.network.body.data;
            const color = network.nodes._data.get(fromId).color;
            network.nodes.update({
                id: fromId,
                color: SELECTED_NODE_COLOR,
                color_: color
            });
            this.setState({
                tooltipMessage: SELECTED_NODE_TOOLTIP
            });
        }

        if (prevStates.from && !this.state.from) {
            const fromId = prevStates.from;
            const network = this.network.body.data;
            const color = network.nodes._data.get(fromId).color_;
            network.nodes.update({
                id: fromId,
                color: color,
                color_: undefined
            });
            this.setState({
                tooltipMessage: ""
            })
        }
    }

    renderBackIcon() {
        return(<svg className="bs-item icon"
        onClick={()=>{this.props.escape();}}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M13.427 3.021h-7.427v-3.021l-6 5.39 6 
        5.61v-3h7.427c3.071 0 5.561 2.356 5.561 5.427 0 
        3.071-2.489 5.573-5.561 5.573h-7.427v5h7.427c5.84 0 
        10.573-4.734 10.573-10.573s-4.733-10.406-10.573-10.406z"/>
        </svg>);
    }

    renderSaveIcon() {
        return(<svg className="bs-item icon"
        onClick={this.save}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M13 3h2.996v5h-2.996v-5zm11 
        1v20h-24v-24h20l4 4zm-17 
        5h10v-7h-10v7zm15-4.171l-2.828-2.829h
        -.172v9h-14v-9h-3v20h20v-17.171z"/></svg>);
    }

    renderRefreshIcon() {
        return(<svg className="bs-item do-icon"
        ref={(reset)=>{this.resetIcon = reset}}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M20.944 12.979c-.489 4.509-4.306 
        8.021-8.944 8.021-2.698 0-5.112-1.194-6.763
        -3.075l1.245-1.633c1.283 1.645 3.276 2.708 
        5.518 2.708 3.526 0 6.444-2.624 6.923-6.021h
        -2.923l4-5.25 4 5.25h-3.056zm-15.864-1.979c.487-3.387 
        3.4-6 6.92-6 2.237 0 4.228 1.059 5.51 2.698l1.244
        -1.632c-1.65-1.876-4.061-3.066-6.754-3.066-4.632 
        0-8.443 3.501-8.941 8h-3.059l4 5.25 4-5.25h-2.92z"/></svg>);
    }

    renderUndoIcon() {
        return(<svg className="bs-item do-icon"
        ref={(undo)=>{this.undoIcon = undo}}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 
        9.167-2.83 2.829-12.17-11.996z"/></svg>);
    }

    renderRedoIcon() {
        return(<svg className="bs-item do-icon"
        ref={(redo)=>{this.redoIcon = redo}}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 
        2.83-2.829 12.17 11.996z"/></svg>);
    }

    renderPictureIcon() {
        return(<svg className="bs-item icon"
        onClick={this.saveFile}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M5 8.5c0-.828.672-1.5 1.5-1.5s1.5.672 
        1.5 1.5c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5zm9 
        .5l-2.519 4-2.481-1.96-4 5.96h14l-5-8zm8-4v14h-20v
        -14h20zm2-2h-24v18h24v-18z"/></svg>);
    }

    renderZoomResetIcon() {
        return(<svg className="bs-item icon"
        onClick={this.zoomReset}
        width="24" height="24" 
        fillRule="evenodd" clipRule="evenodd">
        <path d="M13.818 16.646c-1.273.797-2.726 
        1.256-4.202 1.354l-.537-1.983c2.083-.019 
        4.132-.951 5.49-2.724 2.135-2.79 1.824
        -6.69-.575-9.138l-1.772 2.314-1.77-6.469h6.645l-1.877 
        2.553c3.075 2.941 3.681 7.659 1.423 11.262l7.357 
        7.357-2.828 2.828-7.354-7.354zm-11.024-1.124c-1.831
        -1.745-2.788-4.126-2.794-6.522-.005-1.908.592-3.822 
        1.84-5.452 1.637-2.138 4.051-3.366 6.549-3.529l.544 
        1.981c-2.087.015-4.142.989-5.502 2.766-2.139 2.795
        -1.822 6.705.589 9.154l1.774-2.317 1.778 6.397h
        -6.639l1.861-2.478z"/></svg>);
    }

    render() {
        const {historyPivot, isZoomMode} = this.state;
        const tooltip = (
            <label className="tooltip-label">
                {this.state.tooltipMessage}
            </label>
        )
        const pwd = (
            <label className="pwd">
                {(this.props.pwd.length <= 50)? this.props.pwd:
                `...`+this.props.pwd.substring(this.props.pwd.length-50)}
            </label>
        )
        const menu = (
            <div className="sheet-menu">
                {this.renderBackIcon()}
                {this.renderPictureIcon()}
                {Boolean(historyPivot) && 
                this.renderSaveIcon()}
                {isZoomMode &&
                this.renderZoomResetIcon()}
                {this.renderRefreshIcon()}
                {this.renderRedoIcon()}
                {this.renderUndoIcon()}
            </div>
        )
        return (
            <div>
                {tooltip}
                {menu}
                {pwd}
                {this.state.popped && 
                <ElementEdit 
                togglePop={this.togglePop}
                modify={this.modifyElement}
                delete={this.deleteElement}
                type={this.state.elementType}
                data={this.state.elementData}
                x={this.state.x}
                y={this.state.y}/>}
                <div
                ref={this.state.networkRef}
                style={style}/>
            </div>
        )
    }
}

export default connect((state) => {
    return {
        nodes: state.elementReducer.nodes,
        edges: state.elementReducer.edges,
        saved: state.elementReducer.saved
    };
}, { editElement, getElement,
     clearError, fetch, action })(Sheet);

