require('dotenv').config();

let host = '';
let publicFiles = '';
const local = 1;
if (process.env.NODE_ENV === 'development') {
    if (local === 1) {
        host = 'http://localhost:3016/api';
        publicFiles = 'http://localhost:3016/static';
    } else {
        host = 'https://api-test.nekoadmin.com.ar/mayoristavp/api';
        publicFiles = 'https://api-test.nekoadmin.com.ar/mayoristavp/static';
    }
} else {
    host = 'https://api-prod.nekoadmin.com.ar/mayoristavp/api';
    publicFiles = 'https://api-prod.nekoadmin.com.ar/mayoristavp/static';
}

const prodImages = publicFiles + '/images/products/';
const heroImages = publicFiles + '/images/heroSlider/';

const publicFolder = {
    prodImages,
    heroImages,
};

const auth = host + '/auth';
const routes = host + '/routes';
const permissions = host + '/permissions';
const ptosVta = host + '/ptosVta';
const products = host + '/products';
const proveedores = host + '/proveedores';
const clientes = host + '/clientes';
const revendedores = host + '/revendedores';
const transportistas = host + '/transportistas';
const usuarios = host + '/user';
const stock = host + '/stock';
const invoices = host + '/invoices';
const heroSlider = host + '/heroSlider';
const cheques = host + '/cheques';

const authDir = {
    auth,
};

const stockDir = {
    stock,
    sub: {
        ultMov: stock + '/ultMov',
        moverStock: stock + '/moverStock',
        ultStockList: stock + '/ultStockList',
        listaStock: stock + '/listaStock',
        stockProd: stock + '/stockProd',
    },
};

const usuariosDir = {
    usuarios,
    sub: {
        details: usuarios + '/details',
        mydata: usuarios + '/mydata',
    },
};

const permissionsDir = {
    permissions,
    sub: {
        list: '/list',
    },
};

const ptosVtaDir = {
    ptosVta,
    sub: {
        details: ptosVta + '/details',
        userPv: ptosVta + '/userPv',
        list: ptosVta + '/list',
        saldosEfvo: ptosVta + '/saldosEfvo',
    },
};

const productsDir = {
    products,
    sub: {
        details: products + '/details',
        variedades: products + '/varList',
        tipos: products + '/getTipos',
        marcas: products + '/getCat',
        familias: products + '/family',
        proveedores: products + '/getGetSubCat',
        varCost: products + '/varCost',
        updateList: products + '/updateList',
        changePorc: products + '/changePorc',
        codBarra: products + '/codBarra',
        cost: products + '/cost',
        pdf: products + '/pdf',
    },
};

const proveedoresDir = {
    proveedores,
    sub: {
        details: proveedores + '/details',
        generateOP: proveedores + '/op',
    },
};

const clientesDir = {
    clientes,
    sub: {
        details: clientes + '/details',
        dataFiscal: clientes + '/dataFiscal',
        ctaCte: clientes + '/ctaCte',
        ctaCteAll: clientes + '/ctaCte/all',
        ctaCteAllExcel: clientes + '/ctaCte/all/excel',
        ctaCteAllPDF: clientes + '/ctaCte/all/pdf',
        payments: clientes + '/payments',
    },
};

const revendedoresDir = {
    revendedores,
    sub: {
        details: clientes + '/details',
    },
};

const transportistasDir = {
    transportistas,
    sub: {
        details: clientes + '/details',
    },
};

const invoicesDir = {
    invoices,
    sub: {
        details: invoices + '/details',
        last: invoices + '/last',
        afipdata: invoices + '/afipData',
        cajaList: invoices + '/cajaList',
        cajaListPDF: invoices + '/cajaListPDF',
        cajaListExcel: invoices + '/cajaListExcel',
        factDataPDF: invoices + '/factDataPDF',
        notaCred: invoices + '/notaCred',
        paytype: invoices + '/paytype',
        dummy: invoices + '/dummy',
        timeout: invoices + '/timeout',
        detFact: invoices + '/detFact',
        notaCredPart: invoices + '/notaCredPart',
        codigoDescuento: invoices + '/codigoDescuento',
        verificaCodigo: invoices + '/verificaCodigo',
        variosPagos: invoices + '/variosPagos',
        resetTokenAfip: invoices + '/resetTokenAfip',
        order: invoices + '/orderPDF',
        categoriasPago: invoices + '/categoriasPago',
    },
};

const routesDir = {
    routes,
    sub: {
        dashboard: routes + '/dashboard',
        changePass: routes + '/changePass',
        clientes: routes + '/clientes',
        productos: routes + '/productos',
        proveedores: routes + '/proveedores',
        ptosVta: routes + '/ptosVta',
        revendedores: routes + '/revendedores',
        stock: routes + '/stock',
        transportistas: routes + '/transportistas',
        userAdmin: routes + '/userAdmin',
    },
};

const heroSliderDir = {
    heroSlider,
    sub: {
        details: heroSlider + '/details',
        enabled: heroSlider + '/enabled',
    },
};

const chequesDir = {
    cheques,
    sub: {
        details: cheques + '/details',
    },
};

const orders = host + '/pedidos';

const UrlNodeServer = {
    publicFolder,
    authDir,
    routesDir,
    permissionsDir,
    ptosVtaDir,
    productsDir,
    proveedoresDir,
    clientesDir,
    revendedoresDir,
    transportistasDir,
    usuariosDir,
    stockDir,
    invoicesDir,
    heroSliderDir,
    chequesDir,
    orders,
};

export default UrlNodeServer;
