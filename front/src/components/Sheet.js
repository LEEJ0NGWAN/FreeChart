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
        edgeStates: {}
    };

    events = {
        hold: function(event) {
            // TODO: 삭제 기능 따로 빼기
            // TODO: 엣지 수정 및 만들기 기능
            // const nodeId = event.nodes[0];
            // if (nodeId) {
            //     const nodes = this.state.networkRef.current.nodes;

            //     let nextState = {
            //         nodeStates: {
            //             ...this.state.nodeStates
            //         },
            //         edgeStates: {
            //             ...this.state.edgeStates
            //         }
            //     };
            //     nextState.nodeStates[nodeId] = 0;
            //     event.edges.forEach((key)=>{
            //         nextState.edgeStates[key] = 0;
            //     });
                
            //     this.setState(nextState);
            //     nodes.remove(nodeId);
            // }
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
                nextState.nodeStates[node.id] = 1;
                
                this.setState(nextState);
                nodes.add(node);
            }
            else {
                const nodeId = nodes[0];
                const {x, y} = event.pointer.DOM;
                const label = this.state.networkRef
                                .current.nodes._data[nodeId].label;
                this.togglePop();
                this.fetchInfo(nodeId,x,y,label);
            }
        }.bind(this),
    };

    togglePop = () => {
        this.setState({popped: !this.state.popped});
    }

    fetchInfo = (nodeId, x=null, y=null, label=null, modified=false, deleted=false) => {
        if (modified) {
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
            return;
        }
        
        let nextState = {
            nodeId: nodeId
        };

        if (x)
            nextState.x = x;
        if (y)
            nextState.y = y;
        if (label)
            nextState.label = label;
        
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
                {this.isEdited() && cancel}
                <div>
                    {this.state.popped && 
                    <NodeEdit 
                    togglePop={this.togglePop}
                    fetchInfo={this.fetchInfo}
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
                        width:'100%', height: '65%'}}/>}
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

