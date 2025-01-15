import axios from 'axios';
import React, { useEffect, useState } from 'react';
import UrlNodeServer from '../../../../../../../api/NodeServer';
import { Col, Row, Spinner, Table } from 'reactstrap';
import ProviderRow from './providerRow';

const ProvidersList = ({ setProvedor, postToggled, toggle }) => {
    const [Provedors, setProvedors] = useState([]);
    const [isWaiting, setIsWaiting] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredProviders, setFilteredProviders] = useState([]);

    const filterProviders = () => {
        const ProvidersFiltered = Provedors.filter((Provedor) => {
            return (
                Provedor.razsoc.toLowerCase().includes(search.toLowerCase()) ||
                Provedor.ndoc.toString().includes(search)
            );
        });
        setFilteredProviders(ProvidersFiltered.length > 10 ? ProvidersFiltered.slice(0, 10) : ProvidersFiltered);
    };

    useEffect(() => {
        filterProviders();
    }, [search, Provedors]);

    useEffect(() => {
        const fetchProviders = async () => {
            const response = await axios.get(UrlNodeServer.proveedoresDir.proveedores, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            });
            const data = await response.data.body.data;
            setProvedors(data);
            setFilteredProviders(data.length > 10 ? data.slice(0, 10) : data);
            setSearch('');
            setIsWaiting(false);
        };
        fetchProviders();
    }, [postToggled]);

    if (isWaiting) {
        return (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Spinner type="grow" color="primary" style={{ width: '70px', height: '70px' }} />
            </div>
        );
    }

    return (
        <>
            <Row>
                <Col md="12">
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar Provedor"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </Col>
            </Row>
            <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                    <tr>
                        <th scope="col" style={{ textAlign: 'center' }}></th>
                        <th scope="col" style={{ textAlign: 'center' }}>
                            Provedor
                        </th>
                    </tr>
                </thead>
                <tbody style={{ minHeight: '500px' }}>
                    {filteredProviders.map((Provedor, key) => {
                        return <ProviderRow key={key} Provedor={Provedor} setProvedor={setProvedor} toggle={toggle} />;
                    })}
                </tbody>
            </Table>
        </>
    );
};

export default ProvidersList;
