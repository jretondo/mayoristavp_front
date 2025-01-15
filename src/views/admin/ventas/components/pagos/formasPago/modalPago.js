import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import swal from 'sweetalert';
import ModalChange from './modalChange';
import ListadoTable from '../../../../../../components/subComponents/Listados/ListadoTable';
import UrlNodeServer from '../../../../../../api/NodeServer';
import axios from 'axios';
import FilaCheque from './filaCheque';

const ModalPago = ({ modal, toggle, setVariosPagos, variosPagos }) => {
    const [pago, setPago] = useState({
        tipo: 0,
        tipo_txt: 'Efectivo',
        importe: 0,
        fecha_emision: '',
        fecha_vencimiento: '',
        banco: '',
        nro_cheque: '',
        notas: '',
        id_cheque: false,
    });
    const [changeModal, setChangeModal] = useState(false);
    const [chequeBuscado, setChequeBuscado] = useState('');
    const [cheques, setCheques] = useState([]);

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

        setVariosPagos((variosPagos) => [
            ...variosPagos,
            {
                tipo: pago.tipo,
                tipo_txt: pago.tipo_txt,
                importe: parseFloat(pago.importe),
                fecha_emision: pago.fecha_emision,
                fecha_vencimiento: pago.fecha_vencimiento,
                banco: pago.banco,
                nro_cheque: pago.nro_cheque,
                notas: pago.notas,
            },
        ]);

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

    const listarCheques = async () => {
        await axios
            .get(UrlNodeServer.chequesDir.cheques + '/1', {
                params: {
                    search: chequeBuscado,
                    cantPerPage: 15,
                    estado: 0,
                },
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then((res) => {
                const response = res.data;
                const status = response.status;
                if (status === 200) {
                    setCheques(response.body.data);
                } else {
                    setCheques([]);
                }
            })
            .catch((err) => {
                console.log('err :>> ', err);
            });
    };

    const nvoCheque = (cheque) => {
        setVariosPagos((variosPagos) => [
            ...variosPagos,
            {
                tipo: 6,
                tipo_txt: 'Cheque',
                importe: parseFloat(cheque.importe),
                fecha_emision: cheque.fecha_emision,
                fecha_vencimiento: cheque.fecha_vencimiento,
                banco: cheque.banco,
                nro_cheque: cheque.nro_cheque,
                id_cheque: cheque.id,
                notas: pago.notas,
            },
        ]);
        document.getElementById('bancoTxt').focus();
    };

    const quitarCheque = (id) => {
        let nvaList = [];
        variosPagos.map((item, key) => {
            if (parseInt(item.id_cheque) !== parseInt(id)) {
                nvaList.push(item);
            }
            if (key === variosPagos.length - 1) {
                console.log('nvaList :>> ', nvaList);
                setVariosPagos(() => nvaList);
            }
        });
    };

    useEffect(() => {
        modal &&
            setTimeout(() => {
                document.getElementById('formaPagoModal')?.focus();
            }, 300);
        modal && listarCheques();
    }, [modal]);

    useEffect(() => {
        listarCheques();
    }, [chequeBuscado]);

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
                                            <option value={6}>Cheque</option>
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
                        {parseInt(pago.tipo) === 0 ? (
                            <Col md={6}>
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
                        ) : null}
                        {parseInt(pago.tipo) === 6 ? (
                            <>
                                <Col md="8">
                                    <FormGroup>
                                        <Label for="bancoTxt">Buscar Cheque</Label>
                                        <Input
                                            type="text"
                                            value={chequeBuscado}
                                            id="bancoTxt"
                                            onChange={(e) => {
                                                setChequeBuscado(e.target.value);
                                            }}
                                        />
                                    </FormGroup>
                                </Col>
                            </>
                        ) : null}
                    </Row>
                    {parseInt(pago.tipo) === 6 ? (
                        <Row>
                            <ListadoTable
                                titulos={['Nro. Cheque', 'Banco', 'Fecha Vencimiento', 'Importe', '']}
                                listado={cheques.map((cheque) => {
                                    return (
                                        <FilaCheque
                                            key={cheque.id}
                                            cheque={cheque}
                                            nvoCheque={nvoCheque}
                                            variosPagos={variosPagos}
                                            quitarCheque={quitarCheque}
                                        />
                                    );
                                })}
                            />
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
