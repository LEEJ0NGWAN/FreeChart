import React from 'react';

export default ({user}) => {
    return (
        <div>
            {user.username} <br/>
            {user.email}
        </div>
    );
}

