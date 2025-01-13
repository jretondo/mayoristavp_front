import React, { useState, useEffect } from 'react';
import { Container, Spinner, Row, Col, Card, CardHeader, CardFooter } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import UrlNodeServer from '../../../api/NodeServer';

//My modules
import AlertaForm from 'components/subComponents/Alertas/Alerta1';
import Header from 'components/Headers/Header.js';
import Paginacion from 'components/subComponents/Paginacion/Paginacion';
import BusquedaForm from 'components/subComponents/Productos/BusquedaForm';
import ListadoTable from 'components/subComponents/Listados/ListadoTable';
import { UseSecureRoutes } from 'Hooks/UseSecureRoutes';
import { useActividad } from '../../../Hooks/UseNvaActividad';

const titulos = ['Nº', 'Banco', 'Emisión', 'Vencimiento', 'Importe', ''];

const ChequesModule = () => {
    //user massages
    const [alertar, setAlertar] = useState(false);
    const [msgStrongAlert, setMsgStrong] = useState('');
    const [msgGralAlert, setMsgGralAlert] = useState('');
    const [successAlert, setSuccessAlert] = useState(false);

    //Activities
    const [nvaActCall, setNvaActCall] = useState(false);
    const [actividadStr, setActividadStr] = useState('');

    //Loadings
    const [esperar, setEsperar] = useState(false);

    //Search word
    const [busquedaBool, setBusquedaBool] = useState(false);
    const [palabraBuscada, setPalabraBuscada] = useState('');

    //lists and UseFetch
    const [call, setCall] = useState(false);
    const [pagina, setPagina] = useState(1);
    const [ultimaPag, setUltimaPag] = useState(0);
    const [plantPaginas, setPlantPaginas] = useState(<></>);
    const [listado, setListado] = useState([]);
    const [dataList, setDataList] = useState([]);

    //Custom Hooks
    useActividad(nvaActCall, actividadStr);

    const { loading, error } = UseSecureRoutes(UrlNodeServer.routesDir.sub.proveedores, call);

    useEffect(() => {
        setCall(!call);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        listaCheques();
        // eslint-disable-next-line
    }, [call, pagina]);

    const listaCheques = async () => {};

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
                <AlertaForm
                    success={successAlert}
                    msgStrong={msgStrongAlert}
                    msgGral={msgGralAlert}
                    alertar={alertar}
                />
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
                                                <Col md="4">
                                                    <h2 className="mb-0">Lista de Cheques</h2>
                                                </Col>
                                                <Col md="8" style={{ textAlign: 'right' }}>
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
