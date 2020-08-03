import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError } from '../actions/common';
import { getElement, editElement, RESET } from '../actions/sheet_api';
import { action, fetch } from '../actions/common';
import Graph from 'react-graph-vis';
import NodeEdit from './NodeEdit';
import { v4 as uuid } from 'uuid';

const options = {
    layout: {
        hierarchical: false
    },
    edges: {
        color: "#000000",
        arrowStrikethrough: false,
        width: 5,
    }
};

class Sheet extends Component {
    state = {
        networkRef: React.createRef(),
        popped: false,
        nodeStates: {},
        edgeStates: {},
        from: null,
    };

    events = {
        click: function(event) {
            const {nodes} = event;
            if (!nodes.length && this.state.from)
                this.setState({from: null});
        }.bind(this),
        hold: function(event) {
            const {nodes, edges} = event;
            if (nodes.length) {
                if (this.state.from) {
                    const edges = this.state.networkRef.current.edges;
                    let edge = {
                        id: uuid(),
                        from: this.state.from,
                        to: nodes[0],
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
                    edges.add(edge);
                }
                else {
                    this.setState({
                        from: nodes[0]
                    });
                }
            }
            else if (edges.length) {
                const edgeId = edges[0];
                const _edges = this.state.networkRef.current.edges;

                let nextState = {
                    edgeStates: {
                        ...this.state.edgeStates
                    }
                };
                if (this.state.from)
                    nextState.from = null;
                if (nextState.edgeStates[edgeId] === 1)
                    delete nextState.edgeStates[edgeId];
                else
                    nextState.edgeStates[edgeId] = 0;
                this.setState(nextState);
                _edges.remove(edgeId);
            }
        }.bind(this),
        doubleClick: function(event) {
            const {nodes} = event;
            if (!nodes.length) {
                const nodes = this.state.networkRef.current.nodes;
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
                nodes.add(node);
            }
            else {
                const nodeId = nodes[0];
                const {x, y} = event.pointer.DOM;
                const label = this.state.networkRef
                                .current.nodes._data[nodeId].label;
                const {edges} = event;

                this.fetchInfo(nodeId,x,y,label,edges);
            }
        }.bind(this),
    };

    togglePop = () => {
        this.setState({popped: !this.state.popped});
    }

    fetchInfo = (nodeId, x=null, y=null, label=null, edges=null) => {        
        let nextState = {
            popped: !this.state.popped,
            nodeId: nodeId,
        };

        if (this.state.from)
            nextState.from = null;
        if (x)
            nextState.x = x;
        if (y)
            nextState.y = y;
        if (label)
            nextState.label = label;
        if (edges)
            nextState.edges = edges;
        
        this.setState(nextState);
    }

    fetchElements = async () => {
        const {sheet_id} = this.props;
        await this.props.getElement(sheet_id);

        this.setState({
            graph: {
                nodes: this.props.nodes,
                edges: this.props.edges
            }
        });
    }

    isEdited = () => {
        const {nodeStates, edgeStates} = this.state;
        const nodeLength = Object.keys(nodeStates).length;
        const edgeLength = Object.keys(edgeStates).length;

        return (nodeLength+edgeLength)? true: false;
    }

    modifyNode = (label) => {
        const {nodeId} = this.state;
        const nodes = this.state.networkRef.current.nodes;
        nodes.update({
            id: nodeId,
            label: label
        });

        let nextState = {popped: !this.state.popped};
        
        if (!this.state.nodeStates[nodeId]) {
            nextState['nodeStates'] = {
                ...this.state.nodeStates
            };
            nextState.nodeStates[nodeId] = 2;
        }
        this.setState(nextState);
    }

    deleteNode = () => {
        const {nodeId, edges} = this.state;
        const nodes = this.state.networkRef.current.nodes;

        let nextState = {
            nodeStates: {
                ...this.state.nodeStates
            },
            edgeStates: {
                ...this.state.edgeStates
            }
        };
        if (nextState.nodeStates[nodeId] === 1)
            delete nextState.nodeStates[nodeId];
        else
            nextState.nodeStates[nodeId] = 0;
        edges.forEach((key)=>{
            if (nextState.edgeStates[key] === 1)
                delete nextState.edgeStates[key];
            else
                nextState.edgeStates[key] = 0;
        });
        
        this.setState(nextState);
        nodes.remove(nodeId);
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
    }

    cancel = () => {
        // TODO: 취소 구현
        // this.setState({
        //     graph: {
        //         nodes: this.props.nodes,
        //         edges: this.props.edges
        //     },
        //     nodeStates: {},
        //     edgeStates: {}
        // });
    }

    componentDidMount() {
        this.fetchElements();
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

    render() {
        const save = (
            <button
            onClick={this.save}>변경 사항 저장</button>
        )
        const cancel = (
            <button
            onClick={this.cancel}>취소</button>
        )
        return (
            <div>
                {this.isEdited() && save}
                {/* {this.isEdited() && cancel} */}
                <div>
                    {this.state.popped && 
                    <NodeEdit 
                    togglePop={this.togglePop}
                    modifyNode={this.modifyNode}
                    deleteNode={this.deleteNode}
                    nodeId={this.state.nodeId}
                    x={this.state.x}
                    y={this.state.y}
                    label={this.state.label}/>}
                </div>
                <div>
                    {this.state.graph &&
                    <Graph
                    ref={this.state.networkRef}
                    graph={this.state.graph} 
                    options={options} 
                    events={this.events}
                    style={{
                        position: 'absolute', 
                        width:'100%', height: '75%'}}/>}
                </div>
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

