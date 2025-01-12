import React from 'react';
import { Table } from 'reactstrap';
import formatMoney from '../../../../../../Function/NumberFormat';

const DetailsInvoiceList = ({ details }) => {
    return (
        <Table className="align-items-center table-flush" responsive>
            <thead className="thead-light">
                <tr>
                    <th scope="col" style={{ textAlign: 'center' }}>
                        Producto
                    </th>
                    <th scope="col" style={{ textAlign: 'center' }}>
                        Cantidad
                    </th>
                    <th scope="col" style={{ textAlign: 'center' }}>
                        Total
                    </th>
                </tr>
            </thead>
            <tbody style={{ minHeight: '500px' }}>
                {details.map((detail, key) => {
                    return (
                        <tr key={key}>
                            <td style={{ textAlign: 'center' }}>{detail.nombre_prod}</td>
                            <td style={{ textAlign: 'center' }}>{detail.cant_prod}</td>
                            <td style={{ textAlign: 'center' }}>$ {formatMoney(detail.total_prod)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
};

export default DetailsInvoiceList;
