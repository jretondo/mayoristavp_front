import React, { useEffect, useState } from 'react';
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Row, Spinner } from 'reactstrap';
import UrlNodeServer from '../../../../../../../api/NodeServer';
import axios from 'axios';

const NewProviderForm = ({ isValid, setIsValid, setPostToggled, toggleProvedor, setProvedor, toggle }) => {
    const [isWaiting, setIsWaiting] = useState(false);
    const [newProvider, setNewProvider] = useState({
        cuit: 0,
        ndoc: '',
        razsoc: '',
        telefono: '',
        email: '',
        cond_iva: 0,
        fantasia: '',
        obs: '',
    });

    const newProviderPost = async (e) => {
        console.log('post');
        e && e.preventDefault();
        if (!isValid) {
            await swal('Error', 'Complete los campos requeridos', 'error');
            return;
        }
        setIsWaiting(true);
        await axios
            .post(UrlNodeServer.proveedoresDir.proveedores, newProvider, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then(async (res) => {
                const respuesta = res.data;
                const status = parseInt(respuesta.status);
                const id = respuesta.body.insertId;
                await setProvedor({ id, ...newProvider });
                if (status === 200) {
                    await swal('Provedor Agregado', 'El Provedor fue agregado correctamente', 'success');
                } else {
                    await swal('Error', 'No se pudo agregar el Provedor, intente nuevamente', 'error');
                }
            })
            .catch(async (err) => {
                console.log(err);
                await swal('Error', 'No se pudo agregar el Provedor, intente nuevamente', 'error');
            })
            .finally(() => {
                setNewProvider({
                    cuit: 0,
                    ndoc: '',
                    razsoc: '',
                    telefono: '',
                    email: '',
                    cond_iva: 0,
                    fantasia: '',
                    obs: '',
                });
                setPostToggled(false);
                setIsWaiting(false);
                toggleProvedor();
                toggle();
            });
    };

    useEffect(() => {
        if (newProvider.razsoc !== '' && newProvider.ndoc !== 0) {
            console.log('valido');
            setIsValid(true);
        } else {
            console.log('invalido');
            setIsValid(false);
        }
    }, [newProvider.razsoc, newProvider.ndoc]);

    if (isWaiting) {
        return (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Spinner type="grow" color="primary" style={{ width: '70px', height: '70px' }} />
            </div>
        );
    }

    return (
        <Form id="newProviderForm" onSubmit={newProviderPost}>
            <h6 className="heading-small text-muted mb-4">Información del Proveedor</h6>
            <Row>
                <Col lg="8">
                    <FormGroup>
                        <label className="form-control-label" htmlFor="input-username">
                            Razón Social
                        </label>
                        <Input
                            className="form-control-alternative"
                            id="input-username"
                            placeholder="Razón Social..."
                            type="text"
                            value={newProvider.razsoc}
                            onChange={(e) => setNewProvider({ ...newProvider, razsoc: e.target.value })}
                            required
                        />
                    </FormGroup>
                </Col>
                <Col lg="4">
                    <FormGroup>
                        <label className="form-control-label" htmlFor="input-username">
                            Nombre de Fantasía
                        </label>
                        <Input
                            className="form-control-alternative"
                            id="input-username"
                            placeholder="Nombre de Fantasía..."
                            type="text"
                            value={newProvider.fantasia}
                            onChange={(e) => setNewProvider({ ...newProvider, fantasia: e.target.value })}
                            required
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col lg="2">
                    <FormGroup>
                        <Label for="exampleSelect">Tipo. Doc.</Label>
                        <Input
                            type="select"
                            onChange={(e) => setNewProvider({ ...newProvider, cuit: e.target.value })}
                            value={newProvider.cuit}
                        >
                            <option value={0}>CUIT</option>
                            <option value={1}>DNI</option>
                        </Input>
                    </FormGroup>
                </Col>
                <Col lg="6">
                    <FormGroup>
                        <label className="form-control-label" htmlFor="input-username">
                            {parseInt(newProvider.cuit) === 0 ? 'Nº de CUIT' : 'Nº de DNI'}
                        </label>
                        <Input
                            className="form-control-alternative"
                            id="input-username"
                            type="text"
                            minLength={parseInt(newProvider.cuit) === 0 ? 11 : 6}
                            maxLength={parseInt(newProvider.cuit) === 0 ? 11 : 8}
                            value={newProvider.ndoc}
                            onKeyPress={(e) => {
                                if ('0123456789'.includes(e.key) === false) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => setNewProvider({ ...newProvider, ndoc: e.target.value })}
                            required
                            invalid={
                                newProvider.ndoc.length > 0 &&
                                newProvider.ndoc.length < (parseInt(newProvider.cuit) === 0 ? 11 : 6)
                            }
                        />
                        <FormFeedback>No es número valido!</FormFeedback>
                    </FormGroup>
                </Col>
                <Col lg="4">
                    <FormGroup>
                        <Label for="exampleSelect">Cond. IVA</Label>
                        <Input
                            type="select"
                            onChange={(e) => setNewProvider({ ...newProvider, cond_iva: e.target.value })}
                            value={newProvider.cond_iva}
                        >
                            <option value={0}>Cons. Final</option>
                            {parseInt(newProvider.cuit) == 0 ? (
                                <>
                                    {' '}
                                    <option value={1}>Res. Inscripto</option>
                                    <option value={4}>Exento</option>
                                    <option value={6}>Monotributista</option>
                                </>
                            ) : null}
                        </Input>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col lg="8">
                    <FormGroup>
                        <label className="form-control-label" htmlFor="input-username">
                            Email
                        </label>
                        <Input
                            className="form-control-alternative"
                            id="input-username"
                            placeholder="Casilla de email..."
                            type="email"
                            value={newProvider.email}
                            onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                        />
                    </FormGroup>
                </Col>
                <Col lg="4">
                    <FormGroup>
                        <label className="form-control-label" htmlFor="input-username">
                            Telefóno
                        </label>
                        <Input
                            className="form-control-alternative"
                            id="input-username"
                            placeholder="Telefóno..."
                            type="text"
                            value={newProvider.telefono}
                            onChange={(e) => setNewProvider({ ...newProvider, telefono: e.target.value })}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Button style={{ display: 'none' }} type="submit"></Button>
        </Form>
    );
};

export default NewProviderForm;
