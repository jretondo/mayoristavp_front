import UrlNodeServer from '../../../../api/NodeServer';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
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
} from 'reactstrap';
import formatMoney from 'Function/NumberFormat';
import moment from 'moment';
import FileSaver from 'file-saver';
import swal from 'sweetalert';
import { roundNumber } from '../../../../Function/roundNumber';
import FormasPagoMod from './formasPago';
import CompleteCerosLeft from '../../../../Function/CompleteCeroLeft';

const ModalDevPart = ({ modal, toggle, idFact, factura, actualizar }) => {
    const [detDelete, setDetDelete] = useState([
        {
            id: 0,
            id_prod: 0,
            nombre_prod: '',
            cant_prod: 0,
            precio_ind: 0,
            descuento_porcentaje: 0,
            total_prod: 0,
            cant_prod_original: 0,
            key: 0,
            cant_anulada: 0,
            total_prod_original: 0,
        },
    ]);
    const [totalDelete, setTotalDelete] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pagos, setPagos] = useState([]);
    const [total, setTotal] = useState(0);

    const getDetFact = async () => {
        setLoading(true);
        await axios
            .get(UrlNodeServer.invoicesDir.sub.detFact + '/' + idFact, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then((res) => {
                const respuesta = res.data;
                if (respuesta.status === 200) {
                    const body = respuesta.body;
                    if (body && body.length > 0) {
                        setDetDelete(() =>
                            body.map((item, key) => {
                                return {
                                    id: item.id,
                                    id_prod: item.id_prod,
                                    nombre_prod: item.nombre_prod,
                                    cant_prod_original: item.cant_prod,
                                    precio_ind: roundNumber(
                                        item.precio_ind -
                                            roundNumber((item.precio_ind * item.descuento_porcentaje) / 100),
                                    ),
                                    descuento_porcentaje: item.descuento_porcentaje,
                                    total_prod: item.total_prod,
                                    cant_anulada: item.cant_anulada,
                                    total_prod_original: item.total_prod,
                                    cant_prod: 0,
                                    key: key,
                                };
                            }),
                        );
                    }
                }
            })
            .catch(() => {
                setDetDelete([]);
            })
            .finally(() => setLoading(false));
    };

    const changeQty = (e, key) => {
        const cant = parseInt(e.target.value);
        setDetDelete((prevState) =>
            prevState.map((item, index) => {
                if (index === key) {
                    return {
                        ...item,
                        cant_prod: cant,
                        total_prod: cant * item.precio_ind,
                    };
                }
                return item;
            }),
        );
    };

    const generarNC = async () => {
        if (!quantityControl()) {
            swal('Error!', 'La cantidad a anular no puede ser mayor a la cantidad original', 'error');
            return;
        }
        setLoading(true);
        const data = {
            fecha: moment(new Date()).format('YYYY-MM-DD'),
            id: idFact,
            parcial: true,
            variosPagos: pagos,
            items: detDelete,
        };
        await axios
            .post(UrlNodeServer.invoicesDir.sub.notaCred, data, {
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
                swal('Nota de Credito', 'La Nota de Crédito se genero exitosamente!', 'success');
            })
            .catch((error) => {
                swal('Error!', 'Hubo un error al querer generar la Nota de Crédito. Error: ' + error.message, 'error');
            })
            .finally(() => {
                setLoading(false);
                actualizar();
                toggle();
            });
    };

    const quantityControl = () => {
        let control = true;
        detDelete.forEach((item) => {
            if (item.cant_prod > item.cant_prod_original - item.cant_anulada) {
                control = false;
            }
        });
        return control;
    };

    useEffect(() => {
        modal && getDetFact();
        // eslint-disable-next-line
    }, [modal, idFact]);

    useEffect(() => {
        let total = 0;
        detDelete.forEach((item) => {
            total += roundNumber(item.cant_prod * item.precio_ind);
        });
        setTotalDelete(total);
    }, [detDelete]);

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
                                <h3>Items a anular de la factura</h3>
                                {detDelete && detDelete.length > 0
                                    ? detDelete.map((item, key) => (
                                          <>
                                              <Row key={key} style={{ marginTop: '15px' }}>
                                                  <Col md="8" className="p-1">
                                                      <Input
                                                          value={`(${
                                                              item.cant_prod_original - item.cant_anulada
                                                          } X $${formatMoney(item.precio_ind)}) | ${item.nombre_prod} `}
                                                          style={{ fontSize: '12px' }}
                                                          disabled
                                                      />
                                                  </Col>
                                                  <Col md="2" className="p-1">
                                                      <Input
                                                          style={{ textAlign: 'right' }}
                                                          value={item.cant_prod}
                                                          type="number"
                                                          max={item.cant_prod_original - item.cant_anulada}
                                                          min={0}
                                                          onChange={(e) => changeQty(e, key)}
                                                          disabled={
                                                              item.cant_prod_original - item.cant_anulada === 0 ||
                                                              item.total_prod_original === 0
                                                          }
                                                      />
                                                  </Col>
                                                  <Col md="2" className="p-1">
                                                      <Input
                                                          style={{ textAlign: 'right' }}
                                                          value={'$ ' + formatMoney(item.cant_prod * item.precio_ind)}
                                                          disabled
                                                      />
                                                  </Col>
                                              </Row>
                                          </>
                                      ))
                                    : null}
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col md="6" style={{ textAlign: 'right' }}>
                                <Label style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '10px' }}>
                                    Total a Anular:
                                </Label>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <Input
                                        disabled
                                        style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'right' }}
                                        value={'$ ' + formatMoney(totalDelete)}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <hr style={{ margin: '10px' }} />
                        <Row>
                            <Col md="12">
                                <FormasPagoMod
                                    clienteBool={factura.n_doc_cliente.toString().length > 1 ? 1 : 0}
                                    variosPagos={pagos}
                                    setVariosPagos={setPagos}
                                    factFiscBool={false}
                                    total={total}
                                    setTotal={setTotal}
                                    totalPrecio={totalDelete}
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
                        generarNC();
                    }}
                    disabled={loading || totalDelete === 0 || totalDelete.toFixed(2) !== total.toFixed(2)}
                >
                    Generar NC
                </Button>
                <Button disabled={loading} color="danger" onClick={toggle}>
                    Cerrar
                </Button>
            </ModalFooter>
        </Modal>
    );
};
export default ModalDevPart;
