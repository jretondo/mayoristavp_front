import React, { useState, useEffect } from 'react';

//NPM Modules
import { ButtonGroup, Card, CardBody, Collapse, Container, Spinner } from 'reactstrap';

//Custom Hooks
import { Redirect } from 'react-router-dom';
import { useActividad } from '../../../Hooks/UseNvaActividad';

//Links to Server
import UrlNodeServer from '../../../api/NodeServer';

//My modules
import AlertaForm from 'components/subComponents/Alertas/Alerta1';
import Header from 'components/Headers/Header.js';

import { UseSecureRoutes } from 'Hooks/UseSecureRoutes';
import ListaClientesMod from './lista';
import CtaCteListClientMod from './ctacte';
import { useWindowSize } from '../../../Hooks/UseWindowSize';
import ButtonOpenCollapse from '../../../components/buttonOpen';
import CtaCteListMod from './ctacteAll';

const ClientesView = () => {
    //user massages
    const [alertar, setAlertar] = useState(false);
    const [msgStrongAlert, setMsgStrong] = useState('');
    const [msgGralAlert, setMsgGralAlert] = useState('');
    const [successAlert, setSuccessAlert] = useState(false);
    const [call, setCall] = useState(false);

    //Activities
    const [nvaActCall, setNvaActCall] = useState(false);
    const [actividadStr, setActividadStr] = useState('');
    const [verCtaCteBool, setVerCtaCteBool] = useState(false);
    const [idCtaCte, setIdCtaCte] = useState(0);
    const [nombreCtaCte, setNombreCtaCte] = useState('');

    const [moduleActive, setModuleActive] = useState(0);

    const width = useWindowSize();

    const activeClientes = () => {
        setModuleActive(0);
    };
    const activeMovimientos = () => {
        setModuleActive(1);
    };

    useEffect(() => {
        setCall(!call);
        // eslint-disable-next-line
    }, []);

    useActividad(nvaActCall, actividadStr);

    const { loading, error } = UseSecureRoutes(UrlNodeServer.routesDir.sub.clientes, call);

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
                    <div style={{ width: '100%' }}>
                        <Card style={{ marginTop: '5px', marginBottom: '10px' }}>
                            <CardBody style={{ textAlign: 'center' }}>
                                <ButtonGroup vertical={width > 1030 ? false : true}>
                                    <ButtonOpenCollapse
                                        action={activeClientes}
                                        tittle={'Clientes'}
                                        active={moduleActive === 0 ? true : false}
                                    />
                                    <ButtonOpenCollapse
                                        action={activeMovimientos}
                                        tittle={'Movimientos Cta. Cte.'}
                                        active={moduleActive === 1 ? true : false}
                                    />
                                </ButtonGroup>
                            </CardBody>
                        </Card>
                        <Collapse isOpen={moduleActive === 0 ? true : false}>
                            {verCtaCteBool ? (
                                <CtaCteListClientMod
                                    idCliente={idCtaCte}
                                    nombreCliente={nombreCtaCte}
                                    setVerCtaCteBool={setVerCtaCteBool}
                                    call={call}
                                    setCall={setCall}
                                />
                            ) : (
                                <ListaClientesMod
                                    setAlertar={setAlertar}
                                    setMsgStrong={setMsgStrong}
                                    setMsgGralAlert={setMsgGralAlert}
                                    setSuccessAlert={setSuccessAlert}
                                    setNvaActCall={setNvaActCall}
                                    setActividadStr={setActividadStr}
                                    setVerCtaCteBool={setVerCtaCteBool}
                                    setIdCtaCte={setIdCtaCte}
                                    call={call}
                                    setCall={setCall}
                                    nvaActCall={nvaActCall}
                                    alertar={alertar}
                                    setNombreCtaCte={setNombreCtaCte}
                                />
                            )}
                        </Collapse>
                        <Collapse isOpen={moduleActive === 1 ? true : false}>
                            <CtaCteListMod />
                        </Collapse>
                    </div>
                </Container>
            </>
        );
    }
};

export default ClientesView;
