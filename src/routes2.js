import Index from 'views/admin/dashboard';
import ProductsItems from 'views/admin/productos';
import Proveedores from 'views/admin/proveedores';
import Clientes from 'views/admin/clientes';
import PuntosVenta from 'views/admin/puntoVenta';
import Ventas from 'views/admin/ventas';
import UserAdmin from 'views/admin/userAdmin';
import Stock from 'views/admin/stock';
import HeroSlider from 'views/admin/heroSlider';
import Cheques from 'views/admin/cheques';

var routes = [
    {
        path: '/index',
        name: 'Dashboard',
        icon: 'ni ni-tv-2 text-blue',
        component: Index,
        layout: process.env.PUBLIC_URL + '/admin',
        id: 0,
    },
    {
        path: '/ventas',
        name: 'Ventas',
        icon: 'ni ni-cart text-teal',
        component: Ventas,
        layout: process.env.PUBLIC_URL + '/admin',
        id: 3,
    },
    {
        path: '/stock',
        name: 'Stock',
        icon: 'ni ni-box-2 text-red',
        component: Stock,
        layout: process.env.PUBLIC_URL + '/admin',
        id: 9,
    },
    {
        path: '/puntosVenta',
        name: 'Puntos de Venta',
        icon: 'ni ni-shop text-green',
        component: PuntosVenta,
        layout: process.env.PUBLIC_URL + '/admin',
        id: 1,
    },
    {
        path: '/productItems',
        name: 'Lista de Productos',
        icon: 'ni ni-bag-17 text-red',
        component: ProductsItems,
        layout: process.env.PUBLIC_URL + '/admin',
        id: 2,
    },
    {
        path: '/proveedores',
        name: 'Proveedores',
        icon: 'ni ni-single-02 text-blue',
        component: Proveedores,
        layout: process.env.PUBLIC_URL + '/admin',
        id: 4,
    },
    {
        path: '/clientes',
        name: 'Clientes',
        icon: 'ni ni-single-02 text-teal',
        component: Clientes,
        layout: process.env.PUBLIC_URL + '/admin',
        id: 5,
    },
    {
        path: '/user-admin',
        name: 'Administración de Usuarios',
        icon: 'ni ni-single-02 text-blue',
        component: UserAdmin,
        layout: process.env.PUBLIC_URL + '/admin',
        id: 8,
    },
    {
        path: '/hero-slider',
        name: 'Administración de Ofertas',
        icon: 'ni ni-bag-17 text-red',
        component: HeroSlider,
        layout: process.env.PUBLIC_URL + '/admin',
        id: 10,
    },
    {
        path: '/bank-cheks',
        name: 'Administración de Cheques',
        icon: 'ni ni-money-coins text-blue',
        component: Cheques,
        layout: process.env.PUBLIC_URL + '/admin',
        id: 11,
    },
];
export default routes;
