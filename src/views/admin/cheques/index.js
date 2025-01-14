import React, { useState, useEffect } from 'react';
import { Container, Spinner, Row, Col, Card, CardHeader, CardFooter, FormGroup, Label, Input } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import UrlNodeServer from '../../../api/NodeServer';
import Header from 'components/Headers/Header.js';
import Paginacion from 'components/subComponents/Paginacion/Paginacion';
import BusquedaForm from 'components/subComponents/Productos/BusquedaForm';
import ListadoTable from 'components/subComponents/Listados/ListadoTable';
import { UseSecureRoutes } from 'Hooks/UseSecureRoutes';
import axios from 'axios';
import FilaCheque from './filaCheque';

const titulos = ['Nº', 'Banco', 'Emisión', 'Cobro', 'Importe', 'Estado', ''];

const ChequesModule = () => {
    //Loadings
    const [esperar, setEsperar] = useState(false);

    //Search word
    const [busquedaBool, setBusquedaBool] = useState(false);
    const [palabraBuscada, setPalabraBuscada] = useState('');
    const [estado, setEstado] = useState(false);

    //lists and UseFetch
    const [call, setCall] = useState(false);
    const [pagina, setPagina] = useState(1);
    const [ultimaPag, setUltimaPag] = useState(0);
    const [plantPaginas, setPlantPaginas] = useState(<></>);
    const [listado, setListado] = useState([]);
    const [dataList, setDataList] = useState([]);

    const { loading, error } = UseSecureRoutes(UrlNodeServer.routesDir.sub.proveedores, call);

    useEffect(() => {
        setCall(!call);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        listaCheques();
        // eslint-disable-next-line
    }, [call, pagina, estado]);

    const listaCheques = async () => {
        setEsperar(true);
        await axios
            .get(UrlNodeServer.chequesDir.cheques + '/' + pagina, {
                params: {
                    search: palabraBuscada,
                    estado: estado,
                },
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then((res) => {
                const respuesta = res.data;
                const status = parseInt(respuesta.status);
                if (status === 200) {
                    const body = respuesta.body;
                    setDataList(body.pagesObj);
                    setUltimaPag(body.pagesObj.totalPag);
                    if (parseInt(body.pagesObj.totalPag) > 0) {
                        setListado(
                            body.data.map((item, key) => {
                                let primero;
                                if (key === 0) {
                                    primero = true;
                                } else {
                                    primero = false;
                                }
                                return <FilaCheque key={key} id={key} cheque={item} toggle={() => setCall(!call)} />;
                            }),
                        );
                    } else {
                        setUltimaPag(1);
                        setListado(
                            <tr style={{ textAlign: 'center', width: '100%' }}>
                                <td>
                                    <span style={{ textAlign: 'center', marginRight: 'auto', marginLeft: 'auto' }}>
                                        No hay cheques cargados con esos filtros
                                    </span>
                                </td>
                            </tr>,
                        );
                    }
                } else {
                    setUltimaPag(1);
                    setListado(
                        <tr style={{ textAlign: 'center', width: '100%' }}>
                            <td>
                                <span style={{ textAlign: 'center', marginRight: 'auto', marginLeft: 'auto' }}>
                                    No hay cheques cargados con esos filtros
                                </span>
                            </td>
                        </tr>,
                    );
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setEsperar(false);
            });
    };

    if (error) {
        return <Redirect className="text-light" to={process.env.PUBLIC_URL + '/'} />;
    } else if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <Spinner type="grow" color="primary" style={{ width: '100px', height: '100px' }} />
            </div>
        );
    } else {
        return (
            <>
                <Header />
                <Container className="mt--7" fluid>
                    {esperar ? (
                        <div style={{ textAlign: 'center', marginTop: '100px' }}>
                            <Spinner type="grow" color="primary" style={{ width: '100px', height: '100px' }} />{' '}
                        </div>
                    ) : (
                        <>
                            <Row>
                                <Col>
                                    <Card className="shadow">
                                        <CardHeader className="border-0">
                                            <Row>
                                                <Col md="3">
                                                    <h2 className="mb-0">Lista de Cheques</h2>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup>
                                                        <Input
                                                            type="select"
                                                            name="select"
                                                            id="exampleSelect"
                                                            onChange={(e) => setEstado(e.target.value)}
                                                            value={estado}
                                                        >
                                                            <option value={false}>Todos</option>
                                                            <option value={'0'}>Pendiente de Cobro</option>
                                                            <option value={'1'}>Cobrado</option>
                                                            <option value={'2'}>Rechazado</option>
                                                            <option value={'3'}>Vencido</option>
                                                            <option value={'4'}>Usado como forma de pago</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                                <Col md="5" style={{ textAlign: 'right' }}>
                                                    <BusquedaForm
                                                        busquedaBool={busquedaBool}
                                                        setPalabraBuscada={setPalabraBuscada}
                                                        palabraBuscada={palabraBuscada}
                                                        setBusquedaBool={setBusquedaBool}
                                                        call={call}
                                                        setCall={setCall}
                                                        titulo="Buscar un cheque"
                                                    />
                                                </Col>
                                            </Row>
                                        </CardHeader>

                                        <ListadoTable listado={listado} titulos={titulos} />
                                        <CardFooter className="py-4">
                                            <Paginacion
                                                setPagina={setPagina}
                                                setCall={setCall}
                                                pagina={pagina}
                                                call={call}
                                                plantPaginas={plantPaginas}
                                                ultimaPag={ultimaPag}
                                                data={dataList}
                                                setPlantPaginas={setPlantPaginas}
                                                setUltimaPag={setUltimaPag}
                                            />
                                        </CardFooter>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </Container>
            </>
        );
    }
};

export default ChequesModule;
