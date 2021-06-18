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
import ReactToPrint from "react-to-print";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
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
    const contentArea = useRef(null);
    const [formData, setFormData] = useState(null);
    const [png, setPng] = useState();
    const [dataLoaded, setData] = useState(false);
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
    //             const barC = rows[n]['Штрих-код'];
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
                const doc = new GoogleSpreadsheet('1aJxLjdtI3FoWPcdIO-OaZYGf503h7cqIMtijldu-JxI');
                await doc.useServiceAccountAuth(creds);
                await doc.loadInfo();
                const sheet = doc.sheetsByIndex[0];

                const rows = await sheet.getRows();
                if (rows.length > 0) {
                    setS(sheet);
                    setFormData(rows);
                    const n = rows.length - 1;
                    const barC = rows[n]['Штрих-код'];
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

    const [s, setS] = useState();
    const [ua, setUa] = useState();
    const [bar, setBar] = useState();
    const [price_, setPrice] = useState();
    const [disc, setD] = useState();
    const [sex, setSex] = useState();
    console.log(sex);
    console.log(disc);
    const names_ua = names.map(e => ({
        name: e.name
    }));
    console.log(ua, bar, price_, disc);
    const onSubmitForm = async () => {
        const filter = formData.filter(el => {
            return el['Ціна'] === price_.price && el['Номенклатура'].includes(ua.name) && el['Дисконт'] === disc;
        })
        console.log('filter', filter);
        if(filter.length > 0) {
            await setBar(filter[0]['Штрих-код']);
            await exportPDF();
        } else {
            await s.addRow({
                'Номенклатура': ua.name + ' ' + sex,
                'Штрих-код': parseInt(bar),
                'Ціна': parseInt(price_.price),
                'Дисконт': disc,
            })
            await exportPDF();

        }
    console.log('Form submitted was like : ', formData);
        await window.location.reload();
    };
    console.log('Data is ', png);

    const exportPng = async () => {
        const res = await exportComponentAsJPEG(contentArea, {pdfOptions: {
                w: '151px', h: '94.49px'
            }});
        setPng(res);
        console.log('RES : ', res)
        return res;
    }

    const exportPDF = async () => {
        const res = await exportComponentAsPDF(contentArea,  {pdfOptions: { orientation: 'l', unit: 'mm', w: 40, h: 25, pdfFormat: [112, 72]
            }});
        return res;
    }
    return (
        <div className="barcode-component" >
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Форма Создания Этикетки
            </Typography>
            <form style={{height: '1080px'}} onSubmit={async () => await(onSubmitForm)}>
                <Autocomplete
                    id="names-ua"
                    options={names_ua}
                    getOptionLabel={(option) => option.name}
                    style={{
                        width: '300'
                    }}
                    onChange={(event, value) => setUa(value)}
                    renderInput={(params) => <TextField {...params} label="Номенклатура" variant="outlined" /> }
                />
                <br/>
                <Autocomplete
                    id="price"
                    options={price}
                    getOptionLabel={(option) => option.price}
                    style={{
                        width: '300'
                    }}
                    onChange={(event, value) => setPrice(value)}
                    renderInput={(params) => <TextField {...params} label="Цена" variant="outlined" /> }
                />
                <br/>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Тип Скидки</FormLabel>
                    <RadioGroup row aria-label="gender" name="gender1" value={disc} onChange={(event) => setD(event.target.value)}>
                        <FormControlLabel value="Без скидки" control={<Radio />} label="Без скидки" />
                        <FormControlLabel value="Дисконт" control={<Radio />} label="Дисконт" />
                    </RadioGroup>
                </FormControl>
                <br/>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Укажите Пол</FormLabel>
                    <RadioGroup row aria-label="gender" name="gender1" value={sex} onChange={(event) => setSex(event.target.value)}>
                        <FormControlLabel value={''} control={<Radio />} label="n/a" />
                        <FormControlLabel value="чол" control={<Radio />} label="М" />
                        <FormControlLabel value="жін" control={<Radio />} label="Ж" />
                        <FormControlLabel value="уні" control={<Radio />} label="У" />
                        <FormControlLabel value="дит" control={<Radio />} label="Д" />
                    </RadioGroup>
                </FormControl>
                <br/>
                <Button id="submit-button" variant="contained" color="primary" style={{marginBottom: 15, marginTop: 15}} onClick={onSubmitForm}> Создать Этикетку</Button>
                <br/>
            </form>
        </React.Fragment>
            <div className="card">
                <Card style={{width: '472px', height: '295px', marginLeft: 'auto', marginRight: 'auto', marginBottom: 15}}>
                    <div ref={contentArea} style={{width: '472px', height: '295px', position: 'relative'}}>
                    <CardContent style={{margin: 0, padding: 0}}>
                        <label style={{fontSize: 124, fontWeight: 'bold', padding: 0, position: 'relative', top: '-30px'}}>
                            {price_ === undefined ? null : Object.values(price_)[0]}
                        </label>
                        <label style={{fontSize: 50, fontWeight: 'bold', position: 'relative', top: '-30px'}}>грн</label>
                        <br/>
                        <label style={{fontSize: 24, padding: 0, position: 'relative', top: '-50px', zIndex: '1001'}}>
                            {ua === undefined ? null : Object.values(ua)[0]} {sex === undefined ? null : Object.values(sex)}
                        </label>
                        <div style={{position: 'absolute', top: '58%', left: '6%', }}>
                        <Barcode value={bar} format="EAN13" fontSize={72} width={3.5} height={70}/>
                        </div>
                    </CardContent>
                </div>
                </Card>
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