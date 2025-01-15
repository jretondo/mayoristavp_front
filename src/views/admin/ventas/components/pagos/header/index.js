import UrlNodeServer from '../../../../../../api/NodeServer';
import axios from 'axios';
import CompleteCerosLeft from 'Function/CompleteCeroLeft';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import PtosVtas from './ptosVta';
import Form from 'reactstrap/lib/Form';
import ProvedorModal from './providerModal/index';

const InvoiceHeader = ({
    setPtoVta,
    setProvedorBool,
    setEmailProvedor,
    setEnvioEmailBool,
    proveedorBool,
    envioEmailBool,
    emailProvedor,
    ptoVta,
    setValidPV,
    provedor,
    setProvedor,
    userId,
    setUserId,
}) => {
    const [ptoVtaList, setPtoVtaList] = useState(<option>No hay puntos de venta relacionados</option>);
    const [cbteStr, setCbteStr] = useState('');
    const [nroCbte, setNroCbte] = useState(0);
    const [ProvedorModalIsOpen, setProvedorModalIsOpen] = useState(false);
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
        let query = `?pvId=${ptoVta.id}&fiscal=&tipo=-2&entorno=`;

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
    }, [ptoVta.id]);

    useEffect(() => {
        lastInvoice();
    }, [ptoVta, lastInvoice]);

    useEffect(() => {
        FormatearNroCte();
    }, [nroCbte, ptoVta, FormatearNroCte]);

    useEffect(() => {
        isAdmin && getUsers();
    }, []);

    return (
        <>
            <ProvedorModal
                Provedor={provedor}
                setProvedor={setProvedor}
                isOpen={ProvedorModalIsOpen}
                toggle={() => setProvedorModalIsOpen(!ProvedorModalIsOpen)}
            />
            <Form>
                <Row>
                    <Col style={{ border: '2px solid red', padding: '15px', margin: 0 }}>
                        <Row>
                            <Col md="3">
                                <FormGroup>
                                    <Label for="exampleEmail">Fecha</Label>
                                    <Input type="date" value={moment(new Date()).format('YYYY-MM-DD')} disabled />
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
                            <Col md="3">
                                <Label for="exampleEmail">Nº Comprobante</Label>
                                <FormGroup>
                                    <Input type="text" id="exampleSelect" value={'OP | ' + cbteStr} disabled />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="3">
                                <FormGroup>
                                    <Label for="tipoProvedorTxt">Provedor</Label>
                                    <Input
                                        onChange={(e) => setProvedorBool(e.target.value)}
                                        value={proveedorBool}
                                        type="select"
                                        id="tipoProvedorTxt"
                                    >
                                        <option value={0}>Consumidor Final</option>
                                        <option value={1}>Provedor Identificado</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            {parseInt(proveedorBool) === 1 ? (
                                <>
                                    {provedor ? (
                                        <>
                                            <Col md="7">
                                                <FormGroup>
                                                    <Input
                                                        style={{ fontSize: '0.8em', marginTop: '30px' }}
                                                        value={`${provedor.razsoc} (${
                                                            parseInt(provedor.cuit) === 0
                                                                ? 'CUIT ' + provedor.ndoc
                                                                : 'DNI ' + provedor.ndoc
                                                        })${` | Tel.: ${provedor.telefono} Email: ${provedor.email}`}`}
                                                        disabled
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md="1">
                                                <Button
                                                    style={{ marginTop: '30px' }}
                                                    color="success"
                                                    onClick={() => setProvedorModalIsOpen(!ProvedorModalIsOpen)}
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
                                                onClick={() => setProvedorModalIsOpen(!ProvedorModalIsOpen)}
                                            >
                                                Seleccionar Provedor
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
                                    <Label for="razSocTxt">Email Provedor</Label>
                                    <FormGroup>
                                        <Input
                                            type="text"
                                            id="razSocTxt"
                                            value={emailProvedor}
                                            onChange={(e) => setEmailProvedor(e.target.value)}
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