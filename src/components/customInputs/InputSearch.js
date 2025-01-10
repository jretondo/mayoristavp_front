import React, { useEffect, useState } from 'react';
import { Button, Collapse, FormGroup, Input, InputGroup, InputGroupAddon, Label, Row } from 'reactstrap';

const InputSearch = ({ itemsList = [], itemSelected = {}, title = "", placeholderInput = "", getNameFn, setItemSelected, searchFn, strict, cbStrict, id, nextFn }) => {
    const [textSearched, setTextSearched] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [filteredList, setFilteredList] = useState(itemsList)

    const changeText = (e, keyUp) => {
        const value = keyUp ? textSearched : e.target.value
        setTextSearched(value)
        if (value === "") {
            const newList = itemsList.slice(0, 20)
            setFilteredList(newList)
        } else {
            try {
                const newList = itemsList.filter((item) => searchFn(item, value)).slice(0, 20)
                setFilteredList(newList)
                if (strict) {
                    newList.length === 0 && setFilteredList([])
                } else {
                    newList.length === 0 && setFilteredList(itemsList)
                }
            } catch (error) {
                setFilteredList(itemsList)
            }
        }
    }

    const KeyUp = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault()
            try {
                setItemSelected(JSON.parse(e.target.value));
            } catch (error) {
            }
        }
    }

    const escapeHandler = (e) => {
        if (e.keyCode === 27) {
            setIsOpen(!isOpen)
        } else if (e.keyCode === 13 || e.keyCode === 9) {
            e.preventDefault()
            filteredList.length > 0 && setItemSelected(filteredList[0])
            setFilteredList(itemsList)
            nextFn && nextFn()
        } else {
            setIsOpen(true)
        }
    }

    useEffect(() => {
        const newList = itemsList.slice(0, 20)
        setFilteredList(newList)
    }, [itemsList])

    useEffect(() => {
        !itemSelected && changeText(false, true)
        // eslint-disable-next-line
    }, [itemSelected])

    return (
        <FormGroup style={!title ? { marginBottom: "0px" } : {}}>
            {title && <Label for="searchInp">{title}</Label>}
            {itemSelected ?
                <Row>
                    <InputGroup>
                        <Input disabled value={getNameFn(itemSelected)} />
                        <InputGroupAddon addonType="append">
                            <Button
                                onClick={e => {
                                    e.preventDefault();
                                    setItemSelected(false);
                                }}
                                color="danger"
                            >X</Button>
                        </InputGroupAddon>
                    </InputGroup>
                </Row> :
                <> <Input
                    type="text"
                    id={id ? id : "searchInp"}
                    placeholder={placeholderInput}
                    value={textSearched}
                    onChange={changeText}
                    //onBlur={leaveHandler}
                    onFocus={(e) => {
                        e.target.select()
                        setIsOpen(true)
                    }}
                    onKeyDown={escapeHandler}
                />
                    <Collapse
                        isOpen={isOpen}
                        style={{ position: "absolute", zIndex: 5, width: "92%" }}
                    >
                        <FormGroup>
                            <Input
                                type="select"
                                multiple
                                onFocus={() => setIsOpen(true)}
                                onChange={(e) => {
                                    setItemSelected(JSON.parse(e.target.value));
                                }}
                                onKeyUp={e => KeyUp(e)}
                                onBlur={() => setIsOpen(false)}

                            >
                                {filteredList.length > 0 && filteredList.map((item, key) => {
                                    return (
                                        <option
                                            key={key}
                                            value={JSON.stringify(item)}
                                        >
                                            {getNameFn(item)}
                                        </option>
                                    )
                                })}
                            </Input>
                        </FormGroup>
                    </Collapse></>}
        </FormGroup>
    );
}

export default InputSearch