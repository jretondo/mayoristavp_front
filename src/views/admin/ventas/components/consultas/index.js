import React, { useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import HeaderListaCons from './header';
import ListaCons from './lista';

const ConsultaVentasModule = () => {
    const [listaCaja, setListaCaja] = useState([])
    const [pagina, setPagina] = useState(1)
    const [loading, setLoading] = useState(false)
        const [actualizar, setActualizar] = useState(false)
    return (
        <Card style={{ marginTop: "30px" }}>
            <CardBody>
                <HeaderListaCons
                    setListaCaja={setListaCaja}
                    pagina={pagina}
                    setLoading={setLoading}
                    actualizar={actualizar}
                />
                <ListaCons
                    listaCaja={listaCaja}
                    pagina={pagina}
                    setPagina={setPagina}
                    loading={loading}
                    setActualizar={setActualizar}
                    actualizar={actualizar}
                />
            </CardBody>
        </Card>
    )
}

export default ConsultaVentasModule