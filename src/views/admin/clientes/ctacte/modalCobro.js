import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import { Button, Col, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap';
import 'react-quill/dist/quill.snow.css';
import PtosVtas from 'views/admin/ventas/components/vender/header/ptosVta';
import axios from 'axios';
import UrlNodeServer from '../../../../api/NodeServer';
import FileSaver from 'file-saver';
import FormasPagoMod from '../../ventas/components/vender/formasPago';

const ModalCobroCtaCte = ({ modal, toggle, clienteID, actualizar, deudaTotal }) => {
    const [model, setModel] = useState('');
    const [pagos, setPagos] = useState([]);
    const [importe, setImporte] = useState('');
    const [ptoVtaList, setPtoVtaList] = useState(<option>No hay puntos de venta relacionados</option>);
    const [ptoVta, setPtoVta] = useState({ id: 0 });
    const [proccess, setProccess] = useState(false);

    const registrarCobro = () => {
        const data = {
            detalle: model,
            importe: importe,
            clienteID: clienteID,
            pvId: ptoVta.id,
            pagos: pagos,
        };
        if (importe <= 0) {
            swal('Importe incorrecto!', 'El importe debe ser mayor a 0', 'error');
            return;
        }
        swal({
            title: '¿Está seguro confirmar esta recepción de dinero?',
            text: 'Esta desición no tiene vuelta atrás y genera un movimiento de caja con su nombre',
            icon: 'warning',
            dangerMode: true,
            buttons: ['Cancelar', 'Confirmar'],
        }).then(async (willDelete) => {
            if (willDelete) {
                setProccess(true);
                await axios
                    .post(UrlNodeServer.clientesDir.sub.payments, data, {
                        responseType: 'arraybuffer',
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                            Accept: 'application/pdf',
                        },
                    })
                    .then((res) => {
                        let headerLine = res.headers['content-disposition'];
                        const largo = parseInt(headerLine.length);
                        let filename = headerLine.substring(21, largo);
                        var blob = new Blob([res.data], { type: 'application/pdf' });
                        FileSaver.saveAs(blob, filename);
                    })
                    .catch((error) => {
                        console.error(error);
                        swal(
                            'Error inesperado!',
                            'El no se pudo generar por un error en los datos! Controle que no falten datos importantes en la cabecera',
                            'error',
                        );
                    })
                    .finally(() => {
                        setProccess(false);
                        actualizar();
                    });
            }
        });
    };

    return (
        <Modal size={'lg'} isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>Cobro de deuda de Cuenta Corriente</ModalHeader>
            {proccess ? (
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: 'green' }}>Procesando Recibo...</h2>
                    <Spinner type="grow" color="light" style={{ width: '250px', height: '250px' }} />{' '}
                </div>
            ) : (
                <>
                    <ModalBody>
                        <Row>
                            <Col>
                                <FormGroup>
                                    <Label for="exampleEmail">Detalle:</Label>
                                    <ReactQuill
                                        debug="info"
                                        placeholder="Describa el detalle o concepto del cobro..."
                                        theme="snow"
                                        value={model}
                                        onChange={setModel}
                                        modules={{
                                            toolbar: ['bold', 'italic', 'underline'],
                                        }}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <PtosVtas
                                setPtoVta={setPtoVta}
                                setPtoVtaList={setPtoVtaList}
                                ptoVtaList={ptoVtaList}
                                ptoVta={ptoVta}
                                colSize={12}
                            />
                        </Row>
                        <Row>
                            <Col md="12">
                                <FormasPagoMod
                                    clienteBool={false}
                                    variosPagos={pagos}
                                    setVariosPagos={setPagos}
                                    total={importe}
                                    setTotal={setImporte}
                                    totalPrecio={deudaTotal}
                                    cliente={false}
                                    descuentoPerc={0}
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={registrarCobro}>
                            Generar Recibo
                        </Button>{' '}
                        <Button color="danger" onClick={toggle}>
                            Cancelar
                        </Button>
                    </ModalFooter>
                </>
            )}
        </Modal>
    );
};

export default ModalCobroCtaCte;
