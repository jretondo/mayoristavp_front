import formatMoney from 'Function/NumberFormat';
import React, { useContext, useState } from 'react';
import productSellContext from '../../../../context/productsSell';

const FilaProdSell = ({ id, item }) => {
    const [updateDiscount, setUpdateDiscount] = useState(false);
    const [updateQuantity, setUpdateQuantity] = useState(false);
    const [newDiscount, setNewDiscount] = useState(item.descuento_porcentaje);
    const [newQuantity, setNewQuantity] = useState(item.cant_prod);
    const { RemoveProduct, aplicarDescuento, cambiarCantidad } = useContext(productSellContext);

    const actChangeDiscount = () => {
        setUpdateDiscount(true);
        setTimeout(() => {
            document.getElementById('inpDiscountText').focus();
            document.getElementById('inpDiscountText').select();
        }, 300);
    };

    const actChangeQuantity = () => {
        setUpdateQuantity(true);
        setTimeout(() => {
            document.getElementById('inpQuantityText').focus();
            document.getElementById('inpQuantityText').select();
        }, 300);
    };

    return (
        <tr key={id} style={item.stock - item.cant_prod <= 0 ? { backgroundColor: 'red', color: 'white' } : {}}>
            <td style={{ textAlign: 'center' }}>{item.name}</td>
            <td style={{ textAlign: 'center' }} onDoubleClick={() => actChangeQuantity()}>
                {updateQuantity ? (
                    <input
                        type="number"
                        min={0}
                        id="inpQuantityText"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (parseInt(newQuantity) <= 0) {
                                    setUpdateQuantity(false);
                                    return;
                                }
                                if (isNaN(parseInt(newQuantity))) {
                                    setUpdateQuantity(false);
                                    return;
                                }
                                cambiarCantidad(item.key, newQuantity);
                                setUpdateQuantity(false);
                            }
                            if (e.key === 'Escape') {
                                setUpdateQuantity(false);
                            }
                        }}
                        onBlur={() => {
                            if (parseInt(newDiscount) < 0 || parseInt(newDiscount) > 100) {
                                setUpdateQuantity(false);
                                return;
                            }
                            cambiarCantidad(item.key, newQuantity);
                            setUpdateQuantity(false);
                        }}
                    />
                ) : (
                    item.cant_prod
                )}
            </td>
            <td style={{ textAlign: 'center' }}>
                $ {formatMoney(item.vta_price - (item.vta_price * item.descuento_porcentaje) / 100)}
            </td>
            <td style={{ textAlign: 'center' }} onDoubleClick={() => actChangeDiscount()}>
                {updateDiscount ? (
                    <input
                        type="number"
                        min={0}
                        max={100}
                        id="inpDiscountText"
                        value={newDiscount}
                        onChange={(e) => setNewDiscount(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (parseInt(newDiscount) < 0 || parseInt(newDiscount) > 100) {
                                    setUpdateDiscount(false);
                                    return;
                                }
                                if (isNaN(parseInt(newDiscount))) {
                                    aplicarDescuento(item.key, 0);
                                    setUpdateDiscount(false);
                                    return;
                                }
                                aplicarDescuento(item.key, newDiscount);
                                setUpdateDiscount(false);
                            }
                            if (e.key === 'Escape') {
                                setUpdateDiscount(false);
                            }
                        }}
                        onBlur={() => {
                            if (parseInt(newDiscount) < 0 || parseInt(newDiscount) > 100) {
                                setUpdateDiscount(false);
                                return;
                            }
                            if (isNaN(parseInt(newDiscount))) {
                                aplicarDescuento(item.key, 0);
                                setUpdateDiscount(false);
                                return;
                            }
                            aplicarDescuento(item.key, newDiscount);
                            setUpdateDiscount(false);
                        }}
                    />
                ) : (
                    item.descuento_porcentaje
                )}
            </td>
            {/*
            <td style={{ textAlign: 'center' }}>
                $ {formatMoney((item.vta_price / (1 + item.iva / 100)) * item.cant_prod)}
            </td>
            <td style={{ textAlign: 'center' }}>{item.iva}%</td>
            */}
            <td style={{ textAlign: 'center' }}>
                $ {formatMoney((item.vta_price - (item.vta_price * item.descuento_porcentaje) / 100) * item.cant_prod)}
            </td>
            <td className="text-right">
                <button onClick={() => RemoveProduct(item.key)} className="btn btn-danger" style={{ round: '50%' }}>
                    X
                </button>
            </td>
        </tr>
    );
};

export default FilaProdSell;
