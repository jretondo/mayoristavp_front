import React, { useEffect, useState } from 'react';
import { Row } from 'reactstrap';
import TotalItemsVtas from './totalItem';

const FooterListVentas = ({ listaCaja }) => {
    const [totalesPlant, setTotalesPlant] = useState(<></>);
    const [totalFinalPlant, setTotalFinalPlant] = useState(<></>);
    const [totalCtaCtePlant, setTotalCtaCtePlant] = useState(<></>);

    useEffect(() => {
        try {
            let efectivoRow = <></>;
            let efectivo = 0;
            let mercadoPagoRow = <></>;
            let mercadoPago = 0;
            let debitoRow = <></>;
            let debito = 0;
            let creditoRow = <></>;
            let credito = 0;
            let ctacteRow = <></>;
            let ctacte = 0;
            let cheque = 0;
            let chequeRow = <></>;
            let transf = 0;
            let transfRow = <></>;

            let totalFinal = 0;

            const totales = listaCaja.totales;
            const totales2 = listaCaja.totales2;
            if (totales2.length > 0) {
                // eslint-disable-next-line
                totales2.map((item) => {
                    if (item.SUMA !== null && parseInt(item.tipo) !== 5 && parseInt(item.tipo) !== 4) {
                        totalFinal = totalFinal + parseFloat(item.SUMA);
                    }
                    switch (parseInt(item.tipo)) {
                        case 0:
                            efectivo = efectivo + parseFloat(item.SUMA);
                            break;
                        case 1:
                            mercadoPago = mercadoPago + parseFloat(item.SUMA);
                            break;
                        case 2:
                            debito = debito + parseFloat(item.SUMA);
                            break;
                        case 3:
                            credito = credito + parseFloat(item.SUMA);
                            break;
                        case 4:
                            ctacte = ctacte + parseFloat(item.SUMA);
                            break;
                        case 6:
                            cheque = cheque + parseFloat(item.SUMA);
                            break;
                        case 7:
                            transf = transf + parseFloat(item.SUMA);
                            break;
                    }
                });
            }
            if (totales.length > 0) {
                // eslint-disable-next-line
                totales.map((item) => {
                    if (item.SUMA !== null && parseInt(item.forma_pago) !== 5 && parseInt(item.forma_pago) !== 4) {
                        totalFinal = totalFinal + parseFloat(item.SUMA);
                    }

                    switch (parseInt(item.forma_pago)) {
                        case 0:
                            efectivo = efectivo + parseFloat(item.SUMA);
                            break;
                        case 1:
                            mercadoPago = mercadoPago + parseFloat(item.SUMA);
                            break;
                        case 2:
                            debito = debito + parseFloat(item.SUMA);
                            break;
                        case 3:
                            credito = credito + parseFloat(item.SUMA);
                            break;
                        case 4:
                            ctacte = ctacte + parseFloat(item.SUMA);
                            break;
                        case 6:
                            cheque = cheque + parseFloat(item.SUMA);
                            break;
                        case 7:
                            transf = transf + parseFloat(item.SUMA);
                            break;
                        default:
                            break;
                    }
                });
            }
            if (totales.length > 0) {
                if (efectivo !== 0) {
                    efectivoRow = <TotalItemsVtas totalId={0} totalImporte={efectivo} colSize={4} />;
                }
                if (mercadoPago !== 0) {
                    mercadoPagoRow = <TotalItemsVtas totalId={1} totalImporte={mercadoPago} colSize={4} />;
                }
                if (debito !== 0) {
                    debitoRow = <TotalItemsVtas totalId={2} totalImporte={debito} colSize={4} />;
                }
                if (credito !== 0) {
                    creditoRow = <TotalItemsVtas totalId={3} totalImporte={credito} colSize={4} />;
                }
                if (ctacte !== 0) {
                    ctacteRow = <TotalItemsVtas totalId={4} totalImporte={ctacte} colSize={6} />;
                }
                if (cheque !== 0) {
                    chequeRow = <TotalItemsVtas totalId={6} totalImporte={cheque} colSize={4} />;
                }
                if (transf !== 0) {
                    transfRow = <TotalItemsVtas totalId={7} totalImporte={transf} colSize={4} />;
                }
                setTotalCtaCtePlant(ctacteRow);
                setTotalFinalPlant(<TotalItemsVtas totalId={8} totalImporte={totalFinal} colSize={6} />);
                const costoRow = <TotalItemsVtas totalId={-1} totalImporte={listaCaja.totalCosto} colSize={4} />;
                const admin = localStorage.getItem('user-admin');
                if (parseInt(admin) === 1) {
                    setTotalesPlant(
                        <>
                            {efectivoRow}
                            {mercadoPagoRow}
                            {debitoRow}
                            {creditoRow}
                            {chequeRow}
                            {transfRow}
                        </>,
                    );
                } else {
                    setTotalesPlant(
                        <>
                            {efectivoRow}
                            {mercadoPagoRow}
                            {debitoRow}
                            {creditoRow}
                            {chequeRow}
                            {transfRow}
                        </>,
                    );
                }
            } else {
                setTotalFinalPlant(<TotalItemsVtas totalId={8} totalImporte={0} colSize={6} />);
                setTotalCtaCtePlant(<TotalItemsVtas totalId={4} totalImporte={0} colSize={6} />);
            }
        } catch (error) {
            console.log('error :>> ', error);
            setTotalFinalPlant(<TotalItemsVtas totalId={8} totalImporte={0} colSize={6} />);
            setTotalCtaCtePlant(<TotalItemsVtas totalId={4} totalImporte={0} colSize={6} />);
        }
    }, [listaCaja]);

    return (
        <>
            <Row>{totalesPlant}</Row>
            <hr />
            <Row>
                {totalFinalPlant}
                {totalCtaCtePlant}
            </Row>
        </>
    );
};

export default FooterListVentas;
