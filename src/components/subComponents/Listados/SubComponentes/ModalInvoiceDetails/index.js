import UrlNodeServer from '../../../../../api/NodeServer';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    ButtonGroup,
    Col,
    Collapse,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner,
} from 'reactstrap';
import CompleteCerosLeft from 'Function/CompleteCeroLeft';
import ButtonOpenCollapse from '../../../../buttonOpen';
import { useWindowSize } from '../../../../../Hooks/UseWindowSize';
import DetailsInvoiceList from './details';
import PaymentsInvoiceList from './payments';
import formatMoney from '../../../../../Function/NumberFormat';

const ModalInvoiceDetails = ({ setModal, modal, item }) => {
    const [loading, setLoading] = useState(false);
    const [detailsView, setDetailsView] = useState(true);

    const width = useWindowSize();

    const toggleDetails = () => setDetailsView(!detailsView);
    return (
        <Modal isOpen={modal} toggle={() => setModal(!modal)} size="lg">
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                }}
            >
                {loading ? (
                    <>
                        <div style={{ textAlign: 'center', marginTop: '100px' }}>
                            <Spinner type="grow" color="primary" style={{ width: '100px', height: '100px' }} />{' '}
                        </div>
                    </>
                ) : (
                    <>
                        <ModalHeader toggle={() => setModal(!modal)}>
                            <h3>
                                Detalles{' '}
                                <span style={{ color: '#0081c9', marginLeft: '5px' }}>
                                    {' '}
                                    {item.letra} {CompleteCerosLeft(item.pv, 5)} - {CompleteCerosLeft(item.cbte, 8)}
                                </span>
                                <span style={{ color: '#0081c9', marginLeft: '15px' }}>
                                    {' '}
                                    Total: $ {formatMoney(item.total_fact)}
                                </span>
                            </h3>
                            <ButtonGroup vertical={width > 1030 ? false : true}>
                                <ButtonOpenCollapse action={toggleDetails} tittle={'Detalles'} active={detailsView} />
                                <ButtonOpenCollapse action={toggleDetails} tittle={'Pagos'} active={!detailsView} />
                            </ButtonGroup>
                        </ModalHeader>
                        <ModalBody>
                            <Collapse isOpen={detailsView}>
                                <DetailsInvoiceList details={item.details} />
                            </Collapse>
                            <Collapse isOpen={!detailsView}>
                                <PaymentsInvoiceList
                                    pagos={item.pagos}
                                    formaPago={item.forma_pago}
                                    importe={item.total_fact}
                                />
                            </Collapse>
                        </ModalBody>
                        <ModalFooter>
                            <Row>
                                {/*
                                <Col md="6">
                                    <button style={{ width: '130px', margin: '15px' }} className="btn btn-primary">
                                        Actualizar
                                    </button>
                                </Col>
                              */}
                                <Col md="6">
                                    <button
                                        style={{ width: '130px', margin: '15px' }}
                                        className="btn btn-danger"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setModal(false);
                                        }}
                                    >
                                        Cerrar
                                    </button>
                                </Col>
                            </Row>
                        </ModalFooter>
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default ModalInvoiceDetails;
