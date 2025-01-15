import React from 'react';
import moment from 'moment';
import formatMoney from '../../../../../../Function/NumberFormat';

const FilaCheque = ({ cheque, id, nvoCheque, quitarCheque, variosPagos }) => {
    const coloresFechaVencimiento = (fecha) => {
        const fechaVencimiento = moment(fecha);
        const proxFechaVenc = moment(new Date().setDate(new Date().getDate() + 30));
        const cercaVencimiento = moment(new Date().setDate(new Date().getDate() - 20));
        const fechaActual = moment(new Date());
        if (fechaVencimiento.isBefore(cercaVencimiento)) {
            return {
                backgroundColor: 'bg-danger',
                color: 'text-white',
            };
        } else if (fechaVencimiento.isBefore(fechaActual)) {
            return {
                backgroundColor: 'bg-success',
                color: 'text-white',
            };
        } else if (fechaVencimiento.isBefore(proxFechaVenc)) {
            return {
                backgroundColor: 'bg-warning',
                color: 'text-white',
            };
        } else {
            return {
                backgroundColor: false,
                color: false,
            };
        }
    };

    const isSelected = (id) => {
        let isSelected = false;
        variosPagos.map((item) => {
            if (item.id_cheque === id) {
                isSelected = true;
            }
        });
        return isSelected;
    };

    return (
        <>
            <tr key={id} style={{ backgroundColor: isSelected(cheque.id) ? 'rgb(215, 211, 211)' : '' }}>
                <td style={{ textAlign: 'center' }}>{cheque.nro_cheque}</td>
                <td style={{ textAlign: 'center' }}>{cheque.banco}</td>
                <td
                    style={{ textAlign: 'center' }}
                    className={
                        coloresFechaVencimiento(cheque.fecha_vencimiento).backgroundColor +
                        ' ' +
                        coloresFechaVencimiento(cheque.fecha_vencimiento).color
                    }
                >
                    {moment(cheque.fecha_vencimiento).format('DD/MM/YYYY')}
                </td>
                <td style={{ textAlign: 'center' }}>$ {formatMoney(cheque.importe)}</td>
                <td className="text-right">
                    <button
                        onClick={() => {
                            !isSelected(cheque.id) && nvoCheque(cheque);
                            isSelected(cheque.id) && quitarCheque(cheque.id);
                        }}
                        className={isSelected(cheque.id) ? 'btn btn-danger' : 'btn btn-success'}
                    >
                        <i className={isSelected(cheque.id) ? 'fas fa-times' : 'fas fa-check'}></i>
                    </button>
                </td>
            </tr>
        </>
    );
};

export default FilaCheque;
