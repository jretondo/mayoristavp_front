import React, { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import formatMoney from '../../../Function/NumberFormat';
import axios from 'axios';
import UrlNodeServer from '../../../api/NodeServer';

const ModalDetalle = ({ modal, toggle, cheque, toggleList }) => {
    const [notas, setNotas] = useState(cheque.notas);
    const [esperar, setEsperar] = useState(false);

    const actualizarNotas = async (e, id, notas) => {
        e.preventDefault();
        setEsperar(true);
        await axios
            .put(
                UrlNodeServer.chequesDir.cheques + '/notas/' + id,
                {
                    notas: notas,
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                    },
                },
            )
            .then((res) => {
                const respuesta = res.data;
                const status = parseInt(respuesta.status);
                if (status === 200) {
                    swal('Cheque actualizado', 'El cheque fue actualizado correctamente', 'success');
                } else {
                    swal('Error', 'No se pudo actualizar el cheque', 'error');
                }
            })
            .catch((error) => {
                swal('Error', 'No se pudo actualizar el cheque: ' + error, 'error');
            })
            .finally(() => {
                setEsperar(false);
                toggleList();
                toggle();
            });
    };

    return (
        <Modal isOpen={modal} toggle={toggle} size="lg">
            <ModalHeader>
                <h3>
                    Notas del cheque Nº <span style={{ color: 'blue' }}>{cheque.nro_cheque}</span> Banco{' '}
                    <span style={{ color: 'blue' }}>{cheque.banco}</span> Importe{' '}
                    <span style={{ color: 'blue' }}>${formatMoney(cheque.importe)}</span>
                </h3>
            </ModalHeader>
            <ModalBody>
                <div style={{ textAlign: 'center' }}>
                    <textarea
                        style={{ width: '100%', height: '100px' }}
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="success" disabled={esperar} onClick={(e) => actualizarNotas(e, cheque.id, notas)}>
                    Actualizar
                </Button>
                <Button color="danger" onClick={toggle}>
                    Cerrar
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ModalDetalle;
