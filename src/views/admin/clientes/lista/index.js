import React, { useState, useEffect } from 'react';
import Paginacion from 'components/subComponents/Paginacion/Paginacion';
import BusquedaForm from 'components/subComponents/Productos/BusquedaForm';
import ListadoTable from 'components/subComponents/Listados/ListadoTable';
import FilaProveedores from 'components/subComponents/Listados/SubComponentes/FilaClientes';
import UrlNodeServer from '../../../../api/NodeServer';
import axios from 'axios';
import { Row, Col, Card, CardHeader, CardFooter, Spinner } from 'reactstrap';
import ClientForm from '../form';

const titulos = ['Razón Social', 'Nº Doc.', 'Telefóno', 'Email', 'Cond. IVA', ''];

const ListaClientesMod = ({
    setAlertar,
    setMsgStrong,
    setMsgGralAlert,
    setSuccessAlert,
    setNvaActCall,
    setActividadStr,
    setVerCtaCteBool,
    setIdCtaCte,
    call,
    setCall,
    nvaActCall,
    alertar,
    setNombreCtaCte,
}) => {
    const [nvoProveedor, setNvoProveedor] = useState(false);

    //Search word
    const [busquedaBool, setBusquedaBool] = useState(false);
    const [palabraBuscada, setPalabraBuscada] = useState('');

    //lists and UseFetch
    const [pagina, setPagina] = useState(1);
    const [ultimaPag, setUltimaPag] = useState(0);
    const [plantPaginas, setPlantPaginas] = useState(<></>);
    const [listado, setListado] = useState([]);
    const [dataList, setDataList] = useState([]);

    const [client, setClient] = useState(false);

    const [esperar, setEsperar] = useState(false);

    useEffect(() => {
        ListaProveedores();
        // eslint-disable-next-line
    }, [call, pagina, client, nvoProveedor]);

    const ListaProveedores = async () => {
        setEsperar(true);
        await axios
            .get(`${UrlNodeServer.clientesDir.clientes}/${pagina}`, {
                params: {
                    search: palabraBuscada,
                },
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then((res) => {
                setEsperar(false);
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
                                return (
                                    <FilaProveedores
                                        id={key}
                                        key={key}
                                        item={item}
                                        setClient={setClient}
                                        setActividadStr={setActividadStr}
                                        nvaActCall={nvaActCall}
                                        setNvaActCall={setNvaActCall}
                                        alertar={alertar}
                                        setAlertar={setAlertar}
                                        setMsgStrong={setMsgStrong}
                                        setMsgGralAlert={setMsgGralAlert}
                                        setSuccessAlert={setSuccessAlert}
                                        setCall={setCall}
                                        call={call}
                                        setEsperar={setEsperar}
                                        primero={primero}
                                        pagina={pagina}
                                        setPagina={setPagina}
                                        setVerCtaCteBool={setVerCtaCteBool}
                                        setIdCtaCte={setIdCtaCte}
                                        setNombreCtaCte={setNombreCtaCte}
                                    />
                                );
                            }),
                        );
                    } else {
                        setUltimaPag(1);
                        setListado(
                            <tr style={{ textAlign: 'center', width: '100%' }}>
                                <td>
                                    <span style={{ textAlign: 'center', marginRight: 'auto', marginLeft: 'auto' }}>
                                        No hay clientes cargados
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
                                    No hay clientes cargados
                                </span>
                            </td>
                        </tr>,
                    );
                }
            })
            .catch((error) => {
                console.log('error :>> ', error);
                setEsperar(false);
                setUltimaPag(1);
                setListado(
                    <tr style={{ textAlign: 'center', width: '100%' }}>
                        <td>
                            <span style={{ textAlign: 'center', marginRight: 'auto', marginLeft: 'auto' }}>
                                No hay clientes cargados
                            </span>
                        </td>
                    </tr>,
                );
            });
    };

    return (
        <>
            {esperar ? (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                    <Spinner type="grow" color="primary" style={{ width: '100px', height: '100px' }} />{' '}
                </div>
            ) : (
                <>
                    {!client && !nvoProveedor ? (
                        <>
                            <Card className="shadow">
                                <CardHeader className="border-0">
                                    <Row>
                                        <Col md="4">
                                            <h2 className="mb-0">Lista de Clientes</h2>
                                        </Col>
                                        <Col md="8" style={{ textAlign: 'right' }}>
                                            <BusquedaForm
                                                busquedaBool={busquedaBool}
                                                setPalabraBuscada={setPalabraBuscada}
                                                palabraBuscada={palabraBuscada}
                                                setBusquedaBool={setBusquedaBool}
                                                call={call}
                                                setCall={setCall}
                                                titulo="Buscar un Cliente"
                                                setPagina={setPagina}
                                            />
                                        </Col>
                                    </Row>
                                </CardHeader>

                                <ListadoTable listado={listado} titulos={titulos} />
                                <CardFooter className="py-4">
                                    <nav aria-label="..." style={{ marginBottom: '20px' }}>
                                        <button className="btn btn-primary" onClick={() => setNvoProveedor(true)}>
                                            Nuevo Cliente
                                        </button>
                                    </nav>
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
                        </>
                    ) : (
                        <>
                            <ClientForm
                                client={client}
                                setClient={setClient}
                                toggle={() => {
                                    setNvoProveedor(false);
                                    setClient(false);
                                }}
                                isFormOpen={client || nvoProveedor}
                            />
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default ListaClientesMod;
