import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError } from '../actions/common';
import { getElement, editElement, RESET } from '../actions/element_api';
import { action, fetch } from '../actions/common';
import Graph from 'react-graph-vis';
import ElementEdit from './ElementEdit';
import { v4 as uuid } from 'uuid';

const DELETE = 0;
const CREATE = 1;
const MODIFY = 2;

const NODE = 0;
const EDGE = 1;

export const BLANK = " ";

const historySize = 15;

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

const options = {
    nodes: {
        shape: "circle",
    },
    edges: {
        color: "#000000",
        arrowStrikethrough: false,
        width: 3,
        smooth: {
            type: "continuous",
            forceDirection: "none"
        },
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
            const network = this.state.networkRef.current;
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
                            label: BLANK,
                            arrows: {
                                to: {
                                    enabled: this.state.arrow
                                }
                            },
                            dashes: this.state.dashes,
                            width: this.state.width,
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
                    network.Network.unselectAll();
                }
                else {
                    let nextState = {
                        from: nodeId,
                        to: {}
                    };
                    
                    edges.forEach((edgeId)=>{
                        const edge = network.edges._data[edgeId];

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
                const edgeData = network.edges._data[edgeId];

                this.setElementInfo(edgeId,EDGE,edgeData,x,y);
            }
        }.bind(this),
        doubleClick: function(event) {
            const network = this.state.networkRef.current;
            const {nodes, edges} = event;
            if (!nodes.length && !edges.length) {
                const {x, y} = event.pointer.canvas;
                let node = {
                    id: uuid(),
                    label: '새로운 노드',
                    x: x, y: y
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
                const edgeData = network.edges._data[edgeId];

                this.setElementInfo(edgeId,EDGE,edgeData,x,y);
            }
            else {
                const nodeId = nodes[0];
                const {x, y} = event.pointer.DOM;
                const nodeData = network.nodes._data[nodeId];
                const {edges} = event;

                this.setElementInfo(nodeId,NODE,nodeData,x,y,edges);
            }
        }.bind(this),
        dragEnd: function(event) {
            const nodeId = event.nodes[0];
            if (!nodeId)
                return;

            const {x, y} = event.pointer.canvas;
            const network = this.state.networkRef.current;
            const _x = network.nodes._data[nodeId].x;
            const _y = network.nodes._data[nodeId].y;

            network.nodes._data[nodeId].x = x;
            network.nodes._data[nodeId].y = y;

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
        dashes: false,
        arrow: true,
        width: 3
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
        this.setState({
            graph: {
                nodes: nodes,
                edges: edges
            }
        });
    }

    initializer = async () => {
        this.props.toggleProfile(false);
        await this.fetchElements();
        this.graphInitializer();
    }

    modifyElement = (data) => {
        const keys = Object.keys(data);
        if (!keys.length)
            return;

        const network = this.state.networkRef.current;
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
        const {elementId, elementType} = this.state;
        const network = this.state.networkRef.current;

        let nextState = {
            history: [ ...this.state.history],
            historyPivot: this.nextPivot()
        };
        let element = (elementType)? 
        network.edges._data[elementId]:
        network.nodes._data[elementId];

        if (elementType) {
            nextState.edgeStates = { ...this.state.edgeStates};

            if (nextState.edgeStates[elementId] === CREATE)
                delete nextState.edgeStates[elementId];
            else {
                nextState.edgeStates[elementId] = DELETE;
                element.isFirstUpdate =
                    !Boolean(this.state.edgeStates[elementId]);
            }

            network.edges.remove(elementId);
        }

        else {
            nextState.nodeStates = { ...this.state.nodeStates};

            if (nextState.nodeStates[elementId] === CREATE)
                delete nextState.nodeStates[elementId];
            else {
                nextState.nodeStates[elementId] = DELETE;
                element.isFirstUpdate =
                    !Boolean(this.state.nodeStates[elementId]);
            }
            
            network.nodes.remove(elementId);
        }

        nextState.history[this.state.historyPivot] = 
            makeEvent(elementId, elementType, DELETE, element);
        truncHistory(nextState.history, nextState.historyPivot);

        this.setState(nextState);
    }

    save = async () => {
        const {sheetId} = this.props;
        const {nodeStates, edgeStates} = this.state;

        const nodes = getSubset(
            this.state.networkRef.current.nodes._data, 
            ...Object.keys(nodeStates));
        const edges = getSubset(
            this.state.networkRef.current.edges._data, 
            ...Object.keys(edgeStates));
        
        this.props.update();
        await this.props.editElement(
            sheetId,nodes,edges,nodeStates,edgeStates);
        await this.fetchElements();
    }

    reset = () => {
        const {nodes, edges} = this.state.networkRef.current;

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
        const network = this.state.networkRef.current;
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
        const network = this.state.networkRef.current;
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

    render() {
        const {historyPivot} = this.state;
        const pwd = (
            <label className="pwd">
                {(this.props.pwd.length <= 50)? this.props.pwd:
                `...`+this.props.pwd.substring(this.props.pwd.length-50)}
            </label>
        )
        const menu = (
            <div className="sheet-menu">
                {this.renderBackIcon()}
                {Boolean(historyPivot) && 
                this.renderSaveIcon()}
                {this.renderRefreshIcon()}
                {this.renderRedoIcon()}
                {this.renderUndoIcon()}
            </div>
        )
        return (
            <div>
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
                {this.state.graph &&
                <Graph
                ref={this.state.networkRef}
                graph={this.state.graph} 
                options={options} 
                events={eventGenerator.bind(this)()}
                style={style}/>}
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

