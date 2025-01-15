import React from 'react';

const ProviderRow = ({ id, Provedor, setProvedor, toggle }) => {
    return (
        <tr key={id}>
            <td className="text-right">
                <button
                    onClick={() => {
                        setProvedor(Provedor);
                        toggle();
                    }}
                    className="btn btn-success"
                >
                    <i className="fas fa-check"></i>
                </button>
            </td>
            <td style={{ textAlign: 'center' }}>
                {Provedor.razsoc} (
                <small>{parseInt(Provedor.cuit) === 0 ? 'CUIT ' + Provedor.ndoc : 'DNI ' + Provedor.ndoc}</small>)
                <br />
                <small>
                    Telefóno: <b>{Provedor.telefono}</b>
                </small>{' '}
                <small>
                    Email: <b>{Provedor.email}</b>
                </small>
            </td>
        </tr>
    );
};

export default ProviderRow;
