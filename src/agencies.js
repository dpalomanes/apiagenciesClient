import React, { Component } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import axios from 'axios';
import { Button, Modal, ModalHeader, ModalBody, Navbar } from 'reactstrap';



class Agencies extends Component {


    constructor(props) {
        super(props);
        this.state = {
            defaultColDef: {
                editable: true,
                enableRowGroup: true,
                enablePivot: true,
                enableValue: true,
                sortable: true,
                resizable: true,
                filter: true
            },
            rowSelection: "multiple",
            rowGroupPanelShow: "always",
            pivotPanelShow: "always",
            paginationPageSize: 10,
            paginationNumberFormatter: function(params) {
                return "[" + params.value.toLocaleString() + "]";
            },
            modalTitle:"",
            modalBody: "",
            modal: false,
            favoritesModalTitle:"",
            favoritesModalBody: "",
            favoritesModal: false,
            sites: [],
            siteSelected: "",
            paymentMethods: [{id:"0", name:"Seleccione"}],
            paymentSelected: "",
            defLatitudeSelected: "",
            defLongitudeSelected: "",
            radius:"300",
            disableDefault: false,
            defaultLocationSelected: "",
            defaultLocations: [
                {
                    id:0,
                    name: 'Seleccione'
                },
                {
                    id:1,
                    name: 'Córdoba',
                    latitude: '-31.405060',
                    longitude: '-64.171900'
                },
                {
                    id:2,
                    name: 'Buenos Aires',
                    latitude: '-34.603683',
                    longitude: '-58.381557'
                },
                {
                    id:3,
                    name: 'Mendoza',
                    latitude: '-32.889458',
                    longitude: '-68.845840'
                },
                {
                    id:4,
                    name: 'San Juan',
                    latitude: '-31.538660',
                    longitude: '-68.536300'
                },
                {
                    id:5,
                    name: 'San Luis',
                    latitude: '-33.275670',
                    longitude: '-66.344230'
                },
                {
                    id:6,
                    name: 'Santa Fe',
                    latitude: '-31.631520',
                    longitude: '-60.714460'
                },
            ],
            sortCriteriaSelected: "",
            sortCriterias:[
                {
                    id: 'distance',
                    name: 'Distancia'
                },
                {
                    id: 'address_line',
                    name: 'Dirección'
                },
                {
                    id: 'agency_code',
                    name: 'Código de agencia'
                }

            ],
            favoriteColumnDefs: [
                {headerName: "Código", field: "agency_code", width: 100},
                {headerName: "Descripción", field: "description", width: 250},
                {headerName: "Dirección", field: "address_line"},
                {headerName: "Ciudad", field: "city"}
            ],
            columnDefs: [
                {headerName: "Código", field: "agency_code"},
                {headerName: "Descripción", field: "description"},
                {headerName: "Dirección", field: "address_line"},
                {headerName: "Ciudad", field: "city"},
                {headerName: "Distancia (m)", field: "distance", type:"quarterFigure"},
                {headerName: "Fav", field: "fav", width: 70, cellRenderer: (params) => {
                        var img = document.createElement("img");
                        img.src = "https://img.icons8.com/cute-clipart/24/000000/thumb-up.png"
                        img.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.addToFavorites(params.data)
                        });
                        return img;
                    }},
                {headerName: "Unfav", field: "unfav", width: 80 , cellRenderer: (params) => {
                        var img = document.createElement("img");
                        img.src = "https://img.icons8.com/cute-clipart/24/000000/thumbs-down.png"
                        img.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.removeFromFavorites(params.data)
                        });
                        return img;
                    }}
            ],
            rowData: [],
            favoriteRowData: [],
            favoriteAgencies: []
        };

        this.toggle = this.toggle.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.onSiteChange = this.onSiteChange.bind(this)
        this.onPaymentChange = this.onPaymentChange.bind(this)
        this.onDefaultLocationsChange = this.onDefaultLocationsChange.bind(this)
        this.onFetchAgencies = this.onFetchAgencies.bind(this)
        this.onSortCriteriaChanged = this.onSortCriteriaChanged.bind(this)
        this.onLatitudeChange = this.onLatitudeChange.bind(this)
        this.onLongitudeChange = this.onLongitudeChange.bind(this)
        this.onRadiusChange = this.onRadiusChange.bind(this)
        this.showFavorites = this.showFavorites.bind(this)

    }

    componentDidMount() {
        let initialSites = [{id:"0", name:"Seleccione"}];
        fetch('http://localhost:9001/sites/getsites/')
            .then(response => {
                return response.json();
            }).then(data => {
            data.map((site) => {
                initialSites.push(site)
            });
            this.setState({
                sites: initialSites,
            });
        });
    }


    getPaymentMethods(siteId) {
        let initialPayments = [{id:"0", name:"Seleccione"}];
        fetch('http://localhost:9001/sites/getsites/' + siteId)
            .then(response => {
                return response.json();
            }).then(data => {
                data.map((payment) => {
                initialPayments.push(payment)
            });
            this.setState({
                paymentMethods: initialPayments,
            });
        });
    }


    onFetchAgencies(){
        var site = this.state.siteSelected
        var paymentMethod = this.state.paymentSelected
        var latitude = this.state.defLatitudeSelected
        var longitude = this.state.defLongitudeSelected
        var radius = this.state.radius
        var sortCriteria = this.state.sortCriteriaSelected

        if (site === ""){
            this.setState({
                modalTitle:"Error",
                modalBody:"No se ha seleccionado país"
            })
            this.toggle()
        } else if(paymentMethod === ""){
            this.setState({
                modalTitle:"Error",
                modalBody:"No se ha seleccionado método de pago"
            })
            this.toggle()
        } else if(latitude === ""){
            this.setState({
                modalTitle:"Error",
                modalBody:"No se ha seleccionado una latitud"
            })
            this.toggle()
        }else if(longitude === ""){
            this.setState({
                modalTitle:"Error",
                modalBody:"No se ha seleccionado una longitud"
            })
            this.toggle()
        }else {
            if (radius === ""){
                radius = 500
                this.setState({
                    radius:radius
                })
            }
            let initialAgencies = [];
            fetch('http://localhost:9001/sites/getagencies/'+site+'/'+paymentMethod+'/'+latitude+'/'+longitude+'/'+radius+'/'+sortCriteria)
                .then(response => {
                    return response.json();
                }).then(data => {
                initialAgencies = data.map((site) => {
                    return site
                });
                this.setState({
                    rowData: initialAgencies,
                });
            }).catch(response => {
                    this.setState({
                        modalTitle:"Consultar agencias",
                        modalBody:"No se ha podido consultar el listado de agencias ("+response+")"
                    })
                this.toggle()
            });
        }


    }

    async addToFavorites(agency){
        var body = JSON.stringify(agency)

        try {
            const response = await axios.post(
                'http://localhost:9001/sites/favorites/write',
                { data: body },
                { headers: { 'Content-Type': 'application/json' }
                }
            )

            if (response.status === 200){
                this.setState({
                    modalTitle:"Agencia recomendada",
                    modalBody:"La agencia '"+ agency.description + "' ya ha sido recomendada con anterioridad."
                })
            } else if (response.status === 201){
                this.setState({
                    modalTitle:"Agencia recomendada",
                    modalBody:"La agencia '"+ agency.description + "' ha sido recomendada."
                })
            } else {
                this.setState({
                    modalTitle:"Agencia recomendada",
                    modalBody:"La agencia '"+ agency.description + "' no se ha podido recomendar (Error: " + response.status +")"
                })
            }
        }catch (e) {
            this.setState({
                modalTitle:"Agencia recomendada",
                modalBody:"La agencia '"+ agency.description + "' no se ha podido recomendar ("+ e +")"
            })
        }

        this.toggle()


    }

    async removeFromFavorites(agency){

        try {
            const response = await axios.delete('http://localhost:9001/sites/favorites/remove/'+agency.agency_code)

            if (response.status === 200){
                this.setState({
                    modalTitle:"Agencia recomendada",
                    modalBody:"La agencia '"+ agency.description + "' ha sido eliminada de la lista de agencias recomendadas."
                })
            } else if (response.status === 204){
                this.setState({
                    modalTitle:"Agencia recomendada",
                    modalBody:"La agencia '"+ agency.description + "' no ha sido recomendada con anterioridad."
                })
            } else {
                this.setState({
                    modalTitle:"Agencia recomendada",
                    modalBody:"La agencia '"+ agency.description + "' no se ha podido eliminar de la lista de agencias recomendadas " +
                        "(Error: " + response.status +")"
                })
            }
        }catch (e) {
            this.setState({
                modalTitle:"Agencia recomendada",
                modalBody:"La agencia '"+ agency.description + "' no se ha podido eliminar de la lista de agencias recomendadas ("+ e +")"
            })
        }

        this.toggle()
    }

    showFavorites(){
        var favoriteAgencies = []
        fetch('http://localhost:9001/sites/favorites/read')
            .then(response => {
                return response.json();
            }).then(data => {
            favoriteAgencies = data.map((agency) => {
                return agency
            });
            this.setState({
                favoriteRowData: favoriteAgencies,
                favoritesModalTitle: "Listado de agencias recomendadas (" + favoriteAgencies.length +")"
            });
            this.toggleModal()
        }).catch(response => {
            this.setState({
                modalTitle:"Consultar agencias",
                modalBody:"No se ha podido consultar el listado de agencias ("+response+")"
            })
            this.toggle()
        });;
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    toggleModal() {
        this.setState(prevState => ({
            favoritesModal: !prevState.favoritesModal
        }));
    }

    onSiteChange(event){

        if (event.target.value == "MLA") {
            this.setState({
                siteSelected: event.target.value,
                disableDefault: false
            });
        } else {
            this.setState({
                siteSelected: event.target.value,
                disableDefault: true
            });
        }
        this.setState({
            defLatitudeSelected: "",
            defLongitudeSelected: ""
        });
        this.getPaymentMethods(event.target.value)
    }

    onPaymentChange(event){
        this.setState({
            paymentSelected: event.target.value,
        });
    }

    onSortCriteriaChanged(event) {
        this.setState({
            sortCriteriaSelected: event.target.value
        })
    }

    onLatitudeChange(event) {
        this.setState({
            defLatitudeSelected: event.target.value
        })
    }

    onLongitudeChange(event) {
        this.setState({
            defLongitudeSelected: event.target.value
        })
    }

    onRadiusChange(event) {
        this.setState({
            radius: event.target.value
        })
    }

    onDefaultLocationsChange(event){
        var latitude = this.state.defaultLocations[event.target.value].latitude
        var longitude = this.state.defaultLocations[event.target.value].longitude

        this.setState({
            defaultLocationSelected: event.target.value,
            defLatitudeSelected: latitude,
            defLongitudeSelected: longitude
        });
    }
    render(){

        var titleStyle = {
            width: "100%",
            textAlign: "center",
            fontSize: "-webkit-xxx-large",
            fontFamily: "serif",
            fontWeight: "600",
        }

        var form1 = {
            display: "flex",
            alignItems: "center",
            paddingLeft: "100px",
            paddingRight: "100px",
            paddingTop: "25px",
        }

        var formRight = {
            width: "50%",
            padding: "20px",
            border: "solid 1px grey",
            background: "lightblue",
            borderTopRightRadius: "10px",
            borderBottomRightRadius: "10px",
        }

        var formLeft= {
            width: "50%",
            padding: "20px",
            border: "solid 1px grey",
            background: "lightblue",
            borderTopLeftRadius: "10px",
            borderBottomLeftRadius: "10px",
        }


        return (
            <div className="form">

                <div>
                <Navbar color="light" light expand="md">
                    <img height="90x" width="90px" src="http://soyweb.com.ar/wp-content/uploads/sites/16/2016/01/mercadolibre-1.png"/>
                    <label style={titleStyle}>Buscador de agencias</label>
                    <Button  style={{fontWeight: "600"}} onClick={this.showFavorites}>
                        <img height="40px" width="40px" src="https://www.searchpng.com/wp-content/uploads/2018/12/mgpl.png"/>Recomendadas</Button>
                </Navbar>
                </div>

                <div>
                    <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                        <ModalHeader toggle={this.toggle}>{this.state.modalTitle}</ModalHeader>
                        <ModalBody>
                            {this.state.modalBody}
                        </ModalBody>
                    </Modal>
                </div>

                <div>
                    <Modal size="lg" isOpen={this.state.favoritesModal} toggle={this.toggleModal}>
                        <ModalHeader toggle={this.toggleModal}>{this.state.favoritesModalTitle}</ModalHeader>
                        <ModalBody>
                            <div className="ag-theme-balham" style={{ height: '200px', width: '100%' }}>
                                <AgGridReact
                                    columnDefs={this.state.favoriteColumnDefs}
                                    rowData={this.state.favoriteRowData}>
                                </AgGridReact>
                            </div>
                        </ModalBody>
                    </Modal>
                </div>
                <div>
                    <div style={form1}>
                        <div style={formLeft}>
                            <div>
                                <label>Seleccione un país</label>
                                <select style={{float:"right"}} onChange={this.onSiteChange} value={this.state.siteSelected}  >
                                    {
                                        this.state.sites.map((obj) => {
                                            return <option value={obj.id}>{obj.name}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div>
                                <label>Seleccione un método de pago</label>
                                <select style={{float:"right"}} onChange={this.onPaymentChange} value={this.state.paymentSelected}>
                                    {
                                        this.state.paymentMethods.map((obj) => {
                                            return <option value={obj.id}>{obj.name}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div>
                                <label>Ubicaciones por defecto (Sólo disponible para Argentina)</label>
                                <select style={{float:"right"}} disabled={this.state.disableDefault} onChange={this.onDefaultLocationsChange} value={this.state.defaultLocationSelected}>
                                    {
                                        this.state.defaultLocations.map((obj) => {
                                            return <option value={obj.id}>{obj.name}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div>
                                <label>Ordenar por:</label>
                                <select style={{float:"right"}} onChange={this.onSortCriteriaChanged} value={this.state.sortCriteriaSelected}>
                                    {
                                        this.state.sortCriterias.map((obj) => {
                                            return <option value={obj.id}>{obj.name}</option>
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                        <div style={formRight}>
                            <div>
                                <label>Ubicación: click <a href="https://www.latlong.net" target="_blank">aquí</a> para obtener las coordenadas deseadas </label>
                            </div>
                            <div>
                                <label>Latitud:</label>
                                <input style={{float:"right", width:"300px"}} pattern="[0-9]*" id="latitude" type="text" value={this.state.defLatitudeSelected} onChange={this.onLatitudeChange}/>
                            </div>

                            <div>
                                <label>Longitud:</label>
                                <input style={{float:"right", width:"300px"}} id="longitude" type="text" value={this.state.defLongitudeSelected} onChange={this.onLongitudeChange}/>
                            </div>
                            <div>
                                <label>Radio:</label>
                                <input  style={{float:"right",  width:"300px"}}id="radius" type="text" value={this.state.radius} onChange={this.onRadiusChange}/>
                            </div>
                        </div>
                    </div>
                    <div className="ag-theme-balham" style={{ height: '200px', width: '1110px,', paddingLeft: "100px",
                        paddingRight: "100px" }}>
                        <Button style={{fontWeight:"600", margin: "10px"}} value="Consultar" onClick={this.onFetchAgencies}>Consultar</Button>
                        <AgGridReact
                            style= {{height: '300px !important'}}
                            columnDefs={this.state.columnDefs}
                            rowData={this.state.rowData}
                            suppressRowClickSelection={true}
                            groupSelectsChildren={true}
                            debug={true}
                            pivotPanelShow={"always"}
                            enableRangeSelection={true}
                            paginationAutoPageSize={true}
                            defaultColDef={this.state.defaultColDef}
                            pagination={true}
                            paginationPageSize={this.state.paginationPageSize}
                            paginationNumberFormatter={this.state.paginationNumberFormatter}
                        >
                        </AgGridReact>
                    </div>
                </div>
            </div>
        )
    }

}

export default Agencies;