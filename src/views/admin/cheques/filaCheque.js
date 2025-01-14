import React, { useState } from 'react';
import formatMoney from '../../../Function/NumberFormat';
import moment from 'moment';
import { DropdownItem, DropdownMenu, DropdownToggle, Spinner, UncontrolledDropdown } from 'reactstrap';
import axios from 'axios';
import UrlNodeServer from '../../../api/NodeServer';
import FileSaver from 'file-saver';
import ModalDetalle from './modalDetalle';

const FilaCheque = ({ cheque, id, toggle }) => {
    const [esperar, setEsperar] = useState(false);
    const [modal, setModal] = useState(false);

    const estadoString = (estado) => {
        switch (parseInt(estado)) {
            case 0:
                return 'Pendiente de Cobro';
            case 1:
                return 'Cobrado';
            case 2:
                return 'Rechazado';
            case 3:
                return 'Vencido';
            case 4:
                return 'Usado como forma de pago';
            default:
                return 'No identificado';
        }
    };

    const coloresEstados = (estado) => {
        switch (parseInt(estado)) {
            case 0:
                return {
                    backgroundColor: false,
                    color: false,
                };
            case 1:
                return {
                    backgroundColor: 'bg-success',
                    color: 'text-white',
                };
            case 2:
                return {
                    backgroundColor: 'bg-danger',
                    color: 'text-white',
                };
            case 3:
                return {
                    backgroundColor: 'bg-danger',
                    color: 'text-white',
                };
            case 4:
                return {
                    backgroundColor: 'bg-success',
                    color: 'text-white',
                };
            default:
                return {
                    backgroundColor: false,
                    color: false,
                };
        }
    };

    const coloresFechaVencimiento = (fecha) => {
        const fechaVencimiento = moment(fecha);
        const proxFechaVenc = moment(new Date().setDate(new Date().getDate() + 30));
        const cercaVencimiento = moment(new Date().setDate(new Date().getDate() - 20));
        const fechaActual = moment(new Date());
        if (fechaVencimiento.isBefore(cercaVencimiento)) {
            return {
                backgroundColor: 'bg-danger',
                color: 'text-white',
            };
        } else if (fechaVencimiento.isBefore(fechaActual)) {
            return {
                backgroundColor: 'bg-success',
                color: 'text-white',
            };
        } else if (fechaVencimiento.isBefore(proxFechaVenc)) {
            return {
                backgroundColor: 'bg-warning',
                color: 'text-white',
            };
        } else {
            return {
                backgroundColor: false,
                color: false,
            };
        }
    };

    const cambiarEstado = async (e, id, estado) => {
        e.preventDefault();
        setEsperar(true);
        await axios
            .put(
                UrlNodeServer.chequesDir.cheques + '/estado/' + id,
                {
                    estado: estado,
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                    },
                },
            )
            .then((res) => {
                const respuesta = res.data;
                const status = parseInt(respuesta.status);
                if (status === 200) {
                    swal('Cheque actualizado', 'El cheque fue actualizado correctamente', 'success');
                } else {
                    swal('Error', 'No se pudo actualizar el cheque', 'error');
                }
            })
            .catch((error) => {
                swal('Error', 'No se pudo actualizar el cheque: ' + error, 'error');
            })
            .finally(() => {
                setEsperar(false);
                toggle();
            });
    };

    const getFact = async (idFact, type) => {
        let urlGet = UrlNodeServer.invoicesDir.sub.factDataPDF;
        if (type === -1) {
            urlGet = UrlNodeServer.clientesDir.sub.payments;
        }
        setEsperar(true);
        await axios
            .get(urlGet + '/' + idFact, {
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
                swal('Reimpresión de factura', 'Factura reimpresa con éxito!', 'success');
            })
            .catch((error) => {
                console.log('error :>> ', error);
                swal('Reimpresión de factura', 'Hubo un error al querer reimprimir la factura!: ' + error, 'error');
            })
            .finally(() => {
                setEsperar(false);
            });
    };

    return (
        <>
            <tr
                key={id}
                className={
                    coloresEstados(cheque.estado).backgroundColor +
                    ' ' +
                    coloresEstados(cheque.estado).color +
                    (esperar ? ' shimmer' : '')
                }
            >
                <td style={{ textAlign: 'center' }}>{cheque.nro_cheque}</td>
                <td style={{ textAlign: 'center' }}>{cheque.banco}</td>
                <td style={{ textAlign: 'center' }}>{moment(cheque.fecha_emision).format('DD/MM/YYYY')}</td>
                <td
                    style={{ textAlign: 'center' }}
                    className={
                        coloresFechaVencimiento(cheque.fecha_vencimiento).backgroundColor +
                        ' ' +
                        coloresFechaVencimiento(cheque.fecha_vencimiento).color
                    }
                >
                    {moment(cheque.fecha_vencimiento).format('DD/MM/YYYY')}
                </td>
                <td style={{ textAlign: 'center' }}>$ {formatMoney(cheque.importe)}</td>
                <td style={{ textAlign: 'center' }}>{estadoString(cheque.estado)}</td>
                <td className="text-right">
                    {esperar ? (
                        <div style={{ textAlign: 'center' }}>
                            <Spinner type="border" color="blue" style={{ width: '1rem', height: '1rem' }} />{' '}
                        </div>
                    ) : (
                        <UncontrolledDropdown>
                            <DropdownToggle
                                className="btn-icon-only text-light"
                                href="#pablo"
                                role="button"
                                size="sm"
                                color=""
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="fas fa-ellipsis-v" />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                                <DropdownItem
                                    href="#pablo"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        getFact(cheque.id_fact, parseFloat(cheque.t_fact));
                                    }}
                                >
                                    <i className="fas fa-search"></i>
                                    Ver Factura
                                </DropdownItem>
                                <DropdownItem
                                    href="#pablo"
                                    onClick={(e) => cambiarEstado(e, cheque.id, 1)}
                                    disabled={parseInt(cheque.estado) === 0 ? false : true}
                                >
                                    <i className="fas fa-check"></i>
                                    Marcar como cobrado
                                </DropdownItem>
                                <DropdownItem
                                    href="#pablo"
                                    onClick={(e) => cambiarEstado(e, cheque.id, 2)}
                                    disabled={parseInt(cheque.estado) === 0 ? false : true}
                                >
                                    <i className="fas fa-times"></i>
                                    Marcar como rechazado
                                </DropdownItem>
                                <DropdownItem
                                    href="#pablo"
                                    onClick={(e) => cambiarEstado(e, cheque.id, 0)}
                                    disabled={
                                        parseInt(cheque.estado) === 0 || parseInt(cheque.estado) === 3 ? true : false
                                    }
                                >
                                    <i className="fas fa-undo"></i>
                                    Marcar como pendiente
                                </DropdownItem>
                                <DropdownItem
                                    href="#pablo"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setModal(true);
                                    }}
                                >
                                    <i className="fas fa-info"></i>
                                    Ver notas
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    )}
                </td>
            </tr>
            <ModalDetalle modal={modal} toggle={() => setModal(!modal)} cheque={cheque} toggleList={toggle} />
        </>
    );
};

export default FilaCheque;
