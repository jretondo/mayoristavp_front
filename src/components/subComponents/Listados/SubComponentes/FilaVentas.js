import CompleteCerosLeft from '../../../../Function/CompleteCeroLeft';
import formatMoney from 'Function/NumberFormat';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, Spinner, UncontrolledDropdown, Button, Tooltip } from 'reactstrap';
import { BsFileEarmarkPdfFill, BsTelegram, BsFillXCircleFill, BsCurrencyExchange } from 'react-icons/bs';
import { FiInfo } from 'react-icons/fi';
import axios from 'axios';
import UrlNodeServer from '../../../../api/NodeServer';
import swal from 'sweetalert';
import { validateEmail } from 'Function/emailValidator';
import FileSaver from 'file-saver';
import ModalInvoiceDetails from './ModalInvoiceDetails';
import ModalDevPart from './ModalDevPart';
import ModalFormasPagos from './ModalFormasPago';

const FilaVentas = ({ id, item, setActualizar, actualizar }) => {
    const [wait, setWait] = useState(false);
    const [comprobante, setComprobante] = useState({
        pv: '00000',
        cbte: '00000000',
    });
    const [tooltp, setTooltp] = useState(false);
    const [modal1, setModal1] = useState(false);
    const [modal2, setModal2] = useState(false);
    const [modal3, setModal3] = useState(false);

    const getFact = async (idFact, send, type, noPrice) => {
        let query = '';
        let seguir = true;
        if (send) {
            query = await swal({
                text: 'Email a enviar la factura:',
                content: 'input',
            }).then((email) => {
                if (validateEmail(email)) {
                    return `?sendEmail=true&email=${email}`;
                } else {
                    swal('No válido!', 'El email que colocó no es valido! Intentelo nuevamente.', 'error');
                    seguir = false;
                }
            });
        }

        if (seguir) {
            let urlGet = UrlNodeServer.invoicesDir.sub.factDataPDF;
            if (type < 0) {
                urlGet = UrlNodeServer.clientesDir.sub.payments;
            }
            setWait(true);
            if (noPrice) {
                query = '?noPrice=true';
            }
            await axios
                .get(urlGet + '/' + idFact + query, {
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
                    setWait(false);
                    if (send) {
                        swal('Envío de factura', 'Comprobante envíada con éxito!', 'success');
                    } else {
                        swal('Reimpresión de factura', 'Comprobante reimpresa con éxito!', 'success');
                    }
                })
                .catch((error) => {
                    setWait(false);
                    if (send) {
                        swal('Envío de factura', 'Hubo un error al querer envíar la factura!', 'error');
                    } else {
                        swal('Reimpresión de factura', 'Hubo un error al querer reimprimir la factura!', 'error');
                    }
                });
        }
    };

    const tieneItemsAnulados = (items) => {
        let tiene = false;
        items.forEach((item) => {
            if (parseInt(item.cant_anulada) > 0) {
                tiene = true;
            }
        });
        return tiene;
    };

    const anularFact = async (idFact, esRecibo) => {
        let seguir = false;
        const data = {
            id: idFact,
            fecha: moment(new Date()).format('YYYY-MM-DD'),
        };
        seguir = await swal({
            title: esRecibo ? '¿Está seguro de eliminar el recibo?' : '¿Está seguro de anular la factura?',
            text: esRecibo
                ? 'Esta operación no tiene retroceso y resta del total del listado. No genera una Nota de Crédito!'
                : 'Esta operación no tiene retroceso y resta del total del listado.',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                return true;
            }
        });

        if (seguir) {
            setWait(true);
            let urlPost = UrlNodeServer.invoicesDir.sub.notaCred;
            if (esRecibo) {
                urlPost = UrlNodeServer.clientesDir.sub.payments + '/delete';
            }
            await axios
                .post(urlPost, data, {
                    responseType: 'arraybuffer',
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                        Accept: 'application/pdf',
                    },
                })
                .then((res) => {
                    if (!esRecibo) {
                        let headerLine = res.headers['content-disposition'];
                        const largo = parseInt(headerLine.length);
                        let filename = headerLine.substring(21, largo);
                        var blob = new Blob([res.data], { type: 'application/pdf' });
                        FileSaver.saveAs(blob, filename);
                    }
                    setWait(false);
                    swal('Anulación de Comprobante', 'La factura ha sido anulada con éxito!', 'success');
                    setActualizar(!actualizar);
                })
                .catch((error) => {
                    setWait(false);
                    swal(
                        'Anulación de Comprobante',
                        `Hubo un error al querer anular la factura! \n\r Error: ${error}`,
                        'error',
                    );
                });
        }
    };

    const completarCeros = () => {
        const pvStr = CompleteCerosLeft(item.pv, 5);
        const cbteStr = CompleteCerosLeft(item.cbte, 8);

        setComprobante({
            pv: pvStr,
            cbte: cbteStr,
        });
    };

    const pagoString = (formaPago) => {
        switch (parseInt(formaPago)) {
            case 0:
                return 'Efvo.';
            case 1:
                return 'MP';
            case 2:
                return 'Débito';
            case 3:
                return 'Crédito';
            case 4:
                return 'Cta. Cte.';
            case 6:
                return 'Cheque';
            case 7:
                return 'Transf.';
            default:
        }
    };

    const toggleDetails = (e, item) => {
        e.preventDefault();
        setModal1(true);
    };

    const toggleToolTip = () => {
        setTooltp(!tooltp);
    };

    useEffect(() => {
        completarCeros();
        // eslint-disable-next-line
    }, [item.pv, item.cbte]);

    return (
        <>
            <tr key={id} style={parseInt(item.id_fact_asoc) !== 0 ? { background: '#e8e8e8' } : {}}>
                <td style={{ textAlign: 'center' }}>{moment(item.create_time).format('DD/MM/YYYY HH:mm') + ' hs'}</td>
                <td style={{ textAlign: 'center' }}>
                    {item.raz_soc_cliente === '' ? 'Consumidor Final' : item.raz_soc_cliente}{' '}
                    {parseInt(item.tipo_doc_cliente) === 80
                        ? '(CUIT: ' + item.n_doc_cliente + ')'
                        : parseInt(item.tipo_doc_cliente) === 96
                        ? '(DNI: ' + item.n_doc_cliente + ')'
                        : ''}
                </td>
                <td style={{ textAlign: 'center' }}>
                    {item.letra} {comprobante.pv} - {comprobante.cbte}
                </td>
                <td style={{ textAlign: 'center' }}>
                    <Button
                        style={{ borderRadius: '10%', marginInline: '10px' }}
                        color={'info'}
                        id={`buttonChange-${item.id}`}
                        onClick={(e) => toggleDetails(e)}
                    >
                        <FiInfo />
                    </Button>
                    <Tooltip
                        placement="right"
                        isOpen={tooltp}
                        target={`buttonChange-${item.id}`}
                        toggle={toggleToolTip}
                    >
                        Ver Detalles
                    </Tooltip>
                </td>
                <td>
                    {parseInt(item.forma_pago) === 5 ? (
                        item.pagos.map((item, key) => {
                            return (
                                <div key={key} style={{ textAlign: 'center' }}>
                                    {pagoString(item.tipo)}: $ {formatMoney(item.importe)}
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            {pagoString(item.forma_pago)}: $ {formatMoney(item.total_fact)}
                        </div>
                    )}
                </td>
                <td style={{ textAlign: 'center' }}>$ {formatMoney(item.total_fact)}</td>
                <td className="text-right">
                    {wait ? (
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
                                        e.preventDefault(e);
                                        getFact(item.id, false, parseFloat(item.t_fact));
                                    }}
                                >
                                    <BsFileEarmarkPdfFill />
                                    Ver Comprobante
                                </DropdownItem>
                                <DropdownItem
                                    href="#pablo"
                                    onClick={(e) => {
                                        e.preventDefault(e);
                                        getFact(item.id, false, parseFloat(item.t_fact), true);
                                    }}
                                >
                                    <BsFileEarmarkPdfFill />
                                    Ver Comprobante (Sin precios)
                                </DropdownItem>
                                <DropdownItem
                                    href="#pablo"
                                    onClick={(e) => {
                                        e.preventDefault(e);
                                        getFact(item.id, true);
                                    }}
                                >
                                    <BsTelegram />
                                    Envíar Comprobante
                                </DropdownItem>
                                <DropdownItem
                                    href="#pablo"
                                    onClick={(e) => {
                                        e.preventDefault(e);
                                        anularFact(item.id, parseInt(item.t_fact) === -1 ? true : false);
                                    }}
                                    disabled={
                                        parseInt(item.id_fact_asoc) !== 0 ||
                                        parseFloat(item.total_fact) < 0 ||
                                        tieneItemsAnulados(item.details)
                                            ? true
                                            : false
                                    }
                                >
                                    <BsFillXCircleFill />
                                    {parseInt(item.t_fact) === -1 ? 'Anular Recibo' : 'Anular Comprobante'}
                                </DropdownItem>
                                <DropdownItem
                                    href="#pablo"
                                    onClick={(e) => {
                                        e.preventDefault(e);
                                        setModal2(!modal2);
                                    }}
                                    disabled={
                                        parseInt(item.id_fact_asoc) !== 0 ||
                                        parseFloat(item.total_fact) < 0 ||
                                        item.details.length === 0
                                            ? true
                                            : false
                                    }
                                >
                                    <BsFillXCircleFill />
                                    Anularción parcial
                                </DropdownItem>
                                {parseInt(item.id_fact_asoc) !== 0 ? (
                                    <DropdownItem
                                        href="#pablo"
                                        onClick={(e) => {
                                            e.preventDefault(e);
                                            getFact(item.id_fact_asoc, false);
                                        }}
                                    >
                                        <BsFileEarmarkPdfFill />
                                        {parseInt(item.nota_cred) === 0
                                            ? 'Ver Nota de Crédito'
                                            : 'Ver Comprobante Anulada'}
                                    </DropdownItem>
                                ) : null}
                                <DropdownItem
                                    href="#pablo"
                                    onClick={(e) => {
                                        e.preventDefault(e);
                                        setModal3(true);
                                    }}
                                    disabled={
                                        parseInt(item.id_fact_asoc) !== 0 ||
                                        parseFloat(item.total_fact) < 0 ||
                                        item.pagos.length === 0
                                            ? true
                                            : false
                                    }
                                >
                                    <BsCurrencyExchange />
                                    Cambiar Forma de Pago
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    )}
                </td>
            </tr>
            <ModalInvoiceDetails setModal={setModal1} modal={modal1} item={item} />
            <ModalDevPart
                modal={modal2}
                toggle={() => setModal2(!modal2)}
                idFact={item.id}
                actualizar={() => setActualizar(!actualizar)}
                factura={item}
            />
            <ModalFormasPagos
                modal={modal3}
                toggle={() => setModal3(!modal3)}
                idFact={item.id}
                factura={item}
                actualizar={() => setActualizar(!actualizar)}
                variosPagos={item.pagos}
            />
        </>
    );
};

export default FilaVentas;
