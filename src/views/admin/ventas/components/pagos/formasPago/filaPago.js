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

    const getData = (id) => {
        let data = {};
        variosPagos.map((item, key) => {
            if (parseInt(key) === parseInt(id)) {
                data = item;
            }
        });
        return data;
    };

    return (
        <tr style={{ borderTop: '1px solid #e9ecef', borderBottom: '1px solid #e9ecef' }}>
            <td style={{ fontSize: '18px', textAlign: 'right' }}>
                {tipoTxt}
                {parseInt(tipo) === 6 && (
                    <>
                        <br />
                        <small>Nº: {getData(id).nro_cheque}</small> <small>Banco: {getData(id).banco}</small>
                    </>
                )}
            </td>
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
