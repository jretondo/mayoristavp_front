import React, { useEffect, useState } from 'react';
import { Button, Col, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import UrlNodeServer from '../../../api/NodeServer';
import InputSearch from '../../../components/customInputs/InputSearch';
import swal from 'sweetalert';

const FormHeroSlider = ({
    setIsOpenForm,
    setIsLoading,
    HeroSliderData,
    setHeroSliderData,
    setAlertar,
    setMsgStrong,
    setMsgGralAlert,
    setSuccessAlert
}) => {
    const [title, setTitle] = useState(HeroSliderData?.title ? HeroSliderData.title : "")
    const [subtitle, setSubtitle] = useState(HeroSliderData?.subtitle ? HeroSliderData.subtitle : "")
    const [subcategory, setSubcategory] = useState("")
    const [type, setType] = useState(HeroSliderData ? HeroSliderData.type : 0)
    const [subcategoryList, setSubcategoryList] = useState([])
    const [imgUrl, setImgUrl] = useState()
    const [product, setProduct] = useState("")
    const [productList, setProductList] = useState([])

    const getSubcategories = async () => {
        await axios.get(UrlNodeServer.productsDir.sub.marcas, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('user-token')
            }
        }).then(res => {
            const respuesta = res.data
            const status = respuesta.status
            if (status === 200) {
                const data = respuesta.body
                setSubcategoryList(data)
            } else {
                setAlertar(true)
                setMsgStrong("Error!")
                setMsgGralAlert("No se pudo obtener la lista de marcas")
                setSuccessAlert(false)
            }
        }).catch((error) => {
            setSubcategoryList([])
        }).finally(() => {
        })
    }

    const getProducts = async () => {
        await axios.get(UrlNodeServer.productsDir.products, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('user-token')
            }
        }).then(res => {
            const respuesta = res.data
            const status = respuesta.status
            if (status === 200) {
                const data = respuesta.body.data
                setProductList(data)
            } else {
                setAlertar(true)
                setMsgStrong("Error!")
                setMsgGralAlert("No se pudo obtener la lista de productos")
                setSuccessAlert(false)
            }
        }).catch((error) => {
            setSubcategoryList([])
        }).finally(() => {
        })
    }

    const categorySearchFn = (category, searchedText) => {
        if ((category.category).toLowerCase().includes(searchedText.toLowerCase())) {
            return category
        }
    }

    const productSearchFn = (product, searchedText) => {
        if ((product.name).toLowerCase().includes(searchedText.toLowerCase()) || (product.subcategory).toLowerCase().includes(searchedText.toLowerCase())) {
            return product
        }
    }

    const submitForm = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        if (parseInt(type) === 1 && !subcategory) {
            setIsLoading(false)
            swal({
                title: "Error",
                text: "Debe seleccionar una marca",
                icon: "error",
                button: "Aceptar"
            })
            return
        } else if (parseInt(type) === 2 && !product) {
            setIsLoading(false)
            swal({
                title: "Error",
                text: "Debe seleccionar un producto",
                icon: "error",
                button: "Aceptar"
            })
            return

        } else {
            if (HeroSliderData && (imgUrl === UrlNodeServer.publicFolder.heroImages + HeroSliderData.image)) {
                const formData = new FormData();
                HeroSliderData.id && formData.append("id", HeroSliderData.id);
                formData.append("title", title);
                formData.append("subtitle", subtitle);
                formData.append("type", type);
                let urlStr = ""
                switch (parseInt(type)) {
                    case 0:
                        urlStr = ""
                        break;
                    case 1:
                        urlStr = `/catalogo/${subcategory.category}`
                        break;
                    case 2:
                        urlStr = `/product/${product.id_prod}`
                        break;
                    default:
                        break;
                }
                formData.append("url", urlStr);
                console.log('urlStr :>> ', urlStr);
                async function postData(url = '', data = {}) {
                    const response = await fetch(url, {
                        method: 'POST',
                        body: data,
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('user-token')
                        }
                    });
                    return response;
                }

                postData(UrlNodeServer.heroSliderDir.heroSlider, formData).then(res => {
                    const respuesta = res
                    const status = respuesta.status
                    if (status === 200) {
                        swal({
                            title: "Exito",
                            text: "Oferta subida correctamente",
                            icon: "success",
                            button: "Aceptar"
                        })
                    } else {
                        swal({
                            title: "Error",
                            text: "Error al subir la oferta",
                            icon: "error",
                            button: "Aceptar"
                        })
                    }
                }).catch((error) => {
                    console.log('error :>> ', error);
                    swal({
                        title: "Error",
                        text: "Error al subir la oferta",
                        icon: "error",
                        button: "Aceptar"
                    })
                }).finally(() => {
                    setIsLoading(false)
                    HeroSliderData && setIsOpenForm(false)
                    setHeroSliderData(false)
                    setTitle("")
                    setSubtitle("")
                    setSubcategory("")
                    setType(0)
                    setImgUrl(false)
                })
            } else {
                fetch(imgUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const filemini = new File([blob], "ofertaDiaria.jpg", {
                            type: 'image/jpeg'
                        });
                        const formData = new FormData();
                        HeroSliderData.id && formData.append("id", HeroSliderData.id);
                        formData.append("hero", filemini);
                        formData.append("title", title);
                        formData.append("subtitle", subtitle);
                        formData.append("type", type);
                        let urlStr = ""
                        switch (parseInt(type)) {
                            case 0:
                                urlStr = ""
                                break;
                            case 1:
                                urlStr = `/catalogo/${subcategory.category}`
                                break;
                            case 2:
                                urlStr = `/product/${product.id_prod}`
                                break;
                            default:
                                break;
                        }
                        formData.append("url", urlStr);
                        console.log('urlStr :>> ', urlStr);

                        async function postData(url = '', data = {}) {
                            const response = await fetch(url, {
                                method: 'POST',
                                body: data,
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem('user-token')
                                }
                            });
                            return response;
                        }
                        postData(UrlNodeServer.heroSliderDir.heroSlider, formData).then(res => {
                            const respuesta = res
                            const status = respuesta.status
                            if (status === 200) {
                                swal({
                                    title: "Exito",
                                    text: "Oferta subida correctamente",
                                    icon: "success",
                                    button: "Aceptar"
                                })
                            } else {
                                swal({
                                    title: "Error",
                                    text: "Error al subir la imagen",
                                    icon: "error",
                                    button: "Aceptar"
                                })
                            }
                        }).catch((error) => {
                            swal({
                                title: "Error",
                                text: "Error al subir la oferta",
                                icon: "error",
                                button: "Aceptar"
                            })
                        }).finally(() => {
                            setIsLoading(false)
                            HeroSliderData && setIsOpenForm(false)
                            setTitle("")
                            setSubtitle("")
                            setSubcategory("")
                            setType(0)
                            setImgUrl(false)
                        })
                    })
            }
        }
    }

    useEffect(() => {
        getSubcategories()
        getProducts()
        // eslint-disable-next-line
    }, [])


    useEffect(() => {
        if (HeroSliderData && HeroSliderData.type === 1) {
            setSubcategory(subcategoryList.find(subcategory => subcategory.category === HeroSliderData.url))
        }
    }, [subcategoryList, HeroSliderData])

    useEffect(() => {
        if (HeroSliderData) {
            setImgUrl(UrlNodeServer.publicFolder.heroImages + HeroSliderData.image)
        }
    }, [HeroSliderData])

    return (
        <>
            <Form onSubmit={submitForm}>
                <Row>
                    <Col md="6" className="text-left">
                        <h2>Nueva Oferta para el e-commerce </h2>
                    </Col>
                    <Col md="6" style={{ textAlign: "right" }}>
                        <Button
                            color="danger"
                            onClick={(e) => {
                                e.preventDefault()
                                setIsOpenForm(false)
                            }}
                        >
                            <i className='fa fa-times'></i>
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <FormGroup>
                            <Label>Titulo</Label>
                            <Input required type="text" value={title} onChange={e => setTitle(e.target.value)} />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <Label>Descripción</Label>
                        <ReactQuill
                            debug='info'
                            placeholder='Escriba o pegue algo...'
                            theme='snow'
                            value={subtitle}
                            onChange={setSubtitle}
                            modules={{
                                toolbar: ['bold', 'italic', 'underline']
                            }}
                        />
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col md="4">
                        <FormGroup>
                            <Label>Tipo de oferta</Label>
                            <Input value={type} onChange={e => setType(e.target.value)} type="select">
                                <option value={0}>Todo el catalogo</option>
                                <option value={1}>Marca</option>
                                <option value={2}>Producto</option>
                            </Input>
                        </FormGroup>
                    </Col>
                    <Col md="8">
                        <FormGroup>
                            {parseInt(type) === 1 && <Label>Marca</Label>}
                            {parseInt(type) === 2 && <Label>Producto</Label>}
                            {
                                parseInt(type) === 1 &&
                                <InputSearch
                                    id="order_2"
                                    itemsList={subcategoryList}
                                    itemSelected={subcategory}
                                    title={""}
                                    placeholderInput={"Buscar..."}
                                    getNameFn={((category) => category.category)}
                                    setItemSelected={setSubcategory}
                                    searchFn={categorySearchFn}
                                />
                            }
                            {
                                parseInt(type) === 2 &&
                                <InputSearch
                                    id="order_2"
                                    itemsList={productList}
                                    itemSelected={product}
                                    title={""}
                                    placeholderInput={"Buscar..."}
                                    getNameFn={((product) => `${product.name} (${product.subcategory})`)}
                                    setItemSelected={setProduct}
                                    searchFn={productSearchFn}
                                />
                            }
                        </FormGroup>
                    </Col>
                </Row>
                <h6 className="heading-small text-muted mb-4">
                    Imagen de Fondo
                </h6>
                <Row>
                    <div className="col-lg-12" style={!imgUrl ? { display: "none" } : { display: "block" }}>
                        <Row>
                            <Col md="6" style={{ border: "2px solid black" }}>
                                <Button
                                    color="danger"
                                    style={{ position: "absolute", right: "-20px", top: "-10px", zIndex: "999" }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setImgUrl(false)
                                    }}
                                >
                                    <i className='fa fa-times'></i>
                                </Button>
                                <img
                                    src={imgUrl ? imgUrl : ""}
                                    style={{ width: "80%" }}
                                    alt="nvaImgMod"
                                />
                            </Col>
                            <Col md="6" className="text-center">
                                <Button
                                    style={{ width: "200px" }}
                                    color="primary"
                                    type="submit"
                                >
                                    {HeroSliderData ? "Modificar" : "Subir"}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                    <hr />

                    <Col md="12" style={imgUrl ? { display: "none", textAlign: "center" } : { display: "block", textAlign: "center" }}>
                        <FormGroup>
                            <Input

                                className="form-control-alternative"
                                id="imgNvaAltmod"
                                type="file"
                                accept=".png"
                                onChange={e => setImgUrl(URL.createObjectURL(e.target.files[0]))}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </Form>
        </>
    )
}
export default FormHeroSlider;