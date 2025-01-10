import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Spinner } from 'reactstrap';
import ListadoTable from '../../../../components/subComponents/Listados/ListadoTable';
import axios from 'axios';
import UrlNodeServer from '../../../../api/NodeServer';
import HeroSliderRow from './row';

const ListHeroSlider = ({
    setIsOpenForm,
    setHeroSliderData,
    setAlertar,
    setMsgStrong,
    setMsgGralAlert,
    setSuccessAlert
}) => {
    const [loading, setLoading] = useState(false)
    const [heroSliders, setHeroSliders] = useState([])

    const getList = async () => {
        setLoading(true)
        await axios.get(UrlNodeServer.heroSliderDir.heroSlider + "/" + 1, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('user-token')
            }
        }).then(res => {
            const respuesta = res.data
            const status = respuesta.status
            if (status === 200) {
                const data = respuesta.body
                setHeroSliders(data.data)
            } else {
                setAlertar(true)
                setMsgStrong("Error!")
                setMsgGralAlert("No se pudo obtener la lista de Hero Sliders")
                setSuccessAlert(false)
            }
        }).catch((error) => {
            setAlertar(true)
            setMsgStrong("Error!")
            setMsgGralAlert("No se pudo obtener la lista de Hero Sliders")
            setSuccessAlert(false)
        }).finally(() => {
            setLoading(false)
        })
    }

    useEffect(() => {
        getList()
        // eslint-disable-next-line
    }, [])

    return (
        <>
            {
                loading ?
                    <div style={{ textAlign: "center", marginTop: "100px" }}>
                        <Spinner type="grow" color="primary" style={{ width: "100px", height: "100px" }} /> </div> :
                    <>
                        <Row>
                            <Col md="12">
                                <ListadoTable
                                    titulos={["", "Título", "Descripción", "Link", "Habilitado", ""]}
                                    listado={
                                        heroSliders.length > 0 ? heroSliders.map((heroSlider, key) => {
                                            return (

                                                <HeroSliderRow
                                                    id={key}
                                                    key={key}
                                                    heroSlider={heroSlider}
                                                    getList={getList}
                                                    setHeroSliderData={setHeroSliderData}
                                                />
                                            )
                                        }) : <>
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: "center" }}>
                                                    No hay datos para mostrar
                                                </td>
                                            </tr>
                                        </>
                                    }
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Button
                                    color="primary"
                                    onClick={() => setIsOpenForm(true)}
                                >
                                    Agregar Nueva Oferta
                                </Button>
                            </Col>
                        </Row>
                    </>
            }
        </>
    )
}

export default ListHeroSlider;