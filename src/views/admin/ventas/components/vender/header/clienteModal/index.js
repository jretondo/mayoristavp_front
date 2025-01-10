import React, { useState } from 'react';
import { Button, ButtonGroup, Collapse, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import ButtonOpenCollapse from '../../../../../../../components/buttonOpen';
import { useWindowSize } from '../../../../../../../Hooks/UseWindowSize';
import './styles.css';
import NewClientForm from './newClientForm';
import ClientsList from './clientsList';

const ClienteModal = ({ isOpen, toggle, cliente, setCliente }) => {
    const [postToggled, setPostToggled] = useState(false);
    const [isNewCliente, setIsNewCliente] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const width = useWindowSize();

    const toggleCliente = () => setIsNewCliente(!isNewCliente);

    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle} size="lg">
                <ModalHeader>
                    <h3>Seleccionar Cliente</h3>
                    <ButtonGroup vertical={width > 1030 ? false : true}>
                        <ButtonOpenCollapse
                            action={toggleCliente}
                            tittle={'Lista de Clientes'}
                            active={!isNewCliente}
                        />
                        <ButtonOpenCollapse action={toggleCliente} tittle={'Nuevo Cliente'} active={isNewCliente} />
                    </ButtonGroup>
                </ModalHeader>
                <ModalBody>
                    <Collapse isOpen={!isNewCliente}>
                        <ClientsList
                            cliente={cliente}
                            setCliente={setCliente}
                            postToggled={postToggled}
                            toggle={toggle}
                        />
                    </Collapse>
                    <Collapse isOpen={isNewCliente}>
                        <NewClientForm
                            isValid={isValid}
                            setIsValid={setIsValid}
                            setPostToggled={setPostToggled}
                            toggleCliente={toggleCliente}
                            setCliente={setCliente}
                            toggle={toggle}
                        />
                    </Collapse>
                </ModalBody>
                <ModalFooter>
                    <Button
                        style={{ display: `${!isNewCliente ? 'none' : ''}` }}
                        color="success"
                        disabled={!isValid}
                        type="submit"
                        form="newClientForm"
                    >
                        Agregar Cliente
                    </Button>
                    <Button color="danger" onClick={toggle}>
                        Cancelar
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default ClienteModal;
