import React, { Component } from 'react';
import './App.css';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {headerName: "Código", field: "agency_code"},
                {headerName: "Descripción", field: "description"},
                {headerName: "Dirección", field: "address_line"},
                {headerName: "Ciudad", field: "city"},
                {headerName: "Distancia", field: "distance"}
            ],
            rowData: []
        }
    }



    componentDidMount() {
        let initialAgencies = [];
        fetch('http://localhost:9001/sites/MLA/rapipago/-31.4122576/-64.1877324/500/sorting')
            .then(response => {
                return response.json();
            }).then(data => {
            initialAgencies = data.map((site) => {
                return site
            });
            this.setState({
                rowData: initialAgencies,
            });
        });
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{ height: '200px', width: '1000px' }}
            >
                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}>
                </AgGridReact>
            </div>
        );
    }
}

export default Table