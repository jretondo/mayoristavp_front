import axios from 'axios';
import React from 'react';
import {
    Badge,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Media,
    UncontrolledDropdown
} from "reactstrap";
import UrlNodeServer from '../../../../api/NodeServer';

const HeroSliderRow = ({
    id,
    heroSlider,
    getList,
    setHeroSliderData
}) => {

    const toggleEnabled = async (e, id, enabled, title) => {
        e.preventDefault()
        const data = {
            id: id,
            enabled: parseInt(enabled) === 1 ? 0 : 1
        }
        await axios.put(UrlNodeServer.heroSliderDir.sub.enabled, data, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('user-token')
            }
        }).then(res => {
            const respuesta = res.data
            const status = respuesta.status
            if (status === 200) {
                getList()
            } else {
                alert(respuesta.body)
            }
        }).catch((error) => {
            alert("Error interno")
        }).finally(() => {
        })
    }

    const viewDetails = (e, heroSlider) => {
        e.preventDefault()
        setHeroSliderData(heroSlider)
        window.scrollTo(0, 0)
    }

    const deleteHeroSlider = async (e, id, title) => {
        e.preventDefault()
        if (window.confirm("¿Está seguro de eliminar el slider " + title + "?")) {
            await axios.delete(UrlNodeServer.heroSliderDir.heroSlider + "/" + id, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('user-token')
                }
            }).then(res => {
                const respuesta = res.data
                const status = respuesta.status
                if (status === 200) {
                    getList()
                } else {
                    alert(respuesta.body)
                }
            }).catch((error) => {
                alert("Error interno")
            }).finally(() => {
            })
        }
    }

    return (<>
        <tr key={id}>
            <th scope="row">
                <Media className="align-items-center">
                    <Media>
                        <a
                            className="avatar rounded-circle mr-3"
                            href="#pablo"
                            onClick={e => {
                                e.preventDefault()
                            }}
                        >
                            <img
                                alt="..."
                                src={UrlNodeServer.publicFolder.heroImages + heroSlider.image}
                                style={{ width: "100%", height: "100%" }}
                            />
                        </a>
                        <span className="mb-0 text-sm" style={{ marginLeft: "10px" }}>
                            <span style={{ fontSize: "17px" }}  > {heroSlider.name}</span>
                        </span>
                    </Media>
                </Media>
            </th>
            <td style={{ textAlign: "center" }}>
                {heroSlider.title}
            </td>
            <td style={{ textAlign: "center" }}>
                {heroSlider.description}
            </td>
            <td style={{ textAlign: "center" }}>
                {heroSlider.type === 1 ? "/shop-grid-standard-sort/" + heroSlider.url : "/shop-grid-standard-tag/" + heroSlider.url}
            </td>
            <td style={{ textAlign: "center" }}>
                <Badge color="" className="badge-dot">
                    {
                        heroSlider.active === 1 ?
                            <>
                                <i className="bg-success" style={{ width: "15px", height: "15px" }} />
                            </> :
                            <>
                                <i className="bg-danger" style={{ width: "15px", height: "15px" }} />
                            </>
                    }
                </Badge>
            </td>
            <td className="text-right">
                <UncontrolledDropdown>
                    <DropdownToggle
                        className="btn-icon-only text-light"
                        href="#pablo"
                        role="button"
                        size="sm"
                        color=""
                        onClick={e => e.preventDefault()}
                    >
                        <i className="fas fa-ellipsis-v" />
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-arrow" right>
                        <DropdownItem
                            href="#pablo"
                            onClick={e => toggleEnabled(e, heroSlider.id, heroSlider.active, heroSlider.title)}
                        >
                            <Badge color="" className="badge-dot mr-4">
                                {
                                    heroSlider.active === 1 ?
                                        <>
                                            <i className="bg-danger" style={{ width: "10px", height: "10px" }} />
                                            Desactivar
                                        </> :
                                        <>
                                            <i className="bg-success" style={{ width: "10px", height: "10px" }} />
                                            Activar
                                        </>
                                }

                            </Badge>
                        </DropdownItem>
                        <DropdownItem
                            href="#pablo"
                            onClick={e => viewDetails(e, heroSlider)}
                        >
                            <i className="fas fa-search"></i>
                            Ver detalles
                        </DropdownItem>
                        <DropdownItem
                            href="#pablo"
                            onClick={e => deleteHeroSlider(e, heroSlider.id, heroSlider.title)}
                        >
                            <i className="fas fa-trash-alt"></i>
                            Eliminar
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </td>
        </tr>
    </>)
}

export default HeroSliderRow;