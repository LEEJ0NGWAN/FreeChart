import React, { Component } from 'react';
import { getCookie, setCookie, deleteCookie } from '../utils';

const orders = [
    '-modify_date', 'modify_date',
    '-create_date', 'create_date',
    '-title', 'title'
];

const alias = [
    '수정날짜(내림차순)', '수정날짜(오름차순)',
    '생성날짜(내림차순)', '생성날짜(오름차순)',
    '이름(내림차순)', '이름(오름차순)'
];

class Order extends Component {
    state = {
        order: null
    };
    componentDidMount() {
        this.setState({
            order: this.props.order? this.props.order: '-modify_date'
        });
    }
    renderOrders() {
        let orderList = [];

        orders.forEach((order, index)=>{
            let className = 
                (this.state.order === order)? 
                    'order-item selected': 'order-item';
            orderList.push(
                <p key={index}
                className={className}>{alias[index]}</p>);
        })

        return orderList;
    }
    render() {
        return (
            <div 
            className="order-modal" 
            onClick={()=>{this.props.escape();}}>
                <div
                className="order-modal-content"
                onClick={(e)=>{e.stopPropagation();}}>
                    <p className="order-item"
                    style={{
                        margin: '0px',
                        fontSize: '70%',
                        borderBottom: '1px solid'
                    }}>정렬 기준</p>
                    {this.renderOrders()}
                </div>
            </div>
        );
    }
}

export default Order;

