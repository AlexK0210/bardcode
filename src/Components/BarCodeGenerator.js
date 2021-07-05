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

    const [s, setS] = useState(' ');
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
            console.log('HERE')
        } else {
            await s.addRow({
                'Номенклатура': ua.name + ' ' + sex,
                'Штрих-код': parseInt(bar),
                'Ціна': parseInt(price_.price),
                'Дисконт': disc,
            })
            console.log('qwweerrttyy')
        }
    console.log('Form submitted was like : ', formData);
        await window.location.reload();
    };
    console.log('Data is ', png);
    const handleChangeButton = () => {
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
    console.log('PRICE AND NAME : : : ', price_, ua);
    return (
        <div className="barcode-component" >
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Форма Создания Этикетки
            </Typography>
            <form  onSubmit={async () => await(onSubmitForm)}>
                <Autocomplete
                    id="names-ua"
                    options={names_ua}
                    freeSolo
                    getOptionLabel={(option) => option.name}
                    style={{
                        width: '300'
                    }}
                    onChange={(event, value) => setUa(value)}
                    onInputChange={(event, value) => {
                        setUa({name: value})
                    }}
                    renderInput={(params) => <TextField {...params} label="Номенклатура" variant="outlined" /> }
                />
                <br/>
                <Autocomplete
                    id="price"
                    options={price}
                    freeSolo
                    getOptionLabel={(option) => option.price}
                    style={{
                        width: '300'
                    }}
                    onChange={(event, value) => setPrice(value)}
                    renderInput={(params) => <TextField {...params} label="Цена" variant="outlined" /> }
                    onInputChange={(event, value) => {
                        setPrice({price: value})
                    }}
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
                        <FormControlLabel value="чол" control={<Radio />} label="М" />
                        <FormControlLabel value="жін" control={<Radio />} label="Ж" />
                        <FormControlLabel value="уні" control={<Radio />} label="У" />
                        <FormControlLabel value="дит" control={<Radio />} label="Д" />
                    </RadioGroup>
                </FormControl>
                <br/>
                <Button id="submit-button" variant="contained" color="primary" style={{marginBottom: 15, marginTop: 15}} disabled={dis} onClick={onSubmitForm}>Создать Запись в БД</Button>
                <br/>
            </form>
        </React.Fragment>
            <div className="card" id="card-print">
                <PrintComponents trigger={<Button style={{top: '-50px', width: '230px'}} variant="contained" color="primary" onMouseLeave={() => handleChangeButton()}>Печатать Этикетку</Button>}>
                <Card style={{width: '100%', height: '800px', marginLeft: 'auto', marginRight: 'auto', marginBottom: 15, textAlign: 'center'}}>
                    <div ref={contentArea} style={{width: '100%', height: '800px', position: 'relative'}}>
                    <CardContent style={{margin: 0, padding: 0}}>
                        <label style={{fontSize: 320, fontWeight: 'bold', padding: 0, position: 'relative', top: '-30px'}}>
                            {price_.hasOwnProperty('price') ? Object.values(price_)[0] : ' '}
                        </label>
                        <label style={{fontSize: 120, fontWeight: 'bold', position: 'relative', top: '-30px'}}>грн</label>
                        <br/>
                        <label style={{fontSize: 84, padding: 0, position: 'relative', top: '-50px', zIndex: '1001'}}>
                            {ua.hasOwnProperty('name')  ? ua.name  : ' '} {sex === undefined ? ' ' : sex}
                        </label>
                        <div style={{position: 'absolute', top: '60%', left: '6%', }}>
                        <Barcode value={bar} format="EAN13" fontSize={72} width={8} height={180}/>
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