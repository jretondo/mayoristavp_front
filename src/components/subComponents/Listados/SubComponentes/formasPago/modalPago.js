import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import swal from 'sweetalert';
import ModalChange from './modalChange';
import { roundNumber } from '../../../../../Function/roundNumber';

const ModalPago = ({
    modal,
    toggle,
    setVariosPagos,
    clienteBool,
    factFiscBool,
    total,
    totalPrecio,
    cliente,
    descuentoPerc,
}) => {
    const [pago, setPago] = useState({
        tipo: 0,
        tipo_txt: 'Efectivo',
        importe: 0,
        fecha_emision: '',
        fecha_vencimiento: '',
        banco: '',
        nro_cheque: '',
        notas: '',
    });
    const [changeModal, setChangeModal] = useState(false);

    const nvoPago = () => {
        if (pago.importe <= 0) {
            swal({
                title: 'El importe debe ser mayor a 0',
                timer: 1500,
                icon: 'warning',
            });
            document.getElementById('impPagosTxt')?.focus();
            return;
        }
        if (parseInt(pago.tipo) === 6) {
            if (fechaCheque(pago.fecha_emision, pago.fecha_vencimiento) === false) {
                return;
            }
            if (pago.banco === '') {
                swal({
                    title: 'Debe ingresar el banco',
                    timer: 1500,
                    icon: 'warning',
                });

                document.getElementById('bancoTxt')?.focus();
                return;
            }
            if (pago.nro_cheque === '') {
                swal({
                    title: 'Debe ingresar el número de cheque',
                    timer: 1500,
                    icon: 'warning',
                });
                document.getElementById('nroChequeTxt')?.focus();
                return;
            }
            if (pago.fecha_emision === '') {
                swal({
                    title: 'Debe ingresar la fecha de emisión',
                    timer: 1500,
                    icon: 'warning',
                });
                document.getElementById('fechaEmTxt')?.focus();
                return;
            }
            if (pago.fecha_vencimiento === '') {
                swal({
                    title: 'Debe ingresar la fecha de vencimiento',
                    timer: 1500,
                    icon: 'warning',
                });
                document.getElementById('fechaVencTxt')?.focus();
                return;
            }
        }
        const totalParsed = Math.round(total * 100) / 100;
        const totalPrecioParsed = Math.round((totalPrecio - totalPrecio * (descuentoPerc / 100)) * 100) / 100;
        const importeParsed = Math.round(pago.importe * 100) / 100;
        const totalSuma = roundNumber(totalParsed + importeParsed, 2);

        if (totalSuma > totalPrecioParsed) {
            swal('El importe supera el total', '', 'warning');
            return;
        }
        setVariosPagos((variosPagos) => [
            ...variosPagos,
            {
                tipo: pago.tipo,
                tipo_txt: pago.tipo_txt,
                importe: roundNumber(pago.importe),
                fecha_emision: pago.fecha_emision,
                fecha_vencimiento: pago.fecha_vencimiento,
                banco: pago.banco,
                nro_cheque: pago.nro_cheque,
                notas: pago.notas,
            },
        ]);
        // swal('Agregado con éxito!', '', 'success');
        setPago({
            tipo: 0,
            tipo_txt: 'Efectivo',
            importe: 0,
            fecha_emision: '',
            fecha_vencimiento: '',
            banco: '',
            nro_cheque: '',
            notas: '',
        });
        try {
            document.getElementById('formaPagoModal').focus();
        } catch (error) {
            console.log('error :>> ', error);
        }
    };

    const fechaCheque = (fecha_emision, fecha_vencimiento) => {
        if (fecha_emision === '' || fecha_vencimiento === '') {
            return false;
        }
        const fechaEm = new Date(fecha_emision);
        const fechaVenc = new Date(fecha_vencimiento);
        const hoy = new Date();
        if (fechaEm > fechaVenc) {
            swal({
                title: 'La fecha de emisión no puede ser mayor a la de vencimiento',
                timer: 1500,
                icon: 'warning',
            });
            return false;
        }
        if (fechaEm > hoy) {
            swal({
                title: 'La fecha de emisión no puede ser mayor a la actual',
                timer: 1500,
                icon: 'warning',
            });
            return false;
        }

        const diffTime = Math.abs(fechaVenc - hoy);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (fechaVenc < hoy && diffDays > 30) {
            swal({
                title: 'La fecha de vencimiento no puede ser mayor a 30 días',
                timer: 1500,
                icon: 'warning',
            });
            return false;
        }

        const diffTime2 = Math.abs(fechaVenc - fechaEm);
        const diffDays2 = Math.ceil(diffTime2 / (1000 * 60 * 60 * 24));
        if (diffDays2 > 360) {
            swal({
                title: 'La fecha de vencimiento no puede superar los 360 días',
                timer: 1500,
                icon: 'warning',
            });
            return false;
        }
        return true;
    };

    useEffect(() => {
        const totalParsed = Math.round(total * 100) / 100;
        const totalPrecioParsed = Math.round((totalPrecio - totalPrecio * (descuentoPerc / 100)) * 100) / 100;
        setPago({
            ...pago,
            importe: Math.round((totalPrecioParsed - totalParsed) * 100) / 100,
        });
    }, [totalPrecio, total, descuentoPerc]);

    useEffect(() => {
        if (!cliente || parseInt(clienteBool) === 0) {
            setPago({
                ...pago,
                tipo: 0,
                tipo_txt: 'Efectivo',
            });
            setVariosPagos((variosPagos) => variosPagos.filter((item) => parseInt(item.tipo) !== 4));
        }
    }, [cliente, clienteBool]);

    useEffect(() => {
        const totalParsed = Math.round(total * 100) / 100;
        const totalPrecioParsed = Math.round((totalPrecio - totalPrecio * (descuentoPerc / 100)) * 100) / 100;
        if (totalParsed === totalPrecioParsed) {
            modal && toggle();
        }
    }, [total]);

    useEffect(() => {
        modal &&
            setTimeout(() => {
                document.getElementById('formaPagoModal')?.focus();
            }, 300);
    }, [modal]);

    return (
        <>
            <Modal isOpen={modal} toggle={toggle} size={parseInt(pago.tipo) === 6 ? 'lg' : 'md'}>
                <ModalHeader toggle={toggle}>Nuevo método de pago</ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md={parseInt(pago.tipo) === 6 ? 4 : 6}>
                            <FormGroup>
                                <Label for="formaPagoModal">Forma de Pago</Label>
                                <Row>
                                    <Col md={12}>
                                        <Input
                                            type="select"
                                            value={pago.tipo}
                                            id="formaPagoModal"
                                            onChange={(e) => {
                                                setPago({
                                                    ...pago,
                                                    tipo: e.target.value,
                                                    tipo_txt: e.target[e.target.selectedIndex].text,
                                                });
                                            }}
                                        >
                                            <option value={0}>Efectivo</option>
                                            <option value={1}>Mercado Pago</option>
                                            <option value={2}>Débito</option>
                                            <option value={3}>Crédito</option>
                                            <option value={7}>Transferencia</option>
                                            {parseInt(clienteBool) === 1 && cliente ? (
                                                <option value={4}>Cuenta Corriente</option>
                                            ) : null}
                                        </Input>
                                    </Col>
                                    {parseInt(pago.tipo) === 0 ? (
                                        <Col>
                                            <Button color={'success'} onClick={() => setChangeModal(!changeModal)}>
                                                Cambio
                                            </Button>
                                        </Col>
                                    ) : null}
                                </Row>
                            </FormGroup>
                        </Col>
                        <Col md={parseInt(pago.tipo) === 6 ? 4 : 6}>
                            <FormGroup>
                                <Label for="impPagosTxt">Importe</Label>
                                <Input
                                    type="number"
                                    min={0.01}
                                    step={0.01}
                                    value={pago.importe}
                                    id="impPagosTxt"
                                    onChange={(e) => {
                                        setPago({ ...pago, importe: e.target.value });
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            nvoPago();
                                        }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                />
                            </FormGroup>
                        </Col>
                        {
                            // Cheque
                            parseInt(pago.tipo) === 6 ? (
                                <>
                                    <Col md="4">
                                        <FormGroup>
                                            <Label for="bancoTxt">Banco</Label>
                                            <Input
                                                type="text"
                                                value={pago.banco}
                                                id="bancoTxt"
                                                onChange={(e) => {
                                                    setPago({ ...pago, banco: e.target.value });
                                                }}
                                            />
                                        </FormGroup>
                                    </Col>
                                </>
                            ) : null
                        }
                    </Row>
                    {parseInt(pago.tipo) === 6 ? (
                        <Row>
                            <Col md="4">
                                <FormGroup>
                                    <Label for="nroChequeTxt">Nro Cheque</Label>
                                    <Input
                                        type="text"
                                        value={pago.nro_cheque}
                                        id="nroChequeTxt"
                                        onChange={(e) => {
                                            setPago({ ...pago, nro_cheque: e.target.value });
                                        }}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <FormGroup>
                                    <Label for="fechaEmTxt">Fecha Emisión</Label>
                                    <Input
                                        type="date"
                                        value={pago.fecha_emision}
                                        id="fechaEmTxt"
                                        onChange={(e) => {
                                            setPago({ ...pago, fecha_emision: e.target.value });
                                        }}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <FormGroup>
                                    <Label for="fechaVencTxt">Fecha Vencimiento</Label>
                                    <Input
                                        type="date"
                                        value={pago.fecha_vencimiento}
                                        id="fechaVencTxt"
                                        onChange={(e) => {
                                            setPago({ ...pago, fecha_vencimiento: e.target.value });
                                        }}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    ) : null}
                    <Row>
                        <Col md={12}>
                            <FormGroup>
                                <Label for="notasTxt">Notas</Label>
                                <Input
                                    type="textarea"
                                    value={pago.notas}
                                    id="notasTxt"
                                    onChange={(e) => {
                                        setPago({ ...pago, notas: e.target.value });
                                    }}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={(e) => {
                            e.preventDefault();
                            nvoPago();
                        }}
                    >
                        Aceptar
                    </Button>
                    <Button
                        color="danger"
                        onClick={(e) => {
                            e.preventDefault();
                            toggle();
                        }}
                    >
                        Cancelar
                    </Button>
                </ModalFooter>
            </Modal>
            <ModalChange modal={changeModal} toggle={() => setChangeModal(!changeModal)} importe={pago.importe} />
        </>
    );
};

export default ModalPago;
