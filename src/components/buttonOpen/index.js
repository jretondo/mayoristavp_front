import React from 'react';
import { Button } from 'reactstrap';

const ButtonOpenCollapse = ({ action, tittle, active }) => {
    return (
        <Button
            color={active ? 'primary' : 'secondary'}
            style={{ width: '100%', height: '50px', paddingInline: '60px', color: `${active ? '' : 'lightgray'}` }}
            onClick={() => action()}
            disabled={active}
        >
            {tittle}
        </Button>
    );
};

export default ButtonOpenCollapse;
