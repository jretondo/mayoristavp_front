import React, { useState, useContext, useEffect } from 'react';
import UrlNodeServer from '../../../../../api/NodeServer';
import { Card, CardBody, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label, Row, Spinner } from 'reactstrap';
import './styles.css';
import InvoiceHeader from './header';
import ProductFinder from './productFinder';
import ProdListSell from './list/prodListSell';
import productsSellContext from '../../../../../context/productsSell';
import formatMoney from 'Function/NumberFormat';
import swal from 'sweetalert';
import moment from 'moment';
import axios from 'axios';
import FileSaver from 'file-saver';
import ModalChange from './modalChange';
import FormasPagoMod from './formasPago';

const Ventas = ({ setValidPV }) => {
    const [clienteBool, setClienteBool] = useState(0);
    const [factFiscBool, setFactFiscBool] = useState(0);
    const [ptoVta, setPtoVta] = useState({ id: 0 });
    const [envioEmailBool, setEnvioEmailBool] = useState(0);
    const [emailCliente, setEmailCliente] = useState('');

    const [tfact, setTfact] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [descuentoPerc, setDescuentoPer] = useState(0);
    const [variosPagos, setVariosPagos] = useState([]);
    const [total, setTotal] = useState(0);

    const [modal1, setModal1] = useState(false);

    const [cliente, setCliente] = useState(false);
    const [userId, setUserId] = useState(localStorage.getItem('userId'));

    const { totalPrecio, cancelarCompra, productsSellList } = useContext(productsSellContext);

    const cancelar = () => {
        swal({
            title: '¿Está seguro de cancelar la compra?',
            text: 'Esta desición eliminará todos los productos cargados en el carrito de compras.',
            icon: 'warning',
            dangerMode: true,
            buttons: ['No, seguir facturando', 'Si, vacíar carrito'],
        }).then((willDelete) => {
            if (willDelete) {
                setClienteBool(0);
                setEnvioEmailBool(0);
                cancelarCompra();
            }
        });
    };

    const generarFactura = async () => {
        if (descuentoPerc > 100) {
            swal('Error: Descuento erroneo!', 'Controle el descuento, no puede ser mayor a 100', 'error');
        } else {
            let data;
            if (parseInt(clienteBool) === 0) {
                data = {
                    dataFact: {
                        fecha: moment(new Date()).format('YYYY-MM-DD'),
                        pv_id: ptoVta.id,
                        fiscal: factFiscBool,
                        forma_pago: 5,
                        enviar_email: envioEmailBool,
                        cliente_email: emailCliente,
                        lista_prod: productsSellList,
                        descuentoPerc: descuentoPerc,
                        variosPagos: variosPagos,
                        t_fact: parseInt(tfact),
                    },
                    fiscal: factFiscBool,
                    user_id: userId,
                };
            } else {
                data = {
                    dataFact: {
                        fecha: moment(new Date()).format('YYYY-MM-DD'),
                        pv_id: ptoVta.id,
                        fiscal: factFiscBool,
                        forma_pago: 5,
                        enviar_email: envioEmailBool,
                        cliente_email: emailCliente,
                        cliente_bool: parseInt(clienteBool),
                        lista_prod: productsSellList,
                        descuentoPerc: descuentoPerc,
                        variosPagos: variosPagos,
                        t_fact: parseInt(tfact),
                        cliente_id: cliente.id,
                    },
                    fiscal: factFiscBool,
                    user_id: userId,
                };
            }
            if (
                totalPrecio === 0 ||
                Math.round(total * 100) / 100 !==
                    Math.round((totalPrecio - totalPrecio * (descuentoPerc / 100)) * 100) / 100
            ) {
                swal(
                    'Error: Total del pago!',
                    'Revise que el total del pago debe ser igual al total de la factura.',
                    'error',
                );
            } else {
                if (productsSellList.length > 0) {
                    generarFacturaFinal(data);
                } else {
                    swal('Error en el carrito!', 'No hay productos para facturar! Controlelo.', 'error');
                }
            }
        }
    };

    const generarFacturaFinal = async (data) => {
        setProcessing(true);
        await axios
            .post(UrlNodeServer.invoicesDir.invoices, data, {
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
                cancelarCompra();
                setDescuentoPer(0);
                setFactFiscBool(0);
                setClienteBool(0);
                setEnvioEmailBool(0);
                setVariosPagos([]);
                setEmailCliente('');
                setCliente(false);
                setUserId(localStorage.getItem('userId'));
                if (envioEmailBool) {
                    swal(
                        'Nueva Factura!',
                        'La factura se ha generado con éxito y pronto le llegará al cliente por email!',
                        'success',
                    );
                } else {
                    swal('Nueva Factura!', 'La factura se ha generado con éxito!', 'success');
                }
            })
            .catch(async (err) => {
                console.log('object :>> ', err);
                if (err.code === 'ECONNABORTED') {
                    await swal(
                        'Tiempo de espera superado!',
                        'Ha tardado demasiado el servidor en responder. En breve se generará la factura y la podrá ver reflejada consultando en el sistema.',
                        'error',
                    );
                    await swal('Le mandaremos un email en cuanto se genere la factura.', '', 'info');
                } else {
                    swal(
                        'Error inesperado!',
                        'La factura no se pudo generar por un error en los datos! Controle que no falten datos importantes en la cabecera',
                        'error',
                    );
                }
            })
            .finally(() => {
                setProcessing(false);
            });
    };

    useEffect(() => {
        if (parseInt(factFiscBool) === 1) {
            if (ptoVta.cond_iva === 0) {
                setTfact(0);
            } else if (ptoVta.cond_iva === 1) {
                if (parseInt(clienteBool) === 1) {
                    setTfact(1);
                } else {
                    setTfact(6);
                }
            } else {
                setTfact(11);
            }
        } else {
            setTfact(0);
        }
    }, [factFiscBool, clienteBool, ptoVta.cond_iva]);

    useEffect(() => {
        cliente && setEmailCliente(cliente.email);
    }, [cliente]);

    useEffect(() => {
        if (parseInt(clienteBool) === 0) {
            setCliente(false);
        }
    }, [clienteBool]);

    return (
        <Card>
            <ModalChange descuentoPerc={descuentoPerc} modal={modal1} toggle={() => setModal1(!modal1)} />
            <CardBody>
                {processing ? (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: 'green' }}>Procesando Factura...</h2>
                        <Spinner type="grow" color="light" style={{ width: '250px', height: '250px' }} />{' '}
                    </div>
                ) : (
                    <>
                        <InvoiceHeader
                            setPtoVta={setPtoVta}
                            setFactFiscBool={setFactFiscBool}
                            setClienteBool={setClienteBool}
                            setEmailCliente={setEmailCliente}
                            setEnvioEmailBool={setEnvioEmailBool}
                            factFiscBool={factFiscBool}
                            clienteBool={clienteBool}
                            envioEmailBool={envioEmailBool}
                            emailCliente={emailCliente}
                            ptoVta={ptoVta}
                            tfact={tfact}
                            setTfact={setTfact}
                            setValidPV={setValidPV}
                            setModal1={setModal1}
                            modal1={modal1}
                            cliente={cliente}
                            setCliente={setCliente}
                            userId={userId}
                            setUserId={setUserId}
                        />

                        <br />

                        <ProductFinder />

                        <ProdListSell />
                        <Row>
                            <Col md="6">
                                <FormasPagoMod
                                    clienteBool={clienteBool}
                                    variosPagos={variosPagos}
                                    setVariosPagos={setVariosPagos}
                                    factFiscBool={factFiscBool}
                                    total={total}
                                    setTotal={setTotal}
                                    totalPrecio={totalPrecio}
                                    cliente={cliente}
                                    descuentoPerc={descuentoPerc}
                                />
                            </Col>
                            <Col md="6">
                                <Row style={{ marginTop: 0 }}>
                                    <Col md="4" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                        <Label style={{ fontSize: '25px', fontWeight: 'bold' }}>Subtotal:</Label>
                                    </Col>
                                    <Col md="8">
                                        <FormGroup>
                                            <Input
                                                style={{
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                    textAlign: 'right',
                                                }}
                                                type="text"
                                                value={'$ ' + formatMoney(totalPrecio)}
                                                disabled
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row style={{ marginTop: 0 }}>
                                    <Col md="4" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                        <Label style={{ fontSize: '25px', fontWeight: 'bold' }}>Descuento:</Label>
                                    </Col>
                                    <Col md="8">
                                        <FormGroup>
                                            <Row>
                                                <Col md="4">
                                                    <InputGroup>
                                                        <Input
                                                            style={{
                                                                fontSize: '20px',
                                                                fontWeight: 'bold',
                                                                textAlign: 'right',
                                                            }}
                                                            type="text"
                                                            value={descuentoPerc}
                                                            onChange={(e) => setDescuentoPer(e.target.value)}
                                                            min={0}
                                                            max={100}
                                                        />
                                                        <InputGroupAddon addonType="append">%</InputGroupAddon>
                                                    </InputGroup>
                                                </Col>
                                                <Col md="8">
                                                    <Input
                                                        style={{
                                                            fontSize: '20px',
                                                            fontWeight: 'bold',
                                                            textAlign: 'right',
                                                        }}
                                                        type="text"
                                                        value={
                                                            '$ ' +
                                                            formatMoney(
                                                                descuentoPerc > 0 && descuentoPerc <= 100
                                                                    ? totalPrecio * (descuentoPerc / 100)
                                                                    : 0,
                                                            )
                                                        }
                                                        disabled
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row style={{ marginTop: 0 }}>
                                    <Col md="4" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                        <Label style={{ fontSize: '25px', fontWeight: 'bold' }}>Total:</Label>
                                    </Col>
                                    <Col md="8">
                                        <FormGroup>
                                            <Input
                                                style={{
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                    textAlign: 'right',
                                                }}
                                                type="text"
                                                value={
                                                    '$ ' +
                                                    formatMoney(
                                                        parseFloat(descuentoPerc) > 0 &&
                                                            parseFloat(descuentoPerc) <= 100
                                                            ? totalPrecio - totalPrecio * (descuentoPerc / 100)
                                                            : totalPrecio,
                                                    )
                                                }
                                                disabled
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row style={{ marginTop: 0, textAlign: 'center' }}>
                            <Col>
                                <button
                                    className={
                                        totalPrecio === 0 ||
                                        Math.round(total * 100) / 100 !==
                                            Math.round((totalPrecio - totalPrecio * (descuentoPerc / 100)) * 100) / 100
                                            ? 'btn btn-gray'
                                            : 'btn btn-success'
                                    }
                                    style={{ margin: '15px', width: '200px' }}
                                    disabled={
                                        totalPrecio === 0 ||
                                        Math.round(total * 100) / 100 !==
                                            Math.round((totalPrecio - totalPrecio * (descuentoPerc / 100)) * 100) / 100
                                            ? true
                                            : false
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        generarFactura();
                                    }}
                                >
                                    Confirmar Compra
                                </button>
                                <button
                                    className="btn btn-danger"
                                    style={{ margin: '15px', width: '200px' }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        cancelar();
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

export default Ventas;
