import React, { useEffect, useState } from 'react'
import {
    Col,
    Input,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
} from "reactstrap"

const Paginacion = ({
    plantPaginas,
    setPlantPaginas,
    ultimaPag,
    setUltimaPag,
    pagina,
    setPagina,
    setCall,
    call,
    data
}) => {
    const [cantPag, setCantPag] = useState([])

    useEffect(() => {
        for (let i = 1; i <= ultimaPag; i++) {
            const pag = i
            setCantPag(cantPag => [...cantPag, pag])
        }
        // eslint-disable-next-line
    }, [ultimaPag])

    useEffect(() => {
        ListarPaginas()
        // eslint-disable-next-line
    }, [pagina, ultimaPag, data.totalPag, data.cantTotal])

    const PagePrev = (e) => {
        e.preventDefault()
        if (pagina > 1) {
            setPagina(1)
            setCall(!call)
        }
    }

    const PageNetx = (e) => {
        e.preventDefault()
        if (ultimaPag > pagina) {
            setPagina(ultimaPag)
            setCall(!call)
        }
    }

    const ChangePage = (e, page) => {
        e.preventDefault()
        if (page !== pagina) {
            setPagina(page)
            setCall(!call)
        }
    }

    const ListarPaginas = () => {
        if (data.totalPag) {
            setUltimaPag(data.totalPag)
            setPlantPaginas(
                data.cantTotal.map((paginaList, key) => {
                    return (
                        <PaginationItem className={pagina === paginaList ? "active" : ""} key={key}>
                            <PaginationLink
                                href="#"
                                onClick={e => ChangePage(e, paginaList)}
                            >
                                {paginaList}
                            </PaginationLink>
                        </PaginationItem>
                    )
                })
            )
        }
    }

    return (
        <>
            <Row>
                <Col md="4">
                <div>
                <span className="text-muted">
                    Ir a la página: 
                    <Input
                        type="select"
                        name="select"
                        value={pagina}
                        onChange={e => ChangePage(e, parseInt(e.target.value))}
                        >
                            {ultimaPag && cantPag.map((pag, key) => {
                                return (
                                    <option key={key} value={pag}>
                                        {pag}
                                    </option>
                                )
                            }
                        )}
                    </Input>
                </span>
            </div>
                </Col>
           
            <Col md="8">
            <nav aria-label="...">
                <Pagination
                    className="pagination justify-content-end mb-0"
                    listClassName="justify-content-end mb-0"
                >
                    <PaginationItem className={pagina === 1 ? "disabled" : ""}>
                        <PaginationLink
                            href="#"
                            onClick={e => PagePrev(e)}
                            tabIndex="-1"
                        >
                            <i className="fas fa-angle-double-left" />
                            <span className="sr-only">Primero</span>
                        </PaginationLink>
                    </PaginationItem>

                    {plantPaginas}

                    <PaginationItem className={pagina === ultimaPag ? "disabled" : ""}>
                        <PaginationLink
                            href="#"
                            onClick={e => PageNetx(e)}
                        >
                            <i className="fas fa-angle-double-right" />
                            <span className="sr-only">Último</span>
                        </PaginationLink>
                    </PaginationItem>
                </Pagination>
            </nav>
                </Col>
                </Row>
        </>
    )
}

export default Paginacion