import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver'; // npm install file-saver
//import * as XLSX from 'xlsx'; // npm install xlsx
import * as XLSX from 'xlsx-js-style'; // npm install xlsx-js-style

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {
constructor() { }

public exportAsExcelFile(json: any[], excelFileName: string, header?:any[], styles?:any[], expandable?:boolean): void {
  let cols=[];
  if (header!==undefined || header.length>0) {
    
    let resultat : any[]=[];
    json.forEach(item => {
      //const res = new MIRecord;
      
      let res: any[]=[];
      header.forEach(field => {
        
       //const value= item[field['field']]?  item[field['field']]  : ' ';
       //const name= field['name'];
       //res.setString(name,value);
       if (field['type']==='N') {
        res[field['name']]=Number(item[field['field']])?  Number(item[field['field']])  : 0;
       } else {
        res[field['name']]=item[field['field']]?  item[field['field']]  : ' ';
       }

       if (field['type']==='Bool') {
        res[field['name']]=item[field['field']]==="true"? "X"  : "";
       } 
       
       cols.push({ wch: field.size + 1 });
      });
      resultat.push(res);
      
      if (expandable && item.children!==undefined) {
        item.children.forEach(children => {
          let res1: any[]=[];
          header.forEach(field => {
            if (field['type']==='N') {
             res1[field['name']]=Number(children[field['field']])?  Number(children[field['field']])  : 0;
            } else {
             res1[field['name']]=children[field['field']]?  children[field['field']]  : ' ';
            }
     
            if (field['type']==='Bool') {
             res1[field['name']]=children[field['field']]==="true"? "X"  : "";
            } 
            
            cols.push({ wch: field.size + 1 });
           });
           resultat.push(res1);
        }) 
      }
      
   });
   json=resultat; 
  }
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);

  // traitement des entête de colonne
  for (var i in worksheet) {
    //console.log(worksheet[i]);
    if (typeof worksheet[i] != 'object') continue;
    let cell = XLSX.utils.decode_cell(i);

    worksheet[i].t = 's';
    //worksheet[i].v = header[cell.c].format!==undefined? worksheet[i].v + header[cell.c].format : worksheet[i].v;

    worksheet[i].s = {
      // styling for all cells
      font: {
        name: 'arial',
      },
      alignment: {
        vertical: 'center',
        horizontal: header[cell.c].type==='N'? 'right': header[cell.c].type==='Bool'? 'center' :'left',
        wrapText: true, // any truthy value here
      },
      border: {
        right: {
          style: 'thin',
          color: '000000',
        },
        left: {
          style: 'thin',
          color: '000000',
        },
        bottom: {
          style: 'thin',
          color: '000000',
        },
        top: {
          style: 'thin',
          color: '000000',
        },
      },
    };

    if (cell.r ===0) {
      worksheet[i].s.fill = {
        patternType: 'solid',
        fgColor: { rgb: header[cell.c].headerbgColorRGB!==undefined? header[cell.c].headerbgColorRGB : 'b2b2b2' },
        bgColor: { rgb: header[cell.c].headerbgColorRGB!==undefined? header[cell.c].headerbgColorRGB : 'b2b2b2' },
      };
    } else { // traitement des cellules
      worksheet[i].s.fill = {
        // background color
        patternType: 'solid',
        fgColor: { rgb: header[cell.c].bgColorRGB!==undefined? header[cell.c].bgColorRGB : 'ffffff' },
        bgColor: { rgb: header[cell.c].bgColorRGB!==undefined? header[cell.c].bgColorRGB : 'ffffff' },
      };
      worksheet[i].s.font = {
        bold: header[cell.c].bold!==undefined? header[cell.c].bold : false,
        color: { rgb: header[cell.c].color!==undefined? header[cell.c].color : '000000' },
      };
      worksheet[i].v = header[cell.c].format!==undefined? worksheet[i].v + header[cell.c].format : worksheet[i].v;

      
 
    }

  }
  // traitement des styles conditionnels
  for (var i in worksheet) {
    //console.log(worksheet[i]);
    if (typeof worksheet[i] != 'object') continue;
    let cell = XLSX.utils.decode_cell(i);
    if (cell.r >0) {
      if (styles!==undefined || styles.length>0){
        styles.forEach(style => {
        
        if (header[cell.c].field===style.field)  {
          switch (style.operator) {
            case '=':
              if (worksheet[i].v.trim() ===style.value) {
                if (style.bold!==undefined){
                  worksheet[i].s.font.bold = style.bold;
                }
                if (style.color!==undefined){
                  worksheet[i].s.font.color.rgb = style.color;
                }
                if (style.bgcolor!==undefined){
                  worksheet[i].s.fill.fgColor.rgb= style.bgColor,
                  worksheet[i].s.fill.bgColor.rgb= style.bgColor
                }

                if (style.rowbgColorRGB!==undefined){
                  for (let c = 0; c < header.length; c++) {
                    let ligne= XLSX.utils.encode_cell({c:c, r:cell.r});
                    worksheet[ligne].s.fill.fgColor.rgb = style.rowbgColorRGB;
                    worksheet[ligne].s.fill.bgColor.rgb = style.rowbgColorRGB;
                  }
                }
                if (style.rowbold!==undefined){
                    for (let c = 0; c < header.length; c++) {
                      let ligne= XLSX.utils.encode_cell({c:c, r:cell.r});
                      worksheet[ligne].s.font.bold = style.rowbold;
                    }
                }
                if (style.rowcolor!==undefined){
                  for (let c = 0; c < header.length; c++) {
                    let ligne= XLSX.utils.encode_cell({c:c, r:cell.r});
                    worksheet[ligne].s.font.color.rgb = style.rowcolor;
                  }
                }
              }
            break;

            case '!=':
              if (worksheet[i].v.trim() !==style.value) {
                if (style.bold!==undefined){
                  worksheet[i].s.font.bold = style.bold;
                }
                if (style.color!==undefined){
                  worksheet[i].s.font.color.rgb = style.color;
                }
                if (style.rowbgColorRGB!==undefined){
                  for (let c = 0; c < header.length; c++) {
                    let ligne= XLSX.utils.encode_cell({c:c, r:cell.r});
                    worksheet[ligne].s.fill.fgColor.rgb = style.rowbgColorRGB;
                    worksheet[ligne].s.fill.bgColor.rgb = style.rowbgColorRGB;
                  }
                }
                if (style.rowbold!==undefined){
                    for (let c = 0; c < header.length; c++) {
                      let ligne= XLSX.utils.encode_cell({c:c, r:cell.r});
                      worksheet[ligne].s.font.bold = style.rowbold;
                    }
                }
                if (style.rowcolor!==undefined){
                  for (let c = 0; c < header.length; c++) {
                    let ligne= XLSX.utils.encode_cell({c:c, r:cell.r});
                    worksheet[ligne].s.font.color.rgb = style.rowcolor;
                  }
                }
              }
            break;
            default:
            break;
            }
          
          }
          
          if (style.row === cell.r && style.col === cell.c ){
            if (style.bold!==undefined){
              worksheet[i].s.font.bold = style.bold;
            }
            if (style.color!==undefined){
              worksheet[i].s.font.color.rgb = style.color;
            }
            if (style.bgcolor!==undefined){
              worksheet[i].s.fill.fgColor.rgb= style.bgcolor,
              worksheet[i].s.fill.bgColor.rgb= style.bgcolor
            }
          }
        })
      }
      
      
    }
  }  

  if (cols.length>0) {worksheet["!cols"] = cols; }

  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'données');
  //XLSX.writeFile(wb, 'ScoreSheet.xlsx');

  //const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  this.saveAsExcelFile(excelBuffer, excelFileName);
}

private saveAsExcelFile(buffer: any, fileName: string): void {
   const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
   FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
}
}