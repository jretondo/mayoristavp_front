import ListadoTable from 'components/subComponents/Listados/ListadoTable';
import Paginacion from 'components/subComponents/Paginacion/Paginacion';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardFooter, CardHeader, Col, FormGroup, Input, Label, Row, Spinner } from 'reactstrap';
import UrlNodeServer from '../../../../api/NodeServer';
import axios from 'axios';
import FilaCtaCte from 'components/subComponents/Listados/SubComponentes/FilaCtaCteAll';
import formatMoney from 'Function/NumberFormat';
import { BsCardList, BsFileEarmarkPdfFill, BsFileExcelFill } from 'react-icons/bs';
import moment from 'moment';
import FileSaver from 'file-saver';
const titulos = ['Fecha', 'Cliente', 'Detalle', 'Factura', 'Importe'];
const CtaCteListMod = () => {
    const hoy1 = moment(new Date().setDate(new Date().getDate() - 60)).format('YYYY-MM-DD');
    const hoy2 = moment(new Date()).format('YYYY-MM-DD');
    const [esperar, setEsperar] = useState(false);
    const [listado, setListado] = useState(
        <tr>
            <td></td>
            <td>Aún no posee movimientos en su Cta. Cte.</td>
        </tr>,
    );
    const [pagina, setPagina] = useState(1);
    const [ultimaPag, setUltimaPag] = useState(0);
    const [plantPaginas, setPlantPaginas] = useState(<></>);
    const [dataList, setDataList] = useState([]);
    const [tipoCons, setTipoCons] = useState(0);
    const [total, setTotal] = useState('');
    const [actualizar, setActualizar] = useState(false);
    const [cliente, setCliente] = useState('');
    const [loadingPDF, setLoadingPDF] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);
    const [desde, setDesde] = useState(hoy1);
    const [hasta, setHasta] = useState(hoy2);

    const ListarCtaCte = async () => {
        let data;
        if (parseInt(tipoCons) === 0) {
            data = {
                cliente,
                desde,
                hasta,
            };
        } else if (parseInt(tipoCons) === 1) {
            data = {
                cliente,
                debit: true,
                desde,
                hasta,
            };
        } else {
            data = {
                cliente,
                credit: true,
                desde,
                hasta,
            };
        }
        setEsperar(true);
        await axios
            .get(`${UrlNodeServer.clientesDir.sub.ctaCteAll}/${pagina}`, {
                params: data,
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
                        setTotal(body.suma[0].SUMA);
                        setListado(
                            body.data.map((item, key) => {
                                return <FilaCtaCte key={key} id={key} item={item} />;
                            }),
                        );
                    } else {
                        setUltimaPag(1);
                        setListado(
                            <tr>
                                <td></td>
                                <td>Aún no posee movimientos en su Cta. Cte.</td>
                            </tr>,
                        );
                    }
                } else {
                    setUltimaPag(1);
                    setListado(
                        <tr>
                            <td></td>
                            <td>Aún no posee movimientos en su Cta. Cte.</td>
                        </tr>,
                    );
                }
            })
            .catch((error) => {
                console.log('error :>> ', error);
                setEsperar(false);
                setUltimaPag(1);
                setListado(
                    <tr>
                        <td></td>
                        <td>Aún no posee movimientos en su Cta. Cte.</td>
                    </tr>,
                );
            });
    };

    const ListarCtaCteExcel = async () => {
        let data;
        if (parseInt(tipoCons) === 0) {
            data = {
                cliente,
                desde,
                hasta,
            };
        } else if (parseInt(tipoCons) === 1) {
            data = {
                cliente,
                debit: true,
                desde,
                hasta,
            };
        } else {
            data = {
                cliente,
                credit: true,
                desde,
                hasta,
            };
        }
        setLoadingExcel(true);
        await axios
            .get(`${UrlNodeServer.clientesDir.sub.ctaCteAllExcel}`, {
                params: data,
                responseType: 'arraybuffer',
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                    Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            })
            .then((res) => {
                let headerLine = res.headers['content-disposition'];
                const largo = parseInt(headerLine.length);
                let filename = headerLine.substring(21, largo);
                var blob = new Blob([res.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                FileSaver.saveAs(blob, filename);
                setLoadingExcel(false);
                swal('Listado de Caja!', 'El listado de caja ha sido generado con éxito!', 'success');
            })
            .catch((error) => {
                console.log('error :>> ', error);
                setLoadingExcel(false);
                swal('Listado de Caja!', 'Hubo un error al querer listar la caja!', 'error');
            });
    };

    const ListarCtaCtePDF = async () => {
        let data;
        if (parseInt(tipoCons) === 0) {
            data = {
                cliente,
                desde,
                hasta,
            };
        } else if (parseInt(tipoCons) === 1) {
            data = {
                cliente,
                debit: true,
                desde,
                hasta,
            };
        } else {
            data = {
                cliente,
                credit: true,
                desde,
                hasta,
            };
        }
        setLoadingPDF(true);
        await axios
            .get(`${UrlNodeServer.clientesDir.sub.ctaCteAllPDF}`, {
                params: data,
                responseType: 'arraybuffer',
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                    Accept: 'application/pdf',
                },
            })
            .then((res) => {
                let headerLine = res.headers['content-disposition'];
                const largo = parseInt(headerLine.length);
                let filename = headerLine.substring(21, largo);
                var blob = new Blob([res.data], { type: 'application/pdf' });
                FileSaver.saveAs(blob, filename);
                setLoadingPDF(false);
                swal('Listado de Caja!', 'El listado de caja ha sido generado con éxito!', 'success');
            })
            .catch((error) => {
                console.log('error :>> ', error);
                setLoadingPDF(false);
                swal('Listado de Caja!', 'Hubo un error al querer listar la caja!', 'error');
            });
    };

    useEffect(() => {
        ListarCtaCte();
    }, [pagina, actualizar]);

    useEffect(() => {
        setPagina(1);
        ListarCtaCte();
    }, [tipoCons]);

    return (
        <>
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
                                        <Col md="7">
                                            <Row>
                                                <Col md="8">
                                                    <FormGroup>
                                                        <Label for="exampleSelect">Cliente</Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Nombre o CUIT"
                                                            value={cliente}
                                                            onKeyUp={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    setPagina(1);
                                                                    ListarCtaCte();
                                                                }
                                                            }}
                                                            onChange={(e) => {
                                                                setCliente(e.target.value);
                                                            }}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4" style={{ textAlign: 'left' }}>
                                                    <FormGroup>
                                                        <Label for="exampleSelect">Tipo de Movimiento</Label>
                                                        <Input
                                                            type="select"
                                                            name="select"
                                                            id="exampleSelect"
                                                            value={tipoCons}
                                                            onChange={(e) => {
                                                                setTipoCons(e.target.value);
                                                            }}
                                                        >
                                                            <option value={0}>Todos</option>
                                                            <option value={1}>Débitos</option>
                                                            <option value={2}>Créditos</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label for="desdeTxtCaja">Desde</Label>
                                                        <Input
                                                            type="date"
                                                            id="desdeTxtCaja"
                                                            value={desde}
                                                            onChange={(e) => setDesde(e.target.value)}
                                                            max={hasta}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <Label for="desdeTxtCaja">Hasta</Label>
                                                    <Input
                                                        type="date"
                                                        id="desdeTxtCaja"
                                                        value={hasta}
                                                        onChange={(e) => setHasta(e.target.value)}
                                                        min={desde}
                                                    />
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col
                                            md="5"
                                            style={{ textAlign: 'center', marginTop: '32px', marginBottom: '20px' }}
                                        >
                                            <Row>
                                                <Col md="4" style={{ textAlign: 'center', marginTop: '10px' }}>
                                                    <Button
                                                        color="primary"
                                                        style={{
                                                            height: '100%',
                                                            width: '60%',
                                                            fontSize: '14px',
                                                            minWidth: '125px',
                                                            maxWidth: '170px',
                                                        }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setPagina(1);
                                                            ListarCtaCte();
                                                        }}
                                                    >
                                                        <Row>
                                                            <span style={{ textAlign: 'center', width: '100%' }}>
                                                                {' '}
                                                                Listar
                                                            </span>
                                                        </Row>
                                                        <Row>
                                                            <span
                                                                style={{
                                                                    textAlign: 'center',
                                                                    width: '100%',
                                                                    fontSize: '25px',
                                                                }}
                                                            >
                                                                {' '}
                                                                <BsCardList />
                                                            </span>
                                                        </Row>
                                                    </Button>
                                                </Col>
                                                <Col md="4" style={{ textAlign: 'center', marginTop: '10px' }}>
                                                    {loadingPDF ? (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <Spinner
                                                                type="border"
                                                                color="red"
                                                                style={{ width: '5rem', height: '5rem' }}
                                                            />{' '}
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            color="danger"
                                                            style={{
                                                                height: '100%',
                                                                width: '60%',
                                                                fontSize: '14px',
                                                                minWidth: '125px',
                                                                maxWidth: '170px',
                                                            }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                ListarCtaCtePDF();
                                                            }}
                                                        >
                                                            <Row>
                                                                <span style={{ textAlign: 'center', width: '100%' }}>
                                                                    {' '}
                                                                    Imprimir PDF
                                                                </span>
                                                            </Row>
                                                            <Row>
                                                                <span
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        width: '100%',
                                                                        fontSize: '25px',
                                                                    }}
                                                                >
                                                                    {' '}
                                                                    <BsFileEarmarkPdfFill />
                                                                </span>
                                                            </Row>
                                                        </Button>
                                                    )}
                                                </Col>
                                                <Col md="4" style={{ textAlign: 'center', marginTop: '10px' }}>
                                                    {loadingExcel ? (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <Spinner
                                                                type="border"
                                                                color="green"
                                                                style={{ width: '5rem', height: '5rem' }}
                                                            />{' '}
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            color="success"
                                                            style={{
                                                                height: '100%',
                                                                width: '60%',
                                                                fontSize: '14px',
                                                                minWidth: '125px',
                                                                maxWidth: '170px',
                                                            }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                ListarCtaCteExcel();
                                                            }}
                                                        >
                                                            <Row>
                                                                <span style={{ textAlign: 'center', width: '100%' }}>
                                                                    {' '}
                                                                    Imprimir Excel
                                                                </span>
                                                            </Row>
                                                            <Row>
                                                                <span
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        width: '100%',
                                                                        fontSize: '25px',
                                                                    }}
                                                                >
                                                                    {' '}
                                                                    <BsFileExcelFill />
                                                                </span>
                                                            </Row>
                                                        </Button>
                                                    )}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <ListadoTable listado={listado} titulos={titulos} />
                                <CardFooter className="py-4">
                                    <Row>
                                        <Col md="9"></Col>
                                        <Col md="3">
                                            <Input
                                                style={
                                                    parseInt(total) > 0
                                                        ? {
                                                              fontWeight: 'bold',
                                                              textAlign: 'right',
                                                              fontSize: '18px',
                                                              color: 'green',
                                                          }
                                                        : {
                                                              fontWeight: 'bold',
                                                              textAlign: 'right',
                                                              fontSize: '18px',
                                                              color: 'red',
                                                          }
                                                }
                                                disabled
                                                value={'$ ' + formatMoney(total)}
                                            />
                                        </Col>
                                    </Row>
                                    <br />
                                    <Paginacion
                                        setPagina={setPagina}
                                        setCall={setActualizar}
                                        pagina={pagina}
                                        call={actualizar}
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
        </>
    );
};
export default CtaCteListMod;
