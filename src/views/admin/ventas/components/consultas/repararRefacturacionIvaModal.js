import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import swal from 'sweetalert';
import {
    Alert,
    Badge,
    Button,
    Col,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner,
    Table,
} from 'reactstrap';
import UrlNodeServer from '../../../../../api/NodeServer';
import formatMoney from 'Function/NumberFormat';

const formatTotal = (value) => {
    const number = Number(value) || 0;
    return `$ ${formatMoney(number)}`;
};

const resumenLabel = (item) => {
    if (!item) {
        return '';
    }

    return `${item.letra || ''} ${item.pv || ''}-${item.cbte || ''}`;
};

const RepararRefacturacionIvaModal = ({ modal, toggle, actualizar }) => {
    const [originalId, setOriginalId] = useState('');
    const [ncErroneaId, setNcErroneaId] = useState('');
    const [facturaNuevaId, setFacturaNuevaId] = useState('');
    const [fecha, setFecha] = useState(moment().format('YYYY-MM-DD'));
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [confirmado, setConfirmado] = useState(false);

    const idsValidos =
        Number(originalId) > 0 && Number(ncErroneaId) > 0 && Number(facturaNuevaId) > 0;
    const puedeEmitir = result && result.dryRun && idsValidos && !confirmado;

    const ejecutar = async (confirm) => {
        if (!idsValidos) {
            swal('Reparacion de refacturacion', 'Complete los tres IDs de comprobantes.', 'error');
            return;
        }

        if (confirm) {
            const seguir = await swal({
                title: 'Emitir reparacion fiscal',
                text:
                    'Se emitira una Nota de Debito para neutralizar la NC erronea y una NC correcta contra la factura original.',
                icon: 'warning',
                buttons: ['Cancelar', 'Emitir reparacion'],
                dangerMode: true,
            });

            if (!seguir) {
                return;
            }
        }

        setLoading(true);
        await axios
            .post(
                UrlNodeServer.invoicesDir.sub.repararRefacturacionIva,
                {
                    originalId: Number(originalId),
                    ncErroneaId: Number(ncErroneaId),
                    facturaNuevaId: Number(facturaNuevaId),
                    fecha,
                    confirm,
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                    },
                },
            )
            .then((res) => {
                const body = res.data.body || {};
                setResult(body);
                setConfirmado(!body.dryRun);

                if (!body.dryRun) {
                    swal('Reparacion de refacturacion', 'Reparacion emitida correctamente.', 'success');
                    actualizar();
                }
            })
            .catch((error) => {
                swal(
                    'Reparacion de refacturacion',
                    `No se pudo procesar la reparacion. ${error && error.message ? error.message : ''}`,
                    'error',
                );
            })
            .finally(() => setLoading(false));
    };

    const limpiar = () => {
        setOriginalId('');
        setNcErroneaId('');
        setFacturaNuevaId('');
        setFecha(moment().format('YYYY-MM-DD'));
        setResult(null);
        setConfirmado(false);
    };

    const renderComprobante = (title, item) => {
        if (!item) {
            return null;
        }

        return (
            <Col md="4">
                <Alert color="secondary">
                    <strong>{title}</strong>
                    <div>{resumenLabel(item)}</div>
                    <div>Total: {formatTotal(item.total)}</div>
                    <div>Neto: {formatTotal(item.total_neto)}</div>
                    <div>IVA: {formatTotal(item.total_iva)}</div>
                    {item.id_fact_asoc ? <div>Asociado: {item.id_fact_asoc}</div> : null}
                </Alert>
            </Col>
        );
    };

    return (
        <Modal isOpen={modal} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>Reparar refacturacion de IVA</ModalHeader>
            <ModalBody>
                <Row>
                    <Col md="3">
                        <FormGroup>
                            <Label for="repararOriginalId">Factura original</Label>
                            <Input
                                id="repararOriginalId"
                                type="number"
                                min="1"
                                value={originalId}
                                onChange={(e) => {
                                    setOriginalId(e.target.value);
                                    setResult(null);
                                    setConfirmado(false);
                                }}
                                placeholder="62210"
                            />
                        </FormGroup>
                    </Col>
                    <Col md="3">
                        <FormGroup>
                            <Label for="repararNcErroneaId">NC erronea</Label>
                            <Input
                                id="repararNcErroneaId"
                                type="number"
                                min="1"
                                value={ncErroneaId}
                                onChange={(e) => {
                                    setNcErroneaId(e.target.value);
                                    setResult(null);
                                    setConfirmado(false);
                                }}
                                placeholder="62435"
                            />
                        </FormGroup>
                    </Col>
                    <Col md="3">
                        <FormGroup>
                            <Label for="repararFacturaNuevaId">Factura nueva correcta</Label>
                            <Input
                                id="repararFacturaNuevaId"
                                type="number"
                                min="1"
                                value={facturaNuevaId}
                                onChange={(e) => {
                                    setFacturaNuevaId(e.target.value);
                                    setResult(null);
                                    setConfirmado(false);
                                }}
                                placeholder="62436"
                            />
                        </FormGroup>
                    </Col>
                    <Col md="3">
                        <FormGroup>
                            <Label for="repararFecha">Fecha de reparacion</Label>
                            <Input
                                id="repararFecha"
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                            />
                        </FormGroup>
                    </Col>
                </Row>

                <Alert color="warning">
                    Primero ejecute vista previa. La emision final genera comprobantes fiscales irreversibles.
                </Alert>

                {result ? (
                    <>
                        <Row>
                            <Col>
                                <Badge color={result.dryRun ? 'info' : 'success'}>
                                    {result.dryRun ? 'Vista previa' : 'Reparacion emitida'}
                                </Badge>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            {renderComprobante('Factura original', result.original)}
                            {renderComprobante('NC erronea', result.ncErronea)}
                            {renderComprobante('Factura nueva correcta', result.facturaNueva)}
                        </Row>
                        <Table responsive size="sm" bordered>
                            <thead>
                                <tr>
                                    <th>Comprobante a emitir</th>
                                    <th>Tipo</th>
                                    <th>Total</th>
                                    <th>Neto</th>
                                    <th>IVA</th>
                                    <th>Asociado a</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.notaDebitoAEmitir ? (
                                    <tr>
                                        <td>Nota de Debito</td>
                                        <td>{result.notaDebitoAEmitir.tipo}</td>
                                        <td>{formatTotal(result.notaDebitoAEmitir.total)}</td>
                                        <td>{formatTotal(result.notaDebitoAEmitir.total_neto)}</td>
                                        <td>{formatTotal(result.notaDebitoAEmitir.total_iva)}</td>
                                        <td>
                                            NC {result.notaDebitoAEmitir.dataFiscal.CbtesAsoc[0].PtoVta}-
                                            {result.notaDebitoAEmitir.dataFiscal.CbtesAsoc[0].Nro}
                                        </td>
                                    </tr>
                                ) : null}
                                {result.notaCreditoCorrectaAEmitir ? (
                                    <tr>
                                        <td>Nota de Credito correcta</td>
                                        <td>{result.notaCreditoCorrectaAEmitir.tipo}</td>
                                        <td>{formatTotal(result.notaCreditoCorrectaAEmitir.total)}</td>
                                        <td>{formatTotal(result.notaCreditoCorrectaAEmitir.total_neto)}</td>
                                        <td>{formatTotal(result.notaCreditoCorrectaAEmitir.total_iva)}</td>
                                        <td>
                                            Factura {result.notaCreditoCorrectaAEmitir.dataFiscal.CbtesAsoc[0].PtoVta}-
                                            {result.notaCreditoCorrectaAEmitir.dataFiscal.CbtesAsoc[0].Nro}
                                        </td>
                                    </tr>
                                ) : null}
                                {result.notaDebito ? (
                                    <tr>
                                        <td>Nota de Debito emitida</td>
                                        <td>-</td>
                                        <td>{formatTotal(result.notaDebito.total)}</td>
                                        <td>{formatTotal(result.notaDebito.total_neto)}</td>
                                        <td>{formatTotal(result.notaDebito.total_iva)}</td>
                                        <td>ID {result.notaDebito.id}</td>
                                    </tr>
                                ) : null}
                                {result.notaCreditoCorrecta ? (
                                    <tr>
                                        <td>Nota de Credito correcta emitida</td>
                                        <td>-</td>
                                        <td>{formatTotal(result.notaCreditoCorrecta.total)}</td>
                                        <td>{formatTotal(result.notaCreditoCorrecta.total_neto)}</td>
                                        <td>{formatTotal(result.notaCreditoCorrecta.total_iva)}</td>
                                        <td>ID {result.notaCreditoCorrecta.id}</td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </Table>
                    </>
                ) : null}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={limpiar} disabled={loading}>
                    Limpiar
                </Button>
                <Button color="info" onClick={() => ejecutar(false)} disabled={loading || !idsValidos}>
                    {loading ? <Spinner size="sm" /> : null} Vista previa
                </Button>
                <Button color="danger" onClick={() => ejecutar(true)} disabled={loading || !puedeEmitir}>
                    {loading ? <Spinner size="sm" /> : null} Emitir reparacion
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default RepararRefacturacionIvaModal;
