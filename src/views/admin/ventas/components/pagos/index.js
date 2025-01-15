import React, { useState, useEffect } from 'react';
import UrlNodeServer from '../../../../../api/NodeServer';
import { Card, CardBody, Col, FormGroup, Label, Row, Spinner } from 'reactstrap';
import './styles.css';
import InvoiceHeader from './header';
import swal from 'sweetalert';
import axios from 'axios';
import FileSaver from 'file-saver';
import ModalChange from './modalChange';
import FormasPagoMod from './formasPago';
import ReactQuill from 'react-quill';

const PagosModule = ({ setValidPV }) => {
    const [proveedorBool, setProveedorBool] = useState(0);
    const [ptoVta, setPtoVta] = useState({ id: 0 });
    const [envioEmailBool, setEnvioEmailBool] = useState(0);
    const [emailProvedor, setEmailProvedor] = useState('');
    const [detalle, setDetalle] = useState('');

    const [processing, setProcessing] = useState(false);
    const [variosPagos, setVariosPagos] = useState([]);
    const [total, setTotal] = useState(0);

    const [modal1, setModal1] = useState(false);

    const [provedor, setProvedor] = useState(false);
    const [userId, setUserId] = useState(localStorage.getItem('userId'));

    const generarOP = async () => {
        const data = {
            detalle,
            importe: total,
            provedorID: parseInt(proveedorBool) === 0 ? undefined : provedor.id,
            pvId: ptoVta.id,
            pagos: variosPagos,
        };

        if (Math.round(total * 100) / 100 <= 0) {
            swal('Error: Total del pago!', 'Revise que el total del pago debe ser mayor a 0', 'error');
        } else {
            generarOPFinal(data);
        }
    };

    const generarOPFinal = async (data) => {
        setProcessing(true);
        await axios
            .post(UrlNodeServer.proveedoresDir.sub.generateOP, data, {
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
                setEnvioEmailBool(0);
                setVariosPagos([]);
                setEmailProvedor('');
                setDetalle('');
                setProvedor(false);
                setUserId(localStorage.getItem('userId'));
                if (envioEmailBool) {
                    swal(
                        'Nueva Orden de Pago!',
                        'La Orden de Pago se ha generado con éxito y pronto le llegará al provedor por email!',
                        'success',
                    );
                } else {
                    swal('Nueva Orden de Pago!', 'La Orden de Pago se ha generado con éxito!', 'success');
                }
            })
            .catch(async (err) => {
                console.log('object :>> ', err);
                if (err.code === 'ECONNABORTED') {
                    await swal(
                        'Tiempo de espera superado!',
                        'Ha tardado demasiado el servidor en responder. En breve se generará la Orden de Pago y la podrá ver reflejada consultando en el sistema.',
                        'error',
                    );
                    await swal('Le mandaremos un email en cuanto se genere la Orden de Pago.', '', 'info');
                } else {
                    swal(
                        'Error inesperado!',
                        'La Orden de Pago no se pudo generar por un error en los datos! Controle que no falten datos importantes en la cabecera',
                        'error',
                    );
                }
            })
            .finally(() => {
                setProcessing(false);
            });
    };

    useEffect(() => {
        provedor && setEmailProvedor(provedor.email);
    }, [provedor]);

    return (
        <Card>
            <ModalChange descuentoPerc={0} modal={modal1} toggle={() => setModal1(!modal1)} />
            <CardBody>
                {processing ? (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: 'green' }}>Procesando Orden de Pago...</h2>
                        <Spinner type="grow" color="light" style={{ width: '250px', height: '250px' }} />{' '}
                    </div>
                ) : (
                    <>
                        <InvoiceHeader
                            setPtoVta={setPtoVta}
                            setProvedorBool={setProveedorBool}
                            setEmailProvedor={setEmailProvedor}
                            setEnvioEmailBool={setEnvioEmailBool}
                            proveedorBool={proveedorBool}
                            envioEmailBool={envioEmailBool}
                            emailProvedor={emailProvedor}
                            ptoVta={ptoVta}
                            setValidPV={setValidPV}
                            setModal1={setModal1}
                            modal1={modal1}
                            provedor={provedor}
                            setProvedor={setProvedor}
                            userId={userId}
                            setUserId={setUserId}
                        />
                        <br />
                        <Row>
                            <Col>
                                <FormGroup>
                                    <Label for="exampleEmail">Detalle:</Label>
                                    <ReactQuill
                                        debug="info"
                                        placeholder="Describa el detalle o concepto del cobro..."
                                        theme="snow"
                                        value={detalle}
                                        onChange={setDetalle}
                                        modules={{
                                            toolbar: ['bold', 'italic', 'underline'],
                                        }}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="3"></Col>
                            <Col md="6">
                                <FormasPagoMod
                                    proveedorBool={proveedorBool}
                                    variosPagos={variosPagos}
                                    setVariosPagos={setVariosPagos}
                                    factFiscBool={false}
                                    total={total}
                                    setTotal={setTotal}
                                    totalPrecio={100000000000}
                                    provedor={provedor}
                                    descuentoPerc={0}
                                />
                            </Col>
                            <Col md="3"></Col>
                        </Row>
                        <Row style={{ marginTop: 0, textAlign: 'center' }}>
                            <Col>
                                <button
                                    className={Math.round(total * 100) / 100 <= 0 ? 'btn btn-gray' : 'btn btn-success'}
                                    style={{ margin: '15px', width: '200px' }}
                                    disabled={Math.round(total * 100) / 100 <= 0 ? true : false}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        generarOP();
                                    }}
                                >
                                    Confirmar Compra
                                </button>
                                <button
                                    className="btn btn-danger"
                                    style={{ margin: '15px', width: '200px' }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                    }}
                                >
                                    Cancelar
                                </button>
                            </Col>
                        </Row>
                    </>
                )}
            </CardBody>
        </Card>
    );
};

export default PagosModule;
