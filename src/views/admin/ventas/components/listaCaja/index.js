import React, { useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import FooterListVentas from './footer';
import HeaderListaCaja from './header';
import VentasListMod from './lista';

const ListaCajaModule = ({ moduleActive }) => {
    const [listaCaja, setListaCaja] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(false);
    const [actualizar, setActualizar] = useState(false);
    const [ptosVta, setPtoVta] = useState({ id: 0 });

    return (
        <Card style={{ marginTop: '30px' }}>
            <CardBody>
                <HeaderListaCaja
                    setListaCaja={setListaCaja}
                    pagina={pagina}
                    setLoading={setLoading}
                    actualizar={actualizar}
                    ptosVta={ptosVta}
                    setPtoVta={setPtoVta}
                    moduleActive={moduleActive}
                />
                <VentasListMod
                    listaCaja={listaCaja}
                    pagina={pagina}
                    setPagina={setPagina}
                    loading={loading}
                    setActualizar={setActualizar}
                    actualizar={actualizar}
                />
                <FooterListVentas listaCaja={listaCaja} ptosVta={ptosVta} setPtoVta={setPtoVta} />
            </CardBody>
        </Card>
    );
};

export default ListaCajaModule;
