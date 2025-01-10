import React from 'react';

const ClientRow = ({ id, cliente, setCliente, toggle }) => {
    return (
        <tr key={id}>
            <td className="text-right">
                <button
                    onClick={() => {
                        setCliente(cliente);
                        toggle();
                    }}
                    className="btn btn-success"
                >
                    <i className="fas fa-check"></i>
                </button>
            </td>
            <td style={{ textAlign: 'center' }}>
                {cliente.razsoc} (
                <small>{parseInt(cliente.cuit) === 0 ? 'CUIT ' + cliente.ndoc : 'DNI ' + cliente.ndoc}</small>)
                <br />
                <small>
                    Entrega: <b>{cliente.entrega}</b>
                </small>
                <br />
                <small>
                    Localidad: <b>{cliente.localidad}</b>
                </small>{' '}
                <small>
                    Provincia: <b>{cliente.provincia}</b>
                </small>
            </td>
        </tr>
    );
};

export default ClientRow;
