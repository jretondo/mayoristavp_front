import React from 'react'
import {
    Row,
    Col,
    UncontrolledTooltip,
} from "reactstrap"

const PlantFamily = ({ id, categoria, categoriaNvo, setCategoriaNvo }) => {

    const SelectCategoria = (e, categoria) => {
        e.preventDefault()
        setCategoriaNvo(categoria)
    }

    return (
        <Col md="6" key={id}>
            <button
                className="btn-icon-clipboard"
                id={"cat" + id}
                type="button"
                style={categoriaNvo !== categoria.family ? { padding: "15px", transition: "0.6s ease" } : { padding: "15px", transition: "0.6s ease", background: "#db2929" }}
                onClick={e => SelectCategoria(e, categoria.family)}
            >
                <Row>
                    <Col>
                        <span style={categoriaNvo !== categoria.family ? { fontWeight: "bold", transition: "0.6s ease" } : { fontWeight: "bold", transition: "0.6s ease", color: "white" }}>{categoria.family}</span>

                    </Col>
                    <Col style={{ textAlign: "right" }}>
                        <i style={categoriaNvo !== categoria.family ? { transition: "0.6s ease" } : { transition: "0.6s ease", color: "white" }} className="fas fa-copy"></i>
                    </Col>
                </Row>

            </button>
            <UncontrolledTooltip
                delay={0}
                trigger="hover focus"
                target={"cat" + id}
                placement="top"
            >
                {
                    categoriaNvo !== categoria.family ?
                        "Copiar categoria" :
                        "Categoría copiada"
                }

            </UncontrolledTooltip>
        </Col>
    )
}

export default PlantFamily