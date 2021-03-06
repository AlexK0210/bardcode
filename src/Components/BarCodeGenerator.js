import React, {useState, useRef, useEffect} from 'react';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import Autocomplete from '@material-ui/lab/Autocomplete';
import {names, price} from '../mocks/mock';
import './BarCodeGenerator.css'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Barcode from 'react-barcode';
import { exportComponentAsPNG, exportComponentAsJPEG, exportComponentAsPDF } from 'react-component-export-image';
import  { GoogleSpreadsheet } from 'google-spreadsheet';
import {useReactToPrint} from "react-to-print";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import ComponentToPrint from 'react-to-print';
import PrintComponents from "react-print-components";

const creds = require('../data/barcode0generator-dcafbe230368.json');
export function getLastEan13Digit(ean) {
    if (!ean || ean.length !== 12) throw new Error('Invalid EAN 13, should have 12 digits');
    const multiply = [1, 3];
    let total = 0;
    ean.split('').forEach((letter, index) => {
        total += parseInt(letter, 10) * multiply[index % 2];
    });
    const base10Superior = Math.ceil(total / 10) * 10;
    return base10Superior - total;
}


export const BarCodeGenerator = () => {
    const contentArea = useRef();
    const [formData, setFormData] = useState(null);
    const [png, setPng] = useState();
    const [dataLoaded, setData] = useState(false);
    const [nameData, setNameData] = useState([]);
    const [priceData, setPrData] = useState([]);
    const handlePrint = useReactToPrint({
        content: () => contentArea.current
    })
    // if (!formData) {
    //     (async function () {
    //         const doc = new GoogleSpreadsheet('1aJxLjdtI3FoWPcdIO-OaZYGf503h7cqIMtijldu-JxI');
    //         await doc.useServiceAccountAuth(creds);
    //         await doc.loadInfo();
    //         const sheet = doc.sheetsByIndex[0];
    //
    //         const rows = await sheet.getRows();
    //         if (rows.length > 0) {
    //             setS(sheet);
    //             setFormData(rows);
    //             const n = rows.length - 1;
    //             const barC = rows[n]['??????????-??????'];
    //             const mainB = parseInt(barC.toString().substring(0, 12)) + 1;
    //             const newBar = getLastEan13Digit(mainB.toString());
    //             const bar = mainB.toString() + newBar;
    //             if(bar) {
    //                 setBar(bar);
    //             }
    //         }
    //     })();
    // };
    useEffect(() => {
        if (dataLoaded === false) {
            (async function () {
                const doc = new GoogleSpreadsheet('1JDMcJcq2HO72L3ADETIB3w97eb0I1L_5-dMFHl6dcQI');
                await doc.useServiceAccountAuth(creds);
                await doc.loadInfo();
                const sheet = doc.sheetsByIndex[0];
                const nomen = doc.sheetsByIndex[1];
                const ppp = doc.sheetsByIndex[2];
                const pp = await ppp.getRows();
                const toSendP = pp.map(el => {
                    return {
                        price: el['Price']
                    }
                })
                const names = await nomen.getRows();
                const toSendNames = names.map(el => {
                    return {
                        name: el.Name
                    }
                })
                console.log(toSendNames);
                if (toSendNames.length > 0) {
                    setNameData(toSendNames);
                }
                if (toSendP.length > 0) {
                    setPrData(toSendP);
                }
                const rows = await sheet.getRows();
                if (rows.length > 0) {
                    setS(sheet);
                    setS2(nomen);
                    setS3(ppp);
                    setFormData(rows);
                    const n = rows.length - 1;
                    const barC = rows[n]['??????????-??????'];
                    const mainB = parseInt(barC.toString().substring(0, 12)) + 1;
                    const newBar = getLastEan13Digit(mainB.toString());
                    const bar = mainB.toString() + newBar;
                    if (bar) {
                        setBar(bar);
                        setData(true);
                    }
                }
            })();
        }
        console.log('---------------------------------------------------------------REQUEST');

    }, [dataLoaded, formData])

    const [s, setS] = useState(' ');
    const [s2, setS2] = useState('');
    const [s3, setS3] = useState('');
    const [ua, setUa] = useState(' ');
    const [bar, setBar] = useState(' ');
    const [price_, setPrice] = useState(' ');
    const [disc, setD] = useState(' ');
    const [sex, setSex] = useState(' ');
    const [dis, setDis] = useState(true);
    const reactToPrintContent = React.useCallback(() => {
        return contentArea.current;
    }, [contentArea.current]);
    const reactToPrintTrigger = React.useCallback(() => {
        // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
        // to the root node of the returned component as it will be overwritten.

        // Bad: the `onClick` here will be overwritten by `react-to-print`
        // return <a href="#" onClick={() => alert('This will not work')}>Print this out!</a>;

        // Good
        return <a href="#">Print using a Functional Component</a>;
    }, []);

    const onSubmitForm = async () => {
        const filter = formData.filter(el => {
            return el['????????'] === price_.price && el['????????????????????????'].includes(ua.name) && el['??????????????'] === disc;
        })
        const filter2 = nameData.filter(el => {
            return el.name === ua.name;
        });
        const filter3 = priceData.filter(el => {
            return el.price === price_.price
        })
        if (filter3.length > 0) {
            console.log('NAME AND PRICE WAS SEND')
        } else {
            s3.addRow({
                'Price': Object.values(price_)[0]
            })
        }
        if (filter2.length > 0) {
            console.log('""""""""', filter2)
        } else {
            s2.addRow({
                'Name': ua.name
            })
        }
        console.log('filter', filter);
        if(filter.length > 0) {
            await setBar(filter[0]['??????????-??????']);
            console.log('HERE')
            await window.location.reload();

        } else {
            await s.addRow({
                '????????????????????????': ua.name + ' ' + sex,
                '??????????-??????': parseInt(bar),
                '????????': parseInt(price_.price),
                '??????????????': disc,
            })
            window.location.reload();
        }
    console.log('Form submitted was like : ', formData);
    };
    const handleChangeButton = async () => {
        const filter = formData.filter(el => {
            return el['????????'] === price_.price && el['????????????????????????'].includes(ua.name) && el['??????????????'] === disc;
        });
        if(filter.length > 0) {
            await setBar(filter[0]['??????????-??????']);
            console.log('-----------------------------------------------------------------------------------------------------!!!!')
        }
        console.log('here');
        const but = document.getElementById('submit-button');
        but.click();
        setDis(false);
    }
    const exportPDF = async () => {
        const res = await exportComponentAsPDF(contentArea,  {pdfOptions: { orientation: 'l', unit: 'mm', w: 37, h: 22, x: 1, y: 2, pdfFormat: [112, 72]
            }});
        return res;
    }
    return (
        <div className="barcode-component" >
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                ?????????? ???????????????? ????????????????
            </Typography>
            <form  onSubmit={async () => await(onSubmitForm)}>
                <Autocomplete
                    id="names-ua"
                    options={nameData}
                    freeSolo
                    getOptionLabel={(option) => option.name}
                    style={{
                        width: '300'
                    }}
                    onChange={(event, value) => setUa(value)}
                    onInputChange={(event, value) => {
                        setUa({name: value})
                    }}
                    renderInput={(params) => <TextField {...params} label="????????????????????????" variant="outlined" /> }
                />
                <br/>
                <Autocomplete
                    id="price"
                    options={priceData}
                    freeSolo
                    getOptionLabel={(option) => option.price}
                    style={{
                        width: '300'
                    }}
                    onChange={(event, value) => setPrice(value)}
                    renderInput={(params) => <TextField {...params} label="????????" variant="outlined" /> }
                    onInputChange={(event, value) => {
                        setPrice({price: value})
                    }}
                />
                <br/>
                <FormControl component="fieldset">
                    <FormLabel component="legend">?????? ????????????</FormLabel>
                    <RadioGroup row aria-label="gender" name="gender1" value={disc} onChange={(event) => setD(event.target.value)}>
                        <FormControlLabel value="?????? ????????????" control={<Radio />} label="?????? ????????????" />
                        <FormControlLabel value="??????????????" control={<Radio />} label="??????????????" />
                    </RadioGroup>
                </FormControl>
                <br/>
                <FormControl component="fieldset">
                    <FormLabel component="legend">?????????????? ??????</FormLabel>
                    <RadioGroup row aria-label="gender" name="gender1" value={sex} onChange={(event) => setSex(event.target.value)}>
                        <FormControlLabel value="??????" control={<Radio />} label="??" />
                        <FormControlLabel value="??????" control={<Radio />} label="??" />
                        <FormControlLabel value="??????" control={<Radio />} label="??" />
                        <FormControlLabel value="??????" control={<Radio />} label="??" />
                    </RadioGroup>
                </FormControl>
                <br/>
                <Button id="submit-button" variant="contained" color="primary" style={{marginBottom: 15, marginTop: 15}} disabled={dis} onClick={onSubmitForm}>?????????????? ???????????? ?? ????</Button>
                <br/>
            </form>
        </React.Fragment>
            <div className="card" id="card-print">
                <PrintComponents trigger={<Button style={{ width: '230px'}} variant="contained" color="primary" onMouseDown={() => handleChangeButton()}>???????????????? ????????????????</Button>}>
                <Card style={{width: '100%', height: '800px', marginLeft: 'auto', marginRight: 'auto', marginBottom: 15, textAlign: 'center'}}>
                    <div ref={contentArea} style={{width: '100%', height: '800px', position: 'relative'}}>
                    <CardContent style={{margin: 0, padding: 0}}>
                        <label style={{fontSize: 320, fontWeight: 'bold', padding: 0, position: 'relative', top: '-30px'}}>
                            {price_.hasOwnProperty('price') ? Object.values(price_)[0] : ' '}
                        </label>
                        <label style={{fontSize: 120, fontWeight: 'bold', position: 'relative', top: '-30px'}}>??????</label>
                        <br/>
                        <label style={{fontSize: 84, padding: 0, position: 'relative', top: '-70px', zIndex: '1001'}}>
                            {ua.hasOwnProperty('name')  ? ua.name  : ' '} {sex === undefined ? ' ' : sex}
                        </label>
                        <div style={{position: 'absolute', top: '59%', left: '7%'}}>
                        <Barcode value={bar} format="EAN13" fontSize={92} width={10} height={220}/>
                        </div>
                    </CardContent>
                </div>
                </Card>
                </PrintComponents>
            </div>
        </div>
    )
};

const pageStyle = `
@media all {
  .page-break {
    display: none;
  }
}

@media print {
  html, body {
    height: initial !important;
    overflow: initial !important;
    -webkit-print-color-adjust: exact;
  }
}

@media print {
  .page-break {
    margin-top: 1rem;
    display: block;
    page-break-before: auto;
  }
}

@page {
  size: auto;
  margin: 20mm;
}
`;
