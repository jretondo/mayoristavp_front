import UrlNodeServer from 'api/NodeServer';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ProdSellContext from './index';
import React from 'react';
import moment from 'moment';

const ProdSellProvider = ({ children }) => {
    const [productsSellList, setProductsSellList] = useState([]);
    const [totalPrecio, setTotalPrecio] = useState(0);
    const [error, setError] = useState();
    const [orderId, setOrderId] = useState('');
    const [sinStock, setSinStock] = useState(0);

    const NewProdSell = async (text, cant) => {
        setError();
        await axios
            .get(UrlNodeServer.productsDir.products + `/1?query=${text}&cantPerPage=1&stock=true`, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then(async (res) => {
                const respuesta = res.data;
                const status = respuesta.status;
                if (status === 200) {
                    const stockProd = respuesta.body.data[0].stock;
                    const stockAnterior = getQuantityProduct(respuesta.body.data[0].id_prod);
                    const stockDisponible = stockProd - stockAnterior;
                    if (parseInt(stockAnterior) + parseInt(cant) > stockProd) {
                        swal(
                            'Error!',
                            'La cantidad de productos a vender supera el stock disponible. Controle la cantidad a vender! Stock Disponible: ' +
                                stockDisponible,
                            'error',
                        );
                        return;
                    }

                    const data = {
                        ...respuesta.body.data[0],
                        descuento_porcentaje: 0,
                    };
                    if (parseInt(data.unidad) === 0) {
                        data.cant_prod = cant;
                        data.key = Math.random() * parseFloat(moment(new Date()).format('YYYYMMDDHHmmssms'));
                        setProductsSellList((productsSellList) => [...productsSellList, data]);
                    } else if (parseInt(data.unidad) === 1) {
                        swal({
                            text: 'Cantidad de kilos a vender',
                            content: 'input',
                            button: {
                                text: 'Ingresar',
                                closeModal: false,
                            },
                        })
                            .then((cantidad) => {
                                if (parseFloat(cantidad) > 0) {
                                    data.cant_prod = parseFloat(cantidad);
                                    data.key =
                                        Math.random() * parseFloat(moment(new Date()).format('YYYYMMDDHHmmssms'));
                                    setProductsSellList((productsSellList) => [...productsSellList, data]);
                                    swal.stopLoading();
                                    swal.close();
                                } else {
                                    swal(
                                        'Error!',
                                        'Hubo un error. Controle que haya colocado un número válido!',
                                        'error',
                                    );
                                }
                            })
                            .catch(() => {
                                swal('Error!', 'Hubo un error. Controle que haya colocado un número válido!', 'error');
                            });
                    } else if (parseInt(data.unidad) === 2) {
                        swal({
                            text: 'Cantidad de litros a vender',
                            content: 'input',
                            button: {
                                text: 'Ingresar',
                                closeModal: false,
                            },
                        })
                            .then((cantidad) => {
                                if (parseFloat(cantidad) > 0) {
                                    data.cant_prod = parseFloat(cantidad);
                                    data.key =
                                        Math.random() * parseFloat(moment(new Date()).format('YYYYMMDDHHmmssms'));
                                    setProductsSellList((productsSellList) => [...productsSellList, data]);
                                    swal.stopLoading();
                                    swal.close();
                                } else {
                                    swal(
                                        'Error!',
                                        'Hubo un error. Controle que haya colocado un número válido!',
                                        'error',
                                    );
                                }
                            })
                            .catch(() => {
                                swal('Error!', 'Hubo un error. Controle que haya colocado un número válido!', 'error');
                            });
                    }
                }
            })
            .catch((err) => {
                setError(err);
            });
    };

    const getProductsFromOrderId = async (id) => {
        await axios
            .get(UrlNodeServer.orders + `/${id}`, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            })
            .then((res) => {
                const respuesta = res.data;
                const status = respuesta.status;
                if (status === 200) {
                    const data = respuesta.body.data;
                    const items = data.items;
                    if (items && items.length > 0) {
                        items.forEach((item) => {
                            const data = {
                                ...item,
                                descuento_porcentaje: 0,
                            };
                            data.cant_prod = item.cant_prod;
                            data.key = Math.random() * parseFloat(moment(new Date()).format('YYYYMMDDHHmmssms'));
                            setProductsSellList((productsSellList) => [...productsSellList, data]);
                        });
                    }
                }
            });
    };

    const getQuantityProduct = (id, id_actual) => {
        let stock = 0;
        productsSellList.forEach((item) => {
            if (item.id_prod === id && item.key !== id_actual) {
                stock += parseInt(item.cant_prod);
            }
        });
        return stock;
    };

    const RemoveProduct = (key) => {
        const newList = productsSellList.filter((item) => {
            return item.key !== key;
        });
        setProductsSellList(newList);
    };

    const aplicarDescuento = (key, descuento) => {
        const newList = productsSellList.map((item) => {
            if (item.key === key) {
                item.descuento_porcentaje = descuento;
            }
            return item;
        });
        setProductsSellList(newList);
    };

    const cambiarCantidad = (key, cantidad) => {
        const stockProd = getQuantityProduct(productsSellList.find((item) => item.key === key).id_prod, key);
        const newList = productsSellList.map((item) => {
            if (item.key === key) {
                const stockDisponible = parseInt(item.stock) - parseInt(stockProd);
                if (parseInt(cantidad) > stockDisponible) {
                    swal(
                        'Error!',
                        'La cantidad de productos a vender supera el stock disponible. Controle la cantidad a vender! Stock Disponible: ' +
                            stockDisponible,
                        'error',
                    );
                    return item;
                }
                item.cant_prod = cantidad;
            }
            return item;
        });
        setProductsSellList(newList);
    };

    const cancelarCompra = () => {
        setProductsSellList([]);
        setTotalPrecio(0);
        setError();
    };

    useEffect(() => {
        let totalSinStock = 0;
        productsSellList.forEach((item) => {
            if (parseInt(item.stock) < parseInt(item.cant_prod)) {
                totalSinStock++;
            }
        });
        setSinStock(totalSinStock);
    }, [productsSellList]);

    return (
        <ProdSellContext.Provider
            value={{
                NewProdSell,
                productsSellList,
                RemoveProduct,
                totalPrecio,
                error,
                cancelarCompra,
                aplicarDescuento,
                setTotalPrecio,
                cambiarCantidad,
                getProductsFromOrderId,
                orderId,
                setOrderId,
                sinStock,
            }}
        >
            {children}
        </ProdSellContext.Provider>
    );
};
export default ProdSellProvider;
