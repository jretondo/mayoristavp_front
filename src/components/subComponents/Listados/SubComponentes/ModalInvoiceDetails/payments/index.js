import React from 'react';
import { Table } from 'reactstrap';
import formatMoney from '../../../../../../Function/NumberFormat';
import moment from 'moment';

const PaymentsInvoiceList = ({ pagos, formaPago, importe }) => {
    const pagoString = (formaPago) => {
        switch (parseInt(formaPago)) {
            case 0:
                return 'Efectivo';
            case 1:
                return 'Mercado Pago';
            case 2:
                return 'Tarjeta de Débito';
            case 3:
                return 'Tarjeta de Crédito';
            case 4:
                return 'Cuenta Corriente';
            case 6:
                return 'Cheque';
            case 7:
                return 'Transferencia';
            default:
        }
    };
    return (
        <Table className="align-items-center table-flush" responsive>
            <thead className="thead-light">
                <tr>
                    <th scope="col" style={{ textAlign: 'center' }}>
                        Tipo de Pago
                    </th>
                    <th scope="col" style={{ textAlign: 'center' }}>
                        Total
                    </th>
                </tr>
            </thead>
            <tbody style={{ minHeight: '500px' }}>
                {pagos.length > 0 ? (
                    pagos.map((pago, key) => {
                        return (
                            <tr key={key}>
                                <td style={{ textAlign: 'center' }}>
                                    {pago.tipo_txt}
                                    <br />
                                    {parseInt(pago.tipo) === 6 ? (
                                        <small>
                                            Banco: {pago.banco} Nº: {pago.nro_cheque} Fecha:{' '}
                                            {moment(pago.fecha_emision).format('DD/MM/YY')}
                                        </small>
                                    ) : null}
                                </td>
                                <td style={{ textAlign: 'center' }}>$ {formatMoney(pago.importe)}</td>
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td style={{ textAlign: 'center' }}>{pagoString(formaPago)}</td>
                        <td style={{ textAlign: 'center' }}>$ {formatMoney(importe)}</td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
};

export default PaymentsInvoiceList;
