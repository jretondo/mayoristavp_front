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

const parseErrorResponse = (err) => {
    const defaultMessage =
        'La factura no se pudo generar por un error en los datos! Controle que no falten datos importantes en la cabecera';
    const responseData = err && err.response && err.response.data;

    if (!responseData) {
        return defaultMessage;
    }

    try {
        let data = responseData;
        if (responseData instanceof ArrayBuffer) {
            data = new TextDecoder('utf-8').decode(responseData);
        }

        if (typeof data === 'string') {
            const text = data.trim();
            if (!text) {
                return defaultMessage;
            }
            data = JSON.parse(text);
        }

        if (data && typeof data === 'object') {
            if (typeof data.body === 'string') {
                return data.body;
            }
            if (typeof data.message === 'string') {
                return data.message;
            }
            if (typeof data.error === 'string') {
                return data.error;
            }
        }
    } catch (error) {
        return defaultMessage;
    }

    return defaultMessage;
};

const getInvoicePublicUrl = (pdfUrl) => {
    if (!pdfUrl) {
        return '';
    }

    const publicBase = UrlNodeServer.invoicesDir.invoices.replace(/\/api\/invoices$/, '/static');
    const cleanPdfUrl = pdfUrl.replace(/^\/static/, '');
    return publicBase + cleanPdfUrl;
};

const createInvoicePrintWindow = () => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) {
        return null;
    }

    invoiceWindow.document.write(`
        <!doctype html>
        <html>
            <head>
                <title>Generando comprobante</title>
                <style>
                    body {
                        margin: 0;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: Arial, sans-serif;
                        color: #172b4d;
                        background: #f2f4f8;
                    }
                </style>
            </head>
            <body>Generando comprobante...</body>
        </html>
    `);
    invoiceWindow.document.close();
    return invoiceWindow;
};

const openInvoicePrintWindow = ({ html, fileName, pdfUrl }, invoiceWindow) => {
    if (!invoiceWindow) {
        swal('Comprobante generado', 'El navegador bloqueó la ventana de impresión.', 'warning');
        return;
    }

    const pdfLink = getInvoicePublicUrl(pdfUrl);
    const toolbarStyles = `
        <style id="invoice-print-toolbar-style">
            body {
                padding-top: 52px;
            }
            .invoice-print-toolbar {
                position: fixed;
                z-index: 99999;
                top: 0;
                left: 0;
                right: 0;
                height: 52px;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 0 12px;
                background: #172b4d;
                color: #fff;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
            }
            .invoice-print-toolbar strong {
                flex: 1;
                font-size: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .invoice-print-toolbar button,
            .invoice-print-toolbar a {
                border: 0;
                border-radius: 4px;
                padding: 8px 12px;
                background: #fff;
                color: #172b4d;
                font-size: 13px;
                cursor: pointer;
                text-decoration: none;
            }
            @media print {
                body {
                    padding-top: 0 !important;
                }
                .invoice-print-toolbar {
                    display: none !important;
                }
            }
        </style>
    `;
    const toolbarHtml = `
        <div class="invoice-print-toolbar">
            <strong>${fileName || 'Comprobante generado'}</strong>
            <button id="printButton" type="button">Imprimir</button>
            ${pdfLink ? `<a href="${pdfLink}" target="_blank" rel="noreferrer">PDF</a>` : ''}
        </div>
    `;
    const printableHtml = html
        .replace('</head>', `${toolbarStyles}</head>`)
        .replace('<body>', `<body>${toolbarHtml}`);

    invoiceWindow.document.open();
    invoiceWindow.document.write(printableHtml);
    invoiceWindow.document.close();

    const printButton = invoiceWindow.document.getElementById('printButton');
    if (printButton) {
        printButton.addEventListener('click', () => {
            invoiceWindow.print();
        });
    }
};

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
    const [fecha, setFecha] = useState(moment(new Date()).format('YYYY-MM-DD'));

    const { totalPrecio, cancelarCompra, productsSellList, orderId, sinStock } = useContext(productsSellContext);

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
                        fecha: moment(fecha).format('YYYY-MM-DD'),
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
                        fecha: moment(fecha).format('YYYY-MM-DD'),
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
            if (totalPrecio === 0 || Math.round(total * 100) / 100 !== totalFacturaRedondeado) {
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
        const invoiceWindow = createInvoicePrintWindow();
        await axios
            .post(UrlNodeServer.invoicesDir.invoices, data, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                    Accept: 'application/json',
                },
            })
            .then((res) => {
                const invoiceData = res.data && res.data.body ? res.data.body : {};
                if (invoiceData.html) {
                    openInvoicePrintWindow(invoiceData, invoiceWindow);
                }
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
                if (invoiceWindow) {
                    invoiceWindow.close();
                }

                if (err.code === 'ECONNABORTED') {
                    await swal(
                        'Tiempo de espera superado!',
                        'Ha tardado demasiado el servidor en responder. En breve se generará la factura y la podrá ver reflejada consultando en el sistema.',
                        'error',
                    );
                    await swal('Le mandaremos un email en cuanto se genere la factura.', '', 'info');
                } else {
                    const errorMessage = parseErrorResponse(err);
                    swal(
                        'Error inesperado!',
                        errorMessage,
                        'error',
                    );
                }
            })
            .finally(() => {
                setProcessing(false);
            });
    };

    const ordenarPedido = async () => {
        let input = document.createElement('input');
        input.value = orderId;
        input.type = 'number';
        input.className = 'swal-content__input';
        swal({
            text: 'Ingrese el número de pedido',
            content: input,
            button: {
                text: 'Ingresar',
                closeModal: false,
            },
        })
            .then(async () => {
                const pedido = parseInt(input.value);
                if (pedido && pedido !== '' && !isNaN(pedido)) {
                    let data;
                    if (parseInt(clienteBool) === 0) {
                        data = {
                            dataFact: {
                                fecha: moment(fecha).format('YYYY-MM-DD'),
                                pv_id: ptoVta.id,
                                fiscal: 0,
                                forma_pago: 5,
                                enviar_email: false,
                                cliente_email: '',
                                lista_prod: productsSellList,
                                descuentoPerc: descuentoPerc,
                                variosPagos: variosPagos,
                                t_fact: 0,
                            },
                            fiscal: 0,
                            user_id: userId,
                            orderId: pedido,
                        };
                    } else {
                        data = {
                            dataFact: {
                                fecha: moment(fecha).format('YYYY-MM-DD'),
                                pv_id: ptoVta.id,
                                fiscal: 0,
                                forma_pago: 5,
                                enviar_email: false,
                                cliente_email: '',
                                cliente_bool: parseInt(clienteBool),
                                lista_prod: productsSellList,
                                descuentoPerc: descuentoPerc,
                                variosPagos: variosPagos,
                                t_fact: 0,
                                cliente_id: cliente.id,
                            },
                            fiscal: 0,
                            user_id: userId,
                            orderId: pedido,
                        };
                    }
                    setProcessing(true);
                    await axios
                        .post(UrlNodeServer.invoicesDir.sub.order, data, {
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
                            swal('Pedido realizado!', 'La orden de pedido se generó con éxito.', 'success');
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
                                    'La orden de pedido no se pudo generar. Controle que no falten datos importantes.',
                                    'error',
                                );
                            }
                        })
                        .finally(() => {
                            setProcessing(false);
                        });
                } else {
                    swal('Error!', 'Hubo un error. Controle que haya colocado un número válido!', 'error');
                }
            })
            .catch(() => {
                swal('Error!', 'Hubo un error. Controle que haya colocado un número válido!', 'error');
            });
    };

    useEffect(() => {
        if (parseInt(factFiscBool) === 1) {
            if (ptoVta.cond_iva === 0) {
                setTfact(0);
            } else if (ptoVta.cond_iva === 1) {
                if (parseInt(clienteBool) === 1 && cliente && [1, 6, 13].includes(parseInt(cliente.cond_iva))) {
                    setTfact(parseInt(ptoVta.fact_m) === 1 ? 51 : 1);
                } else {
                    setTfact(6);
                }
            } else {
                setTfact(11);
            }
        } else {
            setTfact(0);
        }
    }, [factFiscBool, clienteBool, cliente, ptoVta.cond_iva, ptoVta.fact_m]);

    useEffect(() => {
        cliente && setEmailCliente(cliente.email);
    }, [cliente]);

    useEffect(() => {
        if (parseInt(clienteBool) === 0) {
            setCliente(false);
        }
    }, [clienteBool]);

    const aplicaIva =
        parseInt(factFiscBool) === 1 && Number(ptoVta.cond_iva) === 1 && [1, 6, 51].includes(parseInt(tfact));
    const descuentoGeneralValido = parseFloat(descuentoPerc) > 0 && parseFloat(descuentoPerc) <= 100;
    const totalAntesDescuento = totalPrecio;
    const totalConDescuento = descuentoGeneralValido
        ? totalAntesDescuento - totalAntesDescuento * (descuentoPerc / 100)
        : totalAntesDescuento;
    const totalesIva = productsSellList.reduce(
        (acc, item) => {
            const descuentoItem = Number(item.descuento_porcentaje) || 0;
            const ivaPorcentaje = Number(item.iva) || 0;
            const totalItem = Number(item.vta_price) * Number(item.cant_prod) * (1 - descuentoItem / 100);
            const netoItem = aplicaIva && ivaPorcentaje > 0 ? totalItem / (1 + ivaPorcentaje / 100) : totalItem;
            const ivaItem = aplicaIva ? totalItem - netoItem : 0;

            return {
                neto: acc.neto + netoItem,
                iva: acc.iva + ivaItem,
            };
        },
        { neto: 0, iva: 0 },
    );
    const factorDescuentoGeneral = descuentoGeneralValido ? 1 - descuentoPerc / 100 : 1;
    const netoGravado = totalesIva.neto * factorDescuentoGeneral;
    const totalIva = totalesIva.iva * factorDescuentoGeneral;
    const totalFacturaRedondeado = Math.round(totalConDescuento * 100) / 100;

    console.log('sinStock :>> ', sinStock);
    return (
        <Card>
            <ModalChange
                descuentoPerc={descuentoPerc}
                modal={modal1}
                toggle={() => setModal1(!modal1)}
                totalFactura={totalAntesDescuento}
            />
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
                            fecha={fecha}
                            setFecha={setFecha}
                        />

                        <br />

                        <ProductFinder />

                        <ProdListSell aplicaIva={aplicaIva} />
                        <Row>
                            <Col md="6">
                                <FormasPagoMod
                                    clienteBool={clienteBool}
                                    variosPagos={variosPagos}
                                    setVariosPagos={setVariosPagos}
                                    factFiscBool={factFiscBool}
                                    total={total}
                                    setTotal={setTotal}
                                    totalPrecio={totalAntesDescuento}
                                    cliente={cliente}
                                    descuentoPerc={descuentoPerc}
                                />
                            </Col>
                            <Col md="6">
                                {!aplicaIva && (
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
                                                    value={'$ ' + formatMoney(totalAntesDescuento)}
                                                    disabled
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                )}

                                {aplicaIva && (
                                    <>
                                        <Row style={{ marginTop: 0 }}>
                                            <Col md="4" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                                <Label style={{ fontSize: '25px', fontWeight: 'bold' }}>
                                                    Neto gravado:
                                                </Label>
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
                                                        value={'$ ' + formatMoney(netoGravado)}
                                                        disabled
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <Row style={{ marginTop: 0 }}>
                                            <Col md="4" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                                <Label style={{ fontSize: '25px', fontWeight: 'bold' }}>IVA:</Label>
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
                                                        value={'$ ' + formatMoney(totalIva)}
                                                        disabled
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </>
                                )}

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
                                                                    ? totalAntesDescuento * (descuentoPerc / 100)
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
                                                value={'$ ' + formatMoney(totalConDescuento)}
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
                                        totalPrecio === 0 || Math.round(total * 100) / 100 !== totalFacturaRedondeado
                                            ? 'btn btn-gray'
                                            : 'btn btn-success'
                                    }
                                    style={{ margin: '15px', width: '200px' }}
                                    disabled={
                                        sinStock ||
                                        totalPrecio === 0 ||
                                        Math.round(total * 100) / 100 !== totalFacturaRedondeado
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
                                <button
                                    className={totalPrecio === 0 ? 'btn btn-gray' : 'btn btn-success'}
                                    style={{ margin: '15px', width: '200px' }}
                                    disabled={totalPrecio === 0 ? true : false}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        ordenarPedido();
                                    }}
                                >
                                    Ordenar Pedido
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
