import React from 'react';
import { Button, Col, Form, Input, Row } from 'reactstrap';

const AdvancedSearch = ({
    advancedSearch,
    setAdvancedSearch,
    productoBuscado,
    setProductoBuscado,
    marcaBuscada,
    setMarcaBuscada,
    proveedorBuscado,
    setProveedorBuscado,
    ListarProductos,
    familiaBuscada,
    setFamiliaBuscada,
}) => {
    return (
        <Form
            onSubmit={(e) => {
                e.preventDefault();
                ListarProductos();
            }}
        >
            <Row>
                <Col md="8">
                    <Row>
                        <Col md="12">
                            <Input
                                placeholder="Nombre del producto..."
                                value={productoBuscado}
                                onChange={(e) => setProductoBuscado(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-1">
                        <Col md="4">
                            <Input
                                placeholder="Proveedor..."
                                value={proveedorBuscado}
                                onChange={(e) => setProveedorBuscado(e.target.value)}
                            />
                        </Col>
                        <Col md="4">
                            <Input
                                placeholder="Marca..."
                                value={marcaBuscada}
                                onChange={(e) => setMarcaBuscada(e.target.value)}
                            />
                        </Col>
                        <Col md="4">
                            <Input
                                placeholder="Familia..."
                                value={familiaBuscada}
                                onChange={(e) => setFamiliaBuscada(e.target.value)}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col md="2" style={{ textAlign: 'left' }}>
                    <Button style={{ height: '100%' }} color="primary" type="submit">
                        Buscar
                    </Button>
                </Col>
                <Col md="2" style={{ textAlign: 'right' }}>
                    <Button
                        color="primary"
                        onClick={(e) => {
                            e.preventDefault();
                            setAdvancedSearch(!advancedSearch);
                        }}
                    >
                        Busqueda Rápida
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default AdvancedSearch;
