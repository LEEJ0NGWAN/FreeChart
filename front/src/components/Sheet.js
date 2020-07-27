import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { clearError } from '../actions/common';
import { getElement } from '../actions/sheet_api';
import { fetch } from '../actions/common';
import Graph from "react-graph-vis";

const options = {
    layout: {
        hierarchical: false
    },
    edges: {
        color: "#000000"
    }
};
  
const events = {
    select: function(event) {
        var { nodes, edges } = event;
        console.log("Selected nodes:");
        console.log(nodes);
        console.log("Selected edges:");
        console.log(edges);
    }
};

class Sheet extends Component {
    state = {
        error: null,
    };

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
        const graph = (
            <Graph 
            graph={this.state.graph} 
            options={options} 
            events={events} 
            style={{ height: "640px" }} />
        )
        return (
            <div>
                {this.state.error}
                {this.state.graph && graph}
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

