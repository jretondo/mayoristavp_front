import formatMoney from 'Function/NumberFormat';
import React from 'react';
import { Col, FormGroup, Input, Label } from 'reactstrap';

const TotalItemPagos = ({ id, colSize, titulo, total }) => {
    return (
        <Col md={colSize} key={id}>
            <FormGroup>
                <Label>{titulo}</Label>
                <Input type="text" value={'$ ' + formatMoney(total)} disabled />
            </FormGroup>
        </Col>
    );
};

export default TotalItemPagos;
