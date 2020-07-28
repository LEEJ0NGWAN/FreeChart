import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError } from '../actions/common';
import { getElement } from '../actions/sheet_api';
import { fetch } from '../actions/common';
import Graph from 'react-graph-vis';
import NodeEdit from './NodeEdit';

const options = {
    layout: {
        hierarchical: false
    },
    edges: {
        color: "#000000"
    }
};

class Sheet extends Component {
    state = {
        popped: false,
        isChanged: false,
        error: null,
    };

    events = {
        // hold: function(event) {
        // },
        // click: function(event) {
        // },
        // select: function(event) {
        //     var { nodes, edges } = event;
        //     if (!this.selected)
        //         this.selected = nodes
        //     console.log(this.selected, nodes);
        // },
        doubleClick: function(event) {
            const {nodes} = event;
            if (!nodes.length) {
                const {x, y} = event.pointer.canvas;
                let node = {
                    id: this.state.index,
                    label: 'test',
                    sheet_id: Number(this.props.sheet_id),
                    x: x, y: y,
                    title: 'test'
                };
                this.setState({
                    graph: {
                        ...this.state.graph,
                        nodes: [
                            ...this.state.graph.nodes,
                            node
                        ]
                    },
                    index: (this.state.index+1)
                });
            }
            else {
                const {x, y} = event.pointer.DOM;
                this.togglePop(x,y);
            }
        }.bind(this),

        // dragging: function(event) {
        // }
    };

    togglePop = (x=null, y=null) => {
        let nextState = {
            popped: !this.state.popped
        };
        if (x)
            nextState.x = x;
        if (y)
            nextState.y = y;

        this.setState(nextState);
    }

    fetchElements = async () => {
        const {sheet_id} = this.props;
        await this.props.getElement(sheet_id);

        const {nodes} = this.props;
        let index = nodes.length? nodes[nodes.length-1].id + 1: 0;
        this.setState({
            graph: {
                nodes: this.props.nodes,
                edges: this.props.edges
            },
            index: index
        });
    }

    componentDidMount() {
        this.fetchElements();
    }

    componentDidUpdate() {
        const {error_msg, error_code} = this.props;

        if (error_code) {
            let nextState = {};
            nextState.error = error_msg?
                error_msg: "[ERROR] "+ error_code;
            this.props.clearError();
            this.setState(nextState);
        }
    }

    render() {
        return (
            <div>
                <div>
                    {this.state.error}
                    {this.state.popped && 
                    <NodeEdit 
                    togglePop={this.togglePop} 
                    x={this.state.x}
                    y={this.state.y}/>}
                </div>
                <div>
                    {this.state.graph &&
                    <Graph 
                    graph={this.state.graph} 
                    options={options} 
                    events={this.events}
                    style={{position: 'absolute', width:'100%', height: '65%'}}/>}
                </div>
            </div>

        )
    }
}

export default connect((state) => {
    return {
        error_msg: state.commonReducer.error_msg,
        error_code: state.commonReducer.error_code,
        nodes: state.elementReducer.nodes,
        edges: state.elementReducer.edges,
    };
}, { getElement, clearError, fetch })(Sheet);

