import React, { useMemo, useState } from 'react';
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

const parseIds = (value) => {
    return value
        .split(/[\s,;]+/)
        .map((item) => Number(item.trim()))
        .filter((item, index, array) => item > 0 && array.indexOf(item) === index);
};

const formatTotal = (value) => {
    const number = Number(value) || 0;
    return `$ ${formatMoney(number)}`;
};

const RefacturarIvaModal = ({ modal, toggle, actualizar }) => {
    const [idsText, setIdsText] = useState('');
    const [fecha, setFecha] = useState(moment().format('YYYY-MM-DD'));
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [confirmado, setConfirmado] = useState(false);

    const ids = useMemo(() => parseIds(idsText), [idsText]);
    const hayErrores = results.some((item) => item.error);
    const puedeEmitir = results.length > 0 && !hayErrores && !confirmado;

    const ejecutar = async (confirm) => {
        if (ids.length === 0) {
            swal('Refacturacion de IVA', 'Ingrese al menos un ID de factura valido.', 'error');
            return;
        }

        if (confirm) {
            const seguir = await swal({
                title: 'Emitir comprobantes fiscales',
                text:
                    'Se emitira una Nota de Credito y una nueva factura por cada ID. Esta operacion no se puede revertir desde el sistema.',
                icon: 'warning',
                buttons: ['Cancelar', 'Emitir'],
                dangerMode: true,
            });

            if (!seguir) {
                return;
            }
        }

        setLoading(true);
        await axios
            .post(
                UrlNodeServer.invoicesDir.sub.refacturarIva,
                {
                    ids,
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
                setResults(body.results || []);
                setConfirmado(Boolean(body.confirm));
                if (body.confirm) {
                    swal('Refacturacion de IVA', 'Proceso ejecutado. Revise el resultado por factura.', 'success');
                    actualizar();
                }
            })
            .catch((error) => {
                swal(
                    'Refacturacion de IVA',
                    `No se pudo procesar la solicitud. ${error && error.message ? error.message : ''}`,
                    'error',
                );
            })
            .finally(() => setLoading(false));
    };

    const limpiar = () => {
        setIdsText('');
        setFecha(moment().format('YYYY-MM-DD'));
        setResults([]);
        setConfirmado(false);
    };

    return (
        <Modal isOpen={modal} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>Refacturar IVA</ModalHeader>
            <ModalBody>
                <Row>
                    <Col md="8">
                        <FormGroup>
                            <Label for="refacturarIvaIds">IDs de facturas</Label>
                            <Input
                                id="refacturarIvaIds"
                                type="textarea"
                                rows="4"
                                value={idsText}
                                onChange={(e) => {
                                    setIdsText(e.target.value);
                                    setResults([]);
                                    setConfirmado(false);
                                }}
                                placeholder="Ej: 123, 124, 125"
                            />
                        </FormGroup>
                    </Col>
                    <Col md="4">
                        <FormGroup>
                            <Label for="refacturarIvaFecha">Fecha de los nuevos comprobantes</Label>
                            <Input
                                id="refacturarIvaFecha"
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                            />
                        </FormGroup>
                        <Alert color="info" className="mb-0">
                            Vista previa no emite comprobantes. La emision final requiere confirmacion.
                        </Alert>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <div className="mb-3">
                            <Badge color={ids.length > 0 ? 'primary' : 'secondary'}>
                                {ids.length} factura{ids.length === 1 ? '' : 's'} seleccionada
                                {ids.length === 1 ? '' : 's'}
                            </Badge>
                        </div>
                    </Col>
                </Row>

                {results.length > 0 ? (
                    <Table responsive size="sm" bordered>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Estado</th>
                                <th>Original</th>
                                <th>Nota de credito</th>
                                <th>Nueva factura</th>
                                <th>Advertencias</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((item, key) => (
                                <tr key={key}>
                                    <td>{item.id}</td>
                                    <td>
                                        {item.error ? (
                                            <Badge color="danger">Error</Badge>
                                        ) : item.dryRun ? (
                                            <Badge color="info">Vista previa</Badge>
                                        ) : (
                                            <Badge color="success">Emitida</Badge>
                                        )}
                                        {item.error ? <div className="mt-2 text-danger">{item.error}</div> : null}
                                    </td>
                                    <td>
                                        {item.original ? (
                                            <>
                                                <div>Cbte: {item.original.cbte}</div>
                                                <div>Total: {formatTotal(item.original.total)}</div>
                                                <div>Neto: {formatTotal(item.original.total_neto)}</div>
                                                <div>IVA: {formatTotal(item.original.total_iva)}</div>
                                            </>
                                        ) : null}
                                    </td>
                                    <td>
                                        {item.notaCredito ? (
                                            <>
                                                {item.notaCredito.id ? <div>ID nuevo: {item.notaCredito.id}</div> : null}
                                                {item.notaCredito.cbte ? <div>Cbte: {item.notaCredito.cbte}</div> : null}
                                                <div>Total: {formatTotal(item.notaCredito.total)}</div>
                                                <div>Neto: {formatTotal(item.notaCredito.total_neto)}</div>
                                                <div>IVA: {formatTotal(item.notaCredito.total_iva)}</div>
                                            </>
                                        ) : null}
                                    </td>
                                    <td>
                                        {item.facturaNueva ? (
                                            <>
                                                {item.facturaNueva.id ? <div>ID nuevo: {item.facturaNueva.id}</div> : null}
                                                {item.facturaNueva.cbte ? <div>Cbte: {item.facturaNueva.cbte}</div> : null}
                                                <div>Total: {formatTotal(item.facturaNueva.total)}</div>
                                                <div>Neto: {formatTotal(item.facturaNueva.total_neto)}</div>
                                                <div>IVA: {formatTotal(item.facturaNueva.total_iva)}</div>
                                            </>
                                        ) : null}
                                    </td>
                                    <td>
                                        {item.warnings && item.warnings.length > 0
                                            ? item.warnings.map((warning, index) => <div key={index}>{warning}</div>)
                                            : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : null}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={limpiar} disabled={loading}>
                    Limpiar
                </Button>
                <Button color="info" onClick={() => ejecutar(false)} disabled={loading || ids.length === 0}>
                    {loading ? <Spinner size="sm" /> : null} Vista previa
                </Button>
                <Button color="danger" onClick={() => ejecutar(true)} disabled={loading || !puedeEmitir}>
                    {loading ? <Spinner size="sm" /> : null} Emitir NC y facturas
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default RefacturarIvaModal;
