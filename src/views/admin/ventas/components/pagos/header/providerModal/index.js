import React, { useState } from 'react';
import { Button, ButtonGroup, Collapse, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import ButtonOpenCollapse from '../../../../../../../components/buttonOpen';
import { useWindowSize } from '../../../../../../../Hooks/UseWindowSize';
import './styles.css';
import NewProviderForm from './newProviderForm';
import ProvidersList from './providerList';

const ProvedorModal = ({ isOpen, toggle, Provedor, setProvedor }) => {
    const [postToggled, setPostToggled] = useState(false);
    const [isNewProvedor, setIsNewProvedor] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const width = useWindowSize();

    const toggleProvedor = () => setIsNewProvedor(!isNewProvedor);

    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle} size="lg">
                <ModalHeader>
                    <h3>Seleccionar Provedor</h3>
                    <ButtonGroup vertical={width > 1030 ? false : true}>
                        <ButtonOpenCollapse
                            action={toggleProvedor}
                            tittle={'Lista de Provedores'}
                            active={!isNewProvedor}
                        />
                        <ButtonOpenCollapse action={toggleProvedor} tittle={'Nuevo Provedor'} active={isNewProvedor} />
                    </ButtonGroup>
                </ModalHeader>
                <ModalBody>
                    <Collapse isOpen={!isNewProvedor}>
                        <ProvidersList
                            Provedor={Provedor}
                            setProvedor={setProvedor}
                            postToggled={postToggled}
                            toggle={toggle}
                        />
                    </Collapse>
                    <Collapse isOpen={isNewProvedor}>
                        <NewProviderForm
                            isValid={isValid}
                            setIsValid={setIsValid}
                            setPostToggled={setPostToggled}
                            toggleProvedor={toggleProvedor}
                            setProvedor={setProvedor}
                            toggle={toggle}
                        />
                    </Collapse>
                </ModalBody>
                <ModalFooter>
                    <Button
                        style={{ display: `${!isNewProvedor ? 'none' : ''}` }}
                        color="success"
                        disabled={!isValid}
                        type="submit"
                        form="newProviderForm"
                    >
                        Agregar Provedor
                    </Button>
                    <Button color="danger" onClick={toggle}>
                        Cancelar
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default ProvedorModal;
