import UrlNodeServer from '../../../../api/NodeServer';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap';
import formatMoney from 'Function/NumberFormat';
import swal from 'sweetalert';
import { roundNumber } from '../../../../Function/roundNumber';
import FormasPagoMod from './formasPago';
import CompleteCerosLeft from '../../../../Function/CompleteCeroLeft';

const ModalFormasPagos = ({ modal, toggle, idFact, factura, actualizar, variosPagos }) => {
    const [loading, setLoading] = useState(false);
    const [pagos, setPagos] = useState(variosPagos);
    const [total, setTotal] = useState(0);

    const putVariosPagos = async (idFact, pagos) => {
        setLoading(true);
        try {
            const res = await axios.put(
                `${UrlNodeServer.invoicesDir.sub.variosPagos}/${idFact}`,
                { variosPagos: pagos },
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                    },
                },
            );
            if (res.status === 200) {
                swal('Pagos actualizados correctamente', '', 'success');
                actualizar();
                toggle();
            }
        } catch (error) {
            swal('Error al actualizar los pagos', '', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        let total = 0;
        pagos.forEach((pago) => {
            total += parseFloat(pago.importe);
        });
        setTotal(total);
    }, [pagos]);

    useEffect(() => {
        setPagos(variosPagos);
    }, [variosPagos]);

    return (
        <Modal size="lg" isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                Devolución Parcial del comprobante{' '}
                <span style={{ color: '#0081c9', marginLeft: '5px' }}>
                    {' '}
                    {factura.letra} {CompleteCerosLeft(factura.pv, 5)} - {CompleteCerosLeft(factura.cbte, 8)}
                </span>
                <span style={{ color: '#0081c9', marginLeft: '15px' }}>
                    {' '}
                    Total: $ {formatMoney(factura.total_fact)}
                </span>
            </ModalHeader>
            <ModalBody>
                {!loading ? (
                    <>
                        <Row>
                            <Col md="12">
                                <FormasPagoMod
                                    clienteBool={factura.n_doc_cliente.toString().length > 1 ? 1 : 0}
                                    variosPagos={pagos}
                                    setVariosPagos={setPagos}
                                    factFiscBool={false}
                                    total={total}
                                    setTotal={setTotal}
                                    totalPrecio={factura.total_fact}
                                    cliente={{ n_doc_cliente: factura.n_doc_cliente }}
                                    descuentoPerc={0}
                                />
                            </Col>
                        </Row>
                    </>
                ) : (
                    <Row>
                        <Col md="12" style={{ textAlign: 'center' }}>
                            <Spinner color="primary" style={{ width: '150px', height: '150px' }} />
                        </Col>
                    </Row>
                )}
            </ModalBody>
            <ModalFooter>
                <Button
                    color="primary"
                    onClick={(e) => {
                        e.preventDefault();
                        putVariosPagos(idFact, pagos);
                    }}
                    disabled={
                        loading || roundNumber(total) === 0 || roundNumber(total) !== roundNumber(factura.total_fact)
                    }
                >
                    Actualizar
                </Button>
                <Button disabled={loading} color="danger" onClick={toggle}>
                    Cerrar
                </Button>
            </ModalFooter>
        </Modal>
    );
};
export default ModalFormasPagos;
