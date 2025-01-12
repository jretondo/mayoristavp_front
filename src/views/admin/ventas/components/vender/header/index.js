import UrlNodeServer from '../../../../../../api/NodeServer';
import axios from 'axios';
import CompleteCerosLeft from 'Function/CompleteCeroLeft';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import PtosVtas from './ptosVta';
import Form from 'reactstrap/lib/Form';
import ClienteModal from './clienteModal/index';

const InvoiceHeader = ({
    setPtoVta,
    setFactFiscBool,
    setClienteBool,
    setEmailCliente,
    setEnvioEmailBool,
    factFiscBool,
    clienteBool,
    envioEmailBool,
    emailCliente,
    ptoVta,
    tfact,
    setTfact,
    setValidPV,
    cliente,
    setCliente,
    userId,
    setUserId,
}) => {
    const [ptoVtaList, setPtoVtaList] = useState(<option>No hay puntos de venta relacionados</option>);
    const [cbteStr, setCbteStr] = useState('');
    const [nroCbte, setNroCbte] = useState(0);
    const [clienteModalIsOpen, setClienteModalIsOpen] = useState(false);
    const [users, setUsers] = useState([]);

    const isAdmin = localStorage.getItem('isAdmin');

    const FormatearNroCte = useCallback(async () => {
        const cbte = await CompleteCerosLeft(nroCbte, 8);
        const pv = await CompleteCerosLeft(ptoVta.pv, 5);
        setCbteStr(pv + '-' + cbte);
    }, [nroCbte, ptoVta.pv]);

    const getUsers = useCallback(async () => {
        try {
            const response = await axios.get(UrlNodeServer.usuariosDir.usuarios, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            });
            const data = response.data.body.data;
            setUsers(data);
        } catch (error) {}
    });

    const lastInvoice = useCallback(async () => {
        let fiscalBool = 'true';
        if (parseInt(factFiscBool) === 0) {
            fiscalBool = '';
        }
        let query = `?pvId=${ptoVta.id}&fiscal=${fiscalBool}&tipo=${tfact}&entorno=`;

        await axios
            .get(UrlNodeServer.invoicesDir.sub.last + query, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then((res) => {
                const response = res.data;
                const status = response.status;
                if (status === 200) {
                    setNroCbte(parseInt(response.body.lastInvoice) + 1);
                } else {
                    setNroCbte(1);
                }
            })
            .catch(() => {
                setNroCbte(1);
            });
    }, [ptoVta.id, factFiscBool, tfact]);

    useEffect(() => {
        lastInvoice();
    }, [ptoVta, factFiscBool, lastInvoice]);

    useEffect(() => {
        FormatearNroCte();
    }, [nroCbte, ptoVta, FormatearNroCte]);

    useEffect(() => {
        isAdmin && getUsers();
    }, []);

    return (
        <>
            <ClienteModal
                cliente={cliente}
                setCliente={setCliente}
                isOpen={clienteModalIsOpen}
                toggle={() => setClienteModalIsOpen(!clienteModalIsOpen)}
            />
            <Form>
                <Row>
                    <Col style={{ border: '2px solid red', padding: '15px', margin: 0 }}>
                        <Row>
                            <Col md="8">
                                <Row>
                                    <Col md="4">
                                        <FormGroup>
                                            <Label for="exampleEmail">Fecha</Label>
                                            <Input
                                                type="date"
                                                value={moment(new Date()).format('YYYY-MM-DD')}
                                                disabled
                                            />
                                        </FormGroup>
                                    </Col>
                                    <PtosVtas
                                        setPtoVta={setPtoVta}
                                        setPtoVtaList={setPtoVtaList}
                                        ptoVtaList={ptoVtaList}
                                        ptoVta={ptoVta}
                                        colSize={6}
                                        setValidPV={setValidPV}
                                    />
                                    <Col md="2">
                                        <FormGroup>
                                            <Label for="factFiscTxt">Fiscal</Label>
                                            <Input
                                                type="select"
                                                id="factFiscTxt"
                                                value={factFiscBool}
                                                onChange={(e) => setFactFiscBool(e.target.value)}
                                            >
                                                <option value={0}>No</option>
                                                {ptoVta.cond_iva === 0 ? null : <option value={1}>Si</option>}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md="4">
                                <Row>
                                    <Col md="4">
                                        <FormGroup>
                                            <Label for="factFiscTxt">T. Fact.</Label>
                                            <Input
                                                type="select"
                                                id="factFiscTxt"
                                                value={tfact}
                                                onChange={(e) => setTfact(e.target.value)}
                                            >
                                                {parseInt(factFiscBool) === 1 ? (
                                                    ptoVta.cond_iva === 0 ? (
                                                        <option value={0}>X</option>
                                                    ) : ptoVta.cond_iva === 1 ? (
                                                        parseInt(clienteBool) === 1 ? (
                                                            <>
                                                                <option value={1}>A</option>
                                                                <option value={6}>B</option>
                                                            </>
                                                        ) : (
                                                            <option value={6}>B</option>
                                                        )
                                                    ) : (
                                                        <option value={11}>C</option>
                                                    )
                                                ) : (
                                                    <option value={0}>X</option>
                                                )}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="8">
                                        <Label for="exampleEmail">Nº Comprobante</Label>
                                        <FormGroup>
                                            <Input type="text" id="exampleSelect" value={cbteStr} disabled />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="3">
                                <FormGroup>
                                    <Label for="tipoClienteTxt">Cliente</Label>
                                    <Input
                                        onChange={(e) => setClienteBool(e.target.value)}
                                        value={clienteBool}
                                        type="select"
                                        id="tipoClienteTxt"
                                    >
                                        <option value={0}>Consumidor Final</option>
                                        <option value={1}>Cliente Identificado</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            {parseInt(clienteBool) === 1 ? (
                                <>
                                    {cliente ? (
                                        <>
                                            <Col md="7">
                                                <FormGroup>
                                                    <Label for="ndocTxt">Cliente</Label>
                                                    <Input
                                                        style={{ fontSize: '0.8em' }}
                                                        value={`${cliente.razsoc} (${
                                                            parseInt(cliente.cuit) === 0
                                                                ? 'CUIT ' + cliente.ndoc
                                                                : 'DNI ' + cliente.ndoc
                                                        })${
                                                            cliente.entrega === null
                                                                ? ''
                                                                : ` | ${cliente.entrega}, ${cliente.provincia}, ${cliente.localidad}`
                                                        }`}
                                                        disabled
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md="1">
                                                <Button
                                                    style={{ marginTop: '30px' }}
                                                    color="success"
                                                    onClick={() => setClienteModalIsOpen(!clienteModalIsOpen)}
                                                >
                                                    Cambiar
                                                </Button>
                                            </Col>
                                        </>
                                    ) : (
                                        <Col md="4">
                                            <Button
                                                style={{ marginTop: '30px' }}
                                                color="success"
                                                onClick={() => setClienteModalIsOpen(!clienteModalIsOpen)}
                                            >
                                                Seleccionar Cliente
                                            </Button>
                                        </Col>
                                    )}
                                </>
                            ) : (
                                <> </>
                            )}
                        </Row>
                        <Row>
                            {isAdmin && (
                                <Col md="3">
                                    <FormGroup>
                                        <Label for="factFiscTxt">Vendedor</Label>
                                        <Input
                                            type="select"
                                            value={userId}
                                            id="factFiscTxt"
                                            onChange={(e) => setUserId(e.target.value)}
                                        >
                                            <option value={false}>-</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.nombre} {user.apellido}
                                                </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                </Col>
                            )}
                            <Col md="2">
                                <Label for="factFiscTxt">Envíar Factura</Label>
                                <Input
                                    type="select"
                                    value={envioEmailBool}
                                    id="factFiscTxt"
                                    onChange={(e) => setEnvioEmailBool(e.target.value)}
                                >
                                    <option value={0}>No</option>
                                    <option value={1}>Si</option>
                                </Input>
                            </Col>
                            {parseInt(envioEmailBool) === 1 ? (
                                <Col md="4">
                                    <Label for="razSocTxt">Email Cliente</Label>
                                    <FormGroup>
                                        <Input
                                            type="text"
                                            id="razSocTxt"
                                            value={emailCliente}
                                            onChange={(e) => setEmailCliente(e.target.value)}
                                        />
                                    </FormGroup>
                                </Col>
                            ) : (
                                <></>
                            )}
                        </Row>
                    </Col>
                </Row>
            </Form>
        </>
    );
};

export default InvoiceHeader;
