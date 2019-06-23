import React, { Fragment, useState } from 'react';
import ListInvoices from './ListInvoices';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const FileUpload = () => {
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [invoices, setUpInvoices] = useState([]);
  const [view, setUpView] = useState(false);

  const onChange = e => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );
          // Clear percentage
          setTimeout(() => {
            setUploadPercentage(0);
            showInvoices();
          }, 2000);
        }
      });
      const { fileName, filePath } = res.data;
      setUploadedFile({ fileName, filePath });
      setMessage('File Uploaded');
    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.msg);
      }
    }
  };
  const showInvoices = async () => {
    let res = await axios.get('/invoices');
    var index = 1;
    setUpInvoices([]);
    if(invoices.length !== 0)
      invoices.length = 0;
    await asyncForEach(res.data.invoices, async (invoice) => {
      invoice=invoice.dte;
      var newInvoice = {
        index: index++,
        emision: invoice.$.emision,
        tipo: invoice.$.tipo,
        folio: invoice.$.folio,
        expand:{
          emisor:{
            rut: invoice.emisor[0].$.rut,
            razonSocial: invoice.emisor[0].$.razonSocial
          },
          receptor:{
            rut: invoice.receptor[0].$.rut,
            razonSocial: invoice.receptor[0].$.razonSocial
          },
          items:[]
        }
      };
      await asyncForEach(invoice.items[0].detalle, async (detalle) => {
        var newDetalle = {
          monto: detalle.$.monto,
          iva: detalle.$.iva,
          nombre: detalle._
        };
        newInvoice.expand.items.push(newDetalle);
      });
      invoices.push(newInvoice);
    });
    setUpInvoices(invoices);
  };
  
  if(view === false){
    showInvoices();
    setUpView(true);
  }

  return (
    <Fragment>
      {message ? <Message msg={message} /> : null}
      <ListInvoices invoices={invoices}/>
      <hr/>
      <form onSubmit={onSubmit}>
        <div className='custom-file mb-4'>
          <input type='file' className='custom-file-input' id='customFile' onChange={onChange}/>
          <label className='custom-file-label' htmlFor='customFile'>{filename}</label>
        </div>
        <Progress percentage={uploadPercentage} />
        <input type='submit' value='Upload' className='btn btn-primary btn-block mt-4'/>
      </form>
      {uploadedFile ? (
        <div className='row mt-5'>
          <div className='col-md-6 m-auto'>
            <h3 className='text-center'>{uploadedFile.fileName}</h3>
            <img style={{ width: '100%' }} src={uploadedFile.filePath} alt='' />
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default FileUpload;
