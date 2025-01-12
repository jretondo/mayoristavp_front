import formatMoney from 'Function/NumberFormat';
import React from 'react';
import { Button } from 'reactstrap';

const FilaPago = ({ id, importe, tipo, tipoTxt, variosPagos, setVariosPagos }) => {
    const deletePago = (id) => {
        let nvaList = [];
        variosPagos.map((item, key) => {
            if (parseInt(key) !== parseInt(id)) {
                nvaList.push(item);
            }
            if (key === variosPagos.length - 1) {
                setVariosPagos(() => nvaList);
            }
        });
    };

    return (
        <tr style={{ borderTop: '1px solid #e9ecef', borderBottom: '1px solid #e9ecef' }}>
            <td style={{ fontSize: '18px', textAlign: 'right' }}>{tipoTxt}</td>
            <td style={{ fontSize: '18px', textAlign: 'left' }}>$ {formatMoney(importe)}</td>
            <td>
                <Button
                    color="danger"
                    style={{ borderRadius: '10%' }}
                    onClick={(e) => {
                        e.preventDefault();
                        deletePago(id);
                    }}
                >
                    X
                </Button>
            </td>
        </tr>
    );
};

export default FilaPago;
