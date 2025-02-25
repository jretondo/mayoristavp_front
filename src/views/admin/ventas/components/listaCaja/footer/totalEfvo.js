import React, { useEffect, useState } from 'react';
import {
    Button,
    Col,
    Form,
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
import UrlNodeServer from '../../../../../../api/NodeServer';
import axios from 'axios';
import moment from 'moment';
import formatMoney from '../../../../../../Function/NumberFormat';

const TotalEfvo = ({ listaCaja }) => {
    const [totalEfvo, setTotalEfvo] = useState(0);
    const [ptosVtaData, setPtoVtaData] = useState([]);
    const [modal, setModal] = useState(0);
    const [ptoVta, setPtoVta] = useState({ id: 0 });
    const [monto, setMonto] = useState(0);
    const [loading, setLoading] = useState(false);

    const getPv = async () => {
        setLoading(true);
        await axios
            .get(UrlNodeServer.ptosVtaDir.sub.saldosEfvo, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then((res) => {
                const respuesta = res.data;
                const status = parseInt(respuesta.status);
                if (status === 200) {
                    const ptoVtaData = respuesta.body;
                    const total = ptoVtaData.reduce((acc, item) => {
                        return acc + parseFloat(item.saldo_efvo);
                    }, 0);
                    console.log('total :>> ', total);
                    setTotalEfvo(total);
                    setPtoVtaData(ptoVtaData);
                } else {
                }
            })
            .catch((error) => {
                console.log('error :>> ', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const updateTotalEfvo = () => {
        switch (modal) {
            case 1:
                return monto;
            case 2:
                return totalEfvo - monto;
            case 3:
                return parseFloat(totalEfvo) + parseFloat(monto);
            default:
                return 0;
        }
    };

    const updateEfvo = async () => {
        setModal(0);
        setLoading(true);
        const data = {
            pvId: ptoVta.id,
            saldo: updateTotalEfvo(),
        };
        await axios
            .put(UrlNodeServer.ptosVtaDir.sub.saldosEfvo, data, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then((res) => {
                setModal(0);
                getPv();
            })
            .catch((error) => {
                console.log('error :>> ', error);
                setModal(0);
                getPv();
            })
            .finally(() => {
                setLoading(false);
                swal('Fondo Actualizado', '', 'success');
                setModal(0);
            });
    };

    useEffect(() => {
        getPv();
    }, [listaCaja]);

    useEffect(() => {
        setMonto(0);
    }, [modal]);

    return (
        <>
            {loading ? (
                <div style={{ textAlign: 'center' }}>
                    <Spinner type="border" color="blue" style={{ width: '1rem', height: '1rem' }} />{' '}
                </div>
            ) : (
                <div
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                    style={{ marginTop: '30px', border: '3px solid #ccc', padding: '10px' }}
                >
                    <h3>Efectivo de Caja al {moment(new Date()).format('DD/MM/YYYY')}</h3>
                    {ptosVtaData.map((item, index) => {
                        return (
                            <Row key={index}>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>{`${item.raz_soc} (PV: ${item.pv}):`}</Label>
                                        <Input type="text" value={'$ ' + formatMoney(item.saldo_efvo)} disabled />
                                    </FormGroup>
                                </Col>
                                <Col style={{ marginTop: '32px' }} md={6}>
                                    <Button
                                        color="danger"
                                        onClick={() => {
                                            setModal(1);
                                            setPtoVta(item);
                                        }}
                                    >
                                        Restablecer Fondo
                                    </Button>
                                    <Button
                                        color="info"
                                        onClick={() => {
                                            setModal(2);
                                            setPtoVta(item);
                                        }}
                                    >
                                        Retirar Efvo.
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            setModal(3);
                                            setPtoVta(item);
                                        }}
                                    >
                                        Agregar Efvo.
                                    </Button>
                                </Col>
                            </Row>
                        );
                    })}
                    <hr />
                    <Row key={ptosVtaData.length}>
                        <Col md={12}>
                            <FormGroup>
                                <Label style={{ fontWeight: 'bold', fontSize: '20px' }}>Total Efectivo:</Label>
                                <Input
                                    style={{ fontWeight: 'bold', fontSize: '20px' }}
                                    type="text"
                                    value={'$ ' + formatMoney(totalEfvo)}
                                    disabled
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Modal isOpen={modal !== 0} toggle={() => setModal(0)}>
                        <Form
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateEfvo();
                            }}
                            style={{ marginTop: '30px', border: '3px solid #ccc', padding: '10px' }}
                        >
                            <ModalHeader>
                                <h1>Actualizar Fondo</h1>
                            </ModalHeader>
                            <ModalBody>
                                {modal === 1 ? (
                                    <h3>Restablecer Fondo</h3>
                                ) : modal === 2 ? (
                                    <h3>Retirar Efectivo</h3>
                                ) : (
                                    <h3>Agregar Efectivo</h3>
                                )}
                                <Row>
                                    <Col md={12}>
                                        <FormGroup>
                                            <Label>{`${ptoVta.raz_soc} (PV: ${ptoVta.pv}):`}</Label>
                                            <Input type="text" value={'$ ' + formatMoney(ptoVta.saldo_efvo)} disabled />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <FormGroup>
                                            <Label>Monto:</Label>
                                            <Input
                                                type="number"
                                                value={monto}
                                                required
                                                min="0"
                                                onChange={(e) => {
                                                    setMonto(e.target.value);
                                                }}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col md={12}>
                                        <FormGroup>
                                            <Label>Total Caja:</Label>
                                            <Input value={'$ ' + formatMoney(updateTotalEfvo())} disabled type="text" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    onClick={() => {
                                        setModal(0);
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button color="primary" type="submit">
                                    Guardar
                                </Button>
                            </ModalFooter>
                        </Form>
                    </Modal>
                </div>
            )}
        </>
    );
};

export default TotalEfvo;
