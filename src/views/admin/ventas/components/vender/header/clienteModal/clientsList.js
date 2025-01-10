import axios from 'axios';
import React, { useEffect, useState } from 'react';
import UrlNodeServer from '../../../../../../../api/NodeServer';
import { Col, Row, Spinner, Table } from 'reactstrap';
import ClientRow from './clientRow';

const ClientsList = ({ setCliente, postToggled, toggle }) => {
    const [clientes, setClientes] = useState([]);
    const [isWaiting, setIsWaiting] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredClients, setFilteredClients] = useState([]);

    const filterClients = () => {
        const clientsFiltered = clientes.filter((cliente) => {
            return (
                cliente.razsoc.toLowerCase().includes(search.toLowerCase()) || cliente.ndoc.toString().includes(search)
            );
        });
        setFilteredClients(clientsFiltered.length > 10 ? clientsFiltered.slice(0, 10) : clientsFiltered);
    };

    useEffect(() => {
        filterClients();
    }, [search, clientes]);

    useEffect(() => {
        const fetchClients = async () => {
            const response = await axios.get(UrlNodeServer.clientesDir.clientes, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('user-token'),
                },
            });
            const data = await response.data.body.data;
            setClientes(data);
            setFilteredClients(data.length > 10 ? data.slice(0, 10) : data);
            setSearch('');
            setIsWaiting(false);
        };
        fetchClients();
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
                            placeholder="Buscar Cliente"
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
                            Cliente
                        </th>
                    </tr>
                </thead>
                <tbody style={{ minHeight: '500px' }}>
                    {filteredClients.map((cliente, key) => {
                        return <ClientRow key={key} cliente={cliente} setCliente={setCliente} toggle={toggle} />;
                    })}
                </tbody>
            </Table>
        </>
    );
};

export default ClientsList;
