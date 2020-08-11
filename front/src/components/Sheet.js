import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError } from '../actions/common';
import { getElement, editElement, RESET } from '../actions/element_api';
import { action, fetch } from '../actions/common';
import Graph from 'react-graph-vis';
import ElementEdit from './ElementEdit';
import { v4 as uuid } from 'uuid';

const style = {
    position: 'absolute',
    left: '5px',
    right: '5px',
    bottom: '5px',
    height: 'calc(100% - 100px)',
    border: '1px solid #000000',
    borderRadius: '0.25em'
};

const options = {
    layout: {
        hierarchical: false
    },
    edges: {
        color: "#000000",
        arrowStrikethrough: false,
        width: 5,
    },
    autoResize: true,
};

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
                            label: ""
                        };
    
                        let nextState = {
                            from: null,
                            edgeStates: {
                                ...this.state.edgeStates
                            }
                        };
                        nextState.edgeStates[edge.id] = 1;
    
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
                    nodeStates: {
                        ...this.state.nodeStates
                    }
                };

                if (this.state.from)
                    nextState.from = null;

                nextState.nodeStates[node.id] = 1;
                
                this.setState(nextState);
                network.nodes.add(node);
            }
            else if (!nodes.length && edges.length) {
                const edgeId = edges[0];
                const {x, y} = event.pointer.DOM;
                const label = network.edges._data[edgeId].label;

                this.setElementInfo(edgeId,1,x,y,label);
            }
            else {
                const nodeId = nodes[0];
                const {x, y} = event.pointer.DOM;
                const label = network.nodes._data[nodeId].label;
                const {edges} = event;

                this.setElementInfo(nodeId,0,x,y,label,edges);
            }
        }.bind(this),
    };
    return events;
}

class Sheet extends Component {
    state = {
        networkRef: React.createRef(),
        popped: false,
        nodeStates: {},
        edgeStates: {},
        from: null,
        to: {},
    };

    togglePop = () => {
        this.setState({popped: !this.state.popped});
    }

    setElementInfo = 
    (elementId, elementType, x=null, y=null, label=null, edges=null) => {        
        let nextState = {
            popped: !this.state.popped,
            elementId: elementId,
            elementType: elementType,
            x: x, y: y,
            label: label,
            edges: edges
        };

        if (this.state.from)
            nextState.from = null;
        
        this.setState(nextState);
    }

    fetchElements = async () => {
        const {sheet_id} = this.props;
        await this.props.getElement(sheet_id);
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
        await this.fetchElements();
        this.graphInitializer();
    }

    isEdited = () => {
        const {nodeStates, edgeStates} = this.state;
        const nodeLength = Object.keys(nodeStates).length;
        const edgeLength = Object.keys(edgeStates).length;

        return (nodeLength+edgeLength)? true: false;
    }

    modifyElement = (label) => {
        const network = this.state.networkRef.current;
        const {elementId, elementType} = this.state;

        let nextState = {};

        if (elementType) {
            network.edges.update({
                id: elementId,
                label, label
            });

            if (!this.state.edgeStates[elementId]) {
                nextState['edgeStates'] = {
                    ...this.state.edgeStates,
                };
                nextState.edgeStates[elementId] = 2;
            }
        }
        else {
            network.nodes.update({
                id: elementId,
                label: label
            });

            if (!this.state.nodeStates[elementId]) {
                nextState['nodeStates'] = {
                    ...this.state.nodeStates,
                };
                nextState.nodeStates[elementId] = 2;
            }
        }

        this.setState(nextState);
    }

    deleteElement = () => {
        const {elementId, elementType} = this.state;
        const network = this.state.networkRef.current;

        let nextState = {};
        if (elementType) {
            nextState = {
                edgeStates: {
                    ...this.state.edgeStates
                }
            };

            if (nextState.edgeStates[elementId] === 1)
                delete nextState.edgeStates[elementId];
            else
                nextState.edgeStates[elementId] = 0;

            network.edges.remove(elementId);
        }

        else {
            const {edges} = this.state;
            nextState = {
                nodeStates: {
                    ...this.state.nodeStates
                },
                edgeStates: {
                    ...this.state.edgeStates
                }
            };

            if (nextState.nodeStates[elementId] === 1)
                delete nextState.nodeStates[elementId];
            else
                nextState.nodeStates[elementId] = 0;
            edges.forEach((key)=>{
                if (nextState.edgeStates[key] === 1)
                    delete nextState.edgeStates[key];
                else
                    nextState.edgeStates[key] = 0;
            });
            
            network.nodes.remove(elementId);
        }

        this.setState(nextState);
    }

    delete = () => {
        //sheet 삭제
    }

    save = async () => {
        const {sheet_id} = this.props;
        const nodes = this.state.networkRef.current.nodes._data;
        const edges = this.state.networkRef.current.edges._data;
        const {nodeStates, edgeStates} = this.state;
        await this.props.editElement(sheet_id,nodes,edges,nodeStates,edgeStates);
        await this.fetchElements();
    }

    reset = () => {
        const {nodes, edges} = this.state.networkRef.current;

        this.setState({
            nodeStates: {},
            edgeStates: {},
        });
        this.props.action(RESET);

        nodes.clear();
        edges.clear();
        nodes.add(this.props.nodes);
        edges.add(this.props.edges);
    }

    componentDidMount() {
        this.initializer();
    }

    componentDidUpdate(prevProps, prevStates) {
        const {saved} = this.props;
        if (!prevProps.saved && saved) {
            this.setState({
                nodeStates: {},
                edgeStates: {}
            });
            this.props.action(RESET);
        }
    }

    renderBackIcon() {
        return(<svg className="bs-item"
        onClick={()=>{this.props.escape();}}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M13.427 3.021h-7.427v-3.021l-6 5.39 6 
        5.61v-3h7.427c3.071 0 5.561 2.356 5.561 5.427 0 
        3.071-2.489 5.573-5.561 5.573h-7.427v5h7.427c5.84 0 
        10.573-4.734 10.573-10.573s-4.733-10.406-10.573-10.406z"/>
        </svg>);
    }

    renderSaveIcon() {
        return(<svg className="bs-item"
        onClick={this.save}
        width="24" height="24" viewBox="0 0 24 24">
        <path d="M13 3h2.996v5h-2.996v-5zm11 
        1v20h-24v-24h20l4 4zm-17 
        5h10v-7h-10v7zm15-4.171l-2.828-2.829h-.172v9h-14v-9h-3v20h20v-17.171z"/>
        </svg>);
    }

    renderRefreshIcon() {
        return(<svg className="bs-item"
        onClick={this.reset}
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

    render() {
        const menu = (
            <div className="sheet-menu">
                {this.renderBackIcon()}
                {this.isEdited() && this.renderSaveIcon()}
                {this.isEdited() && this.renderRefreshIcon()}<br/>
            </div>
        )
        return (
            <div>
                {menu}
                {this.state.popped && 
                <ElementEdit 
                togglePop={this.togglePop}
                modify={this.modifyElement}
                delete={this.deleteElement}
                x={this.state.x}
                y={this.state.y}
                label={this.state.label}/>}
                {this.state.graph &&
                <Graph
                ref={this.state.networkRef}
                nodes={this.props.nodes}
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
}, { editElement, getElement, clearError, fetch, action })(Sheet);

