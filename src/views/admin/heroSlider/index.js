import React, { useEffect, useState } from 'react';
import Header from '../../../components/Headers/Header';
import { Card, CardHeader, Container, Spinner } from 'reactstrap';
import AlertaForm from 'components/subComponents/Alertas/Alerta1'
import FormHeroSlider from './form';
import ListHeroSlider from './list';

const HeroSlider = () => {
    const [alertar, setAlertar] = useState(false)
    const [msgStrongAlert, setMsgStrong] = useState("")
    const [msgGralAlert, setMsgGralAlert] = useState("")
    const [successAlert, setSuccessAlert] = useState(false)

    const [isLoading, setIsLoading] = useState(false)
    const [isOpenForm, setIsOpenForm] = useState(false)

    const [HeroSliderData, setHeroSliderData] = useState(false)

    useEffect(() => {
        HeroSliderData && setIsOpenForm(true)
    }, [HeroSliderData])
    return (
        <>
            <AlertaForm
                success={successAlert}
                msgStrong={msgStrongAlert}
                msgGral={msgGralAlert}
                alertar={alertar}
            />
            <Header />
            <Container className="mt--7" fluid>
                {
                    isLoading ?
                        <div style={{ textAlign: "center", marginTop: "100px" }}>
                            <Spinner type="grow" color="primary" style={{ width: "100px", height: "100px" }} /> </div> :
                        <>
                            <Card className="shadow">
                                <CardHeader className="border-0">
                                    {isOpenForm ?
                                        <FormHeroSlider
                                            setIsLoading={setIsLoading}
                                            setIsOpenForm={setIsOpenForm}
                                            HeroSliderData={HeroSliderData}
                                            setAlertar={setAlertar}
                                            setMsgStrong={setMsgStrong}
                                            setMsgGralAlert={setMsgGralAlert}
                                            setSuccessAlert={setSuccessAlert}

                                        /> :
                                        <ListHeroSlider
                                            setIsOpenForm={setIsOpenForm}
                                            setIsLoading={setIsLoading}
                                            setHeroSliderData={setHeroSliderData}
                                            setAlertar={setAlertar}
                                            setMsgStrong={setMsgStrong}
                                            setMsgGralAlert={setMsgGralAlert}
                                            setSuccessAlert={setSuccessAlert}
                                        />}
                                </CardHeader>
                            </Card>
                        </>


                }
            </Container>
        </>
    );
}

export default HeroSlider