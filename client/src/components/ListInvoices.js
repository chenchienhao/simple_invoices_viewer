import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
const uuidv4 = require('uuid/v4');
const ListInvoices = ({ invoices }) => {
  const columns = [{
    dataField: 'index',
    text: '#',
    sort: true
  }, {
    dataField: 'emision',
    text: 'Emision',
    sort: true
  }, {
    dataField: 'tipo',
    text: 'Tipo',
    sort: true
  }, {
    dataField: 'folio',
    text: 'Folio',
    sort: true
  }];

  const expandRow = {
    renderer: (row) => (
      <div>
        <h6>Emisor</h6>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Rut</th>
              <th scope="col">Razon Social</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{row.expand.emisor.rut}</td>
              <td>{row.expand.emisor.razonSocial}</td>
            </tr>
          </tbody>
        </table>
        <h6>Receptor</h6>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Rut</th>
              <th scope="col">Razon Social</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{row.expand.receptor.rut}</td>
              <td>{row.expand.receptor.razonSocial}</td>
            </tr>
          </tbody>
        </table>
        <h6>Detalles</h6>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Monto</th>
              <th scope="col">IVA</th>
            </tr>
          </thead>
          <tbody>
            {row.expand.items.map((item,i) => {
              return (
                <tr key={uuidv4()}>
                   <td>{item.nombre}</td>
                   <td>{item.monto}</td>
                   <td>{item.iva}</td>
                </tr>
              );
            })}
            
          </tbody>
        </table>
      </div>
    )
  };

  return (
    <Fragment>
      <BootstrapTable keyField='index' data={ invoices } columns={ columns } expandRow={ expandRow } striped hover condensed/>
      {invoices.length === 0 ?
         <div className='alert alert-secondary alert-dismissible fade show' role='alert'>
           No invoice here.
         </div>
       : null}
    </Fragment>
  );
};

ListInvoices.propTypes = {
  invoices: PropTypes.array.isRequired
};


export default ListInvoices;
