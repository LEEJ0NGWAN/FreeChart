import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearError } from '../actions/common';
import { getElement } from '../actions/sheet_api';
import { fetch } from '../actions/common';
import Graph from 'react-graph-vis';

const options = {
    layout: {
        hierarchical: false
    },
    edges: {
        color: "#000000"
    },
};

class Sheet extends Component {
    state = {
        error: null,
    };

    events = {
        // click: function(event) {
        //     this.redraw();
        // },
        // select: function(event) {
        //     var { nodes, edges } = event;
        //     console.log("Selected nodes:");
        //     console.log(nodes);
        //     console.log("Selected edges:");
        //     console.log(edges);
        // },
        doubleClick: function(event) {
            let node = {
                id: this.state.index,
                label: 'test',
                sheet_id: Number(this.props.sheet_id)
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
            console.log(this);
        }.bind(this),

        // dragging: function(event) {

        // }
    }; 

    fetchElements = async () => {
        const {sheet_id} = this.props;
        await this.props.getElement(sheet_id);

        const {nodes} = this.props;
        let index = nodes[nodes.length-1].id + 1;
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
                {this.state.error}
                {this.state.graph &&
                <Graph 
                graph={this.state.graph} 
                options={options} 
                events={this.events} 
                style={{ height: "640px" }} />}
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

