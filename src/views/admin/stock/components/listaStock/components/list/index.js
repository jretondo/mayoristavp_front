import ListadoTable from 'components/subComponents/Listados/ListadoTable';
import FilaVentas from 'components/subComponents/Listados/SubComponentes/FilaStock3';
import Paginacion from 'components/subComponents/Paginacion/Paginacion';
import React, { useEffect, useState } from 'react';
import { Col, Input, Row } from 'reactstrap';
import FilaEspera from './FilaEspera';
import formatMoney from '../../../../../../../Function/NumberFormat';

const titulos = ['Producto', 'Marca', 'Proveedor', 'Cant.', 'Costo Total'];

const ListaStockMod = ({ listaStock, pagina, setPagina, loading }) => {
    const [call, setCall] = useState(false);
    const [plantPaginas, setPlantPaginas] = useState(<></>);
    const [ultimaPag, setUltimaPag] = useState(1);
    const [dataState, setDataState] = useState({});
    const [listadoVentas, setListadoVentas] = useState(
        <tr>
            <td></td>
            <td>No hay listado de stock con los filtros colocados</td>
        </tr>,
    );

    useEffect(() => {
        try {
            const data = listaStock.data;
            const pagesObj = listaStock.pagesObj;
            if (data.length > 0) {
                setDataState(pagesObj);
                setUltimaPag(pagesObj.totalPag);
                setListadoVentas(
                    // eslint-disable-next-line
                    data.map((item, key) => {
                        return <FilaVentas key={key} id={key} item={item} />;
                    }),
                );
            } else {
                setListadoVentas(
                    <tr>
                        <td></td>
                        <td>No hay listado de stock con los filtros colocados</td>
                    </tr>,
                );
            }
        } catch (error) {
            setListadoVentas(
                <tr>
                    <td></td>
                    <td>No hay listado de stock con los filtros colocados</td>
                </tr>,
            );
        }
    }, [listaStock]);

    return (
        <>
            <Row>
                <Col>
                    {loading ? (
                        <ListadoTable titulos={titulos} listado={<FilaEspera />} />
                    ) : (
                        <ListadoTable titulos={titulos} listado={listadoVentas} />
                    )}
                </Col>
            </Row>
            <Row style={{ marginTop: '20px' }}>
                <Col>
                    {loading ? null : (
                        <Paginacion
                            setPagina={setPagina}
                            setCall={setCall}
                            pagina={pagina}
                            call={call}
                            plantPaginas={plantPaginas}
                            ultimaPag={ultimaPag}
                            data={dataState}
                            setPlantPaginas={setPlantPaginas}
                            setUltimaPag={setUltimaPag}
                        />
                    )}
                </Col>
                <Col>
                    <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        Total de valorizado en stock:{' '}
                        <Input
                            type="text"
                            readOnly
                            value={'$ ' + formatMoney(listaStock.totalValorizado)}
                            style={{
                                width: '200px',
                                display: 'inline-block',
                                textAlign: 'right',
                                fontWeight: 'bold',
                                fontSize: '18px',
                            }}
                        />
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default ListaStockMod;
