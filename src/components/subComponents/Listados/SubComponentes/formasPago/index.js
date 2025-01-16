import formatMoney from 'Function/NumberFormat';
import React, { useEffect, useState } from 'react';
import { Button, Col, FormGroup, Input, Label, Row, Table } from 'reactstrap';
import FilaPago from './filaPago';
import ModalPago from './modalPago';
import { roundNumber } from '../../../../../Function/roundNumber';

const FormasPagoMod = ({
    variosPagos,
    setVariosPagos,
    clienteBool,
    factFiscBool,
    total,
    setTotal,
    totalPrecio,
    cliente,
    descuentoPerc,
}) => {
    const [modal, setModal] = useState(false);
    const [listado, setListado] = useState(
        <tr style={{ borderTop: '1px solid #e9ecef', borderBottom: '1px solid #e9ecef' }}>
            <td>Aún no hay pagos registrados</td>
        </tr>,
    );

    const listarPagos = () => {
        if (variosPagos.length > 0) {
            // eslint-disable-next-line
            setListado(
                variosPagos.map((item, key) => {
                    return (
                        <FilaPago
                            id={key}
                            key={key}
                            tipo={item.tipo}
                            tipoTxt={item.tipo_txt}
                            importe={item.importe}
                            variosPagos={variosPagos}
                            setVariosPagos={setVariosPagos}
                        />
                    );
                }),
            );
            setTotal(roundNumber(variosPagos.reduce((acc, item) => acc + roundNumber(item.importe), 0)));
        } else {
            setListado(
                <tr style={{ borderTop: '1px solid #e9ecef', borderBottom: '1px solid #e9ecef' }}>
                    <td>Aún no hay pagos registrados</td>
                </tr>,
            );
            setTotal(0);
        }
    };

    useEffect(() => {
        listarPagos();
    }, [variosPagos]);

    return (
        <>
            <h2 style={{ textAlign: 'center' }}>Métodos de Pagos</h2>
            <Table className="align-items-center table-flush">
                <tbody>
                    {listado}
                    {totalPrecio === 0 ||
                        (Math.round(total * 100) / 100 <
                            Math.round((totalPrecio - totalPrecio * (descuentoPerc / 100)) * 100) / 100 && (
                            <tr>
                                <td></td>
                                <td></td>
                                <td style={{ textAlign: 'left' }}>
                                    <Button
                                        color="success"
                                        style={{ borderRadius: '10%' }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setModal(true);
                                        }}
                                    >
                                        <i className="fa fa-plus"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>

            <Row style={{ marginTop: '20px' }}>
                <Col md="4" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <Label style={{ fontSize: '25px', fontWeight: 'bold' }}>Pago Total:</Label>
                </Col>
                <Col md="8">
                    <FormGroup>
                        <Input
                            style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'right' }}
                            type="text"
                            value={'$ ' + formatMoney(total)}
                            disabled
                        />
                    </FormGroup>
                </Col>
            </Row>

            <ModalPago
                modal={modal}
                toggle={() => setModal(!modal)}
                variosPagos={variosPagos}
                setVariosPagos={setVariosPagos}
                clienteBool={clienteBool}
                factFiscBool={factFiscBool}
                total={total}
                totalPrecio={totalPrecio}
                descuentoPerc={descuentoPerc}
                cliente={cliente}
            />
        </>
    );
};

export default FormasPagoMod;
