import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row,
    Spinner,
} from 'reactstrap';
import UrlNodeServer from '../../../api/NodeServer';

const ClientForm = ({ client, toggle, isFormOpen }) => {
    const clientDefault = {
        id: null,
        cuit: 0,
        ndoc: '',
        razsoc: '',
        telefono: '',
        email: '',
        cond_iva: 0,
        direccion: '',
        entrega: '',
        provincia: '',
        localidad: '',
    };
    const [isWaiting, setIsWaiting] = useState(false);
    const [newClient, setNewClient] = useState(client ? client : clientDefault);

    const clientPost = async (e) => {
        console.log('post');
        e && e.preventDefault();
        setIsWaiting(true);
        await axios
            .post(UrlNodeServer.clientesDir.clientes, newClient, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then(async (res) => {
                const respuesta = res.data;
                const status = parseInt(respuesta.status);
                if (status === 200) {
                    client
                        ? await swal('Cliente actualizado con éxito!', '', 'success')
                        : await swal('Cliente agregado con éxito!', '', 'success');
                } else {
                    client
                        ? await swal('Error', 'No se pudo actualizar el cliente, intente nuevamente', 'error')
                        : await swal('Error', 'No se pudo agregar el cliente, intente nuevamente', 'error');
                }
            })
            .catch(async (err) => {
                console.log(err);
                client
                    ? await swal('Error', 'No se pudo actualizar el cliente, intente nuevamente', 'error')
                    : await swal('Error', 'No se pudo agregar el cliente, intente nuevamente', 'error');
            })
            .finally(() => {
                setNewClient(clientDefault);
                setIsWaiting(false);
                toggle();
            });
    };

    useEffect(() => {
        if (isFormOpen) {
            setNewClient(client ? client : clientDefault);
        }
    }, [isFormOpen]);

    if (isWaiting) {
        return (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Spinner type="grow" color="primary" style={{ width: '70px', height: '70px' }} />
            </div>
        );
    }

    return (
        <Card className="bg-secondary shadow">
            <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                    <Col xs="9">
                        {client ? <h3 className="mb-0">{client.name}</h3> : <h3 className="mb-0">Nuevo Cliente</h3>}
                    </Col>
                    <Col xs="3" style={{ textAlign: 'right' }}>
                        <button className="btn btn-danger" onClick={() => toggle()}>
                            {' '}
                            x
                        </button>
                    </Col>
                </Row>
            </CardHeader>
            <CardBody>
                <Form id="newClientForm" onSubmit={clientPost}>
                    <h6 className="heading-small text-muted mb-4">Información del Cliente</h6>
                    <Row>
                        <Col lg="12">
                            <FormGroup>
                                <label className="form-control-label" htmlFor="input-username">
                                    Razón Social
                                </label>
                                <Input
                                    className="form-control-alternative"
                                    id="input-username"
                                    placeholder="Razón Social..."
                                    type="text"
                                    value={newClient.razsoc}
                                    onChange={(e) => setNewClient({ ...newClient, razsoc: e.target.value })}
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
                                    onChange={(e) => setNewClient({ ...newClient, cuit: e.target.value })}
                                    value={newClient.cuit}
                                >
                                    <option value={0}>CUIT</option>
                                    <option value={1}>DNI</option>
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col lg="6">
                            <FormGroup>
                                <label className="form-control-label" htmlFor="input-username">
                                    {parseInt(newClient.cuit) === 0 ? 'Nº de CUIT' : 'Nº de DNI'}
                                </label>
                                <Input
                                    className="form-control-alternative"
                                    id="input-username"
                                    type="text"
                                    minLength={parseInt(newClient.cuit) === 0 ? 11 : 6}
                                    maxLength={parseInt(newClient.cuit) === 0 ? 11 : 8}
                                    value={newClient.ndoc}
                                    onKeyPress={(e) => {
                                        if ('0123456789'.includes(e.key) === false) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onChange={(e) => setNewClient({ ...newClient, ndoc: e.target.value })}
                                    required
                                    invalid={
                                        newClient.ndoc.length > 0 &&
                                        newClient.ndoc.length < (parseInt(newClient.cuit) === 0 ? 11 : 6)
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
                                    onChange={(e) => setNewClient({ ...newClient, cond_iva: e.target.value })}
                                    value={newClient.cond_iva}
                                >
                                    <option value={0}>Cons. Final</option>
                                    {parseInt(newClient.cuit) == 0 ? (
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
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
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
                                    value={newClient.telefono}
                                    onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <FormGroup>
                                <label className="form-control-label" htmlFor="input-username">
                                    Direccion Fiscal
                                </label>
                                <Input
                                    className="form-control-alternative"
                                    placeholder="Direccion..."
                                    type="text"
                                    value={newClient.direccion}
                                    onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="6">
                            <FormGroup>
                                <label className="form-control-label" htmlFor="input-username">
                                    Direccion de Entrega
                                </label>
                                <Input
                                    className="form-control-alternative"
                                    placeholder="Direccion..."
                                    type="text"
                                    value={newClient.entrega}
                                    onChange={(e) => setNewClient({ ...newClient, entrega: e.target.value })}
                                    required
                                />
                            </FormGroup>
                        </Col>
                        <Col lg="3">
                            <FormGroup>
                                <label className="form-control-label" htmlFor="input-username">
                                    Provincia
                                </label>
                                <Input
                                    className="form-control-alternative"
                                    placeholder="Provincia..."
                                    type="text"
                                    value={newClient.provincia}
                                    onChange={(e) => setNewClient({ ...newClient, provincia: e.target.value })}
                                    required
                                />
                            </FormGroup>
                        </Col>
                        <Col lg="3">
                            <FormGroup>
                                <label className="form-control-label" htmlFor="input-username">
                                    Localidad
                                </label>
                                <Input
                                    className="form-control-alternative"
                                    placeholder="Localidad..."
                                    type="text"
                                    value={newClient.localidad}
                                    onChange={(e) => setNewClient({ ...newClient, localidad: e.target.value })}
                                    required
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Button color="success" type="submit">
                                Guardar
                            </Button>
                            <Button color="danger" onClick={toggle}>
                                Cancelar
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        </Card>
    );
};

export default ClientForm;
