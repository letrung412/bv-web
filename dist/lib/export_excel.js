"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moneyToWord = exports.removeVietnameseTones = exports.ExportExcel = void 0;
const xlsx = require("sheetjs-style");
function formatColumn(workSheet, range, style, format) {
    for (let C = range.s.c; C <= range.e.c; C++) {
        for (let R = range.s.r; R <= range.e.r; R++) {
            const cellref = xlsx.utils.encode_cell({ c: C, r: R });
            if (workSheet[cellref]) {
                workSheet[cellref].s = style;
                if (workSheet[cellref].t == "n") {
                    workSheet[cellref].z = format;
                }
            }
        }
    }
}
function ExportExcel(req, res, data, header, workSheetName, file_name) {
    const workBook = xlsx.utils.book_new();
    const workSheetData = xlsx.utils.aoa_to_sheet(header);
    const workSheet = xlsx.utils.sheet_add_json(workSheetData, data, { origin: "A4" });
    workSheet["!cols"] = [
        { wpx: 30 }, { wpx: 120 }, { wpx: 70 }, { wpx: 50 }, { wpx: 50 }, { wpx: 50 }, { wpx: 50 }, { wpx: 50 }, { wpx: 50 }, { wpx: 50 }, { wpx: 50 }, { wpx: 50 }
    ];
    workSheet["!rows"] = [
        { hpx: 20 }, { hpx: 20 }, { hpx: 20 }, { hpx: 20 }, { hpx: 20 }, { hpx: 20 }, { hpx: 20 }, { hpx: 20 }, { hpx: 20 }, { hpx: 20 }, { hpx: 20 },
    ];
    const range = xlsx.utils.decode_range(workSheet["!ref"]);
    // console.log(range)
    const range_ws = { s: { c: 0, r: 0 }, e: { c: range.e.c, r: range.e.r - 9 } };
    const ws_style = {
        font: { sz: 10 },
        alignment: { horizontal: "right" },
        border: {
            top: { style: "medium" },
            bottom: { style: "medium" },
            left: { style: "medium" },
            right: { style: "medium" },
        }
    };
    const ws_format = "#,##0";
    formatColumn(workSheet, range_ws, ws_style, ws_format);
    // style title
    const rangeR4 = { s: { c: 0, r: 3 }, e: { c: range.e.c, r: 3 } };
    const r4_style = {
        font: { sz: 12, bold: true },
        alignment: { horizontal: "center" },
        border: {
            top: { style: "medium" },
            bottom: { style: "medium" },
            left: { style: "medium" },
            right: { style: "medium" },
        }
    };
    formatColumn(workSheet, rangeR4, r4_style);
    // style footer 
    const range_footer = { s: { c: 0, r: range.e.r - 9 }, e: { c: range.e.c, r: range.e.r - 9 } };
    const style_footer = {
        font: { sz: 10, color: { rgb: "3e7db7" }, bold: true },
        border: {
            top: { style: "medium" },
            bottom: { style: "medium" },
            left: { style: "medium" },
            right: { style: "medium" },
        }
    };
    formatColumn(workSheet, range_footer, style_footer);
    //style alert order cancel
    const range_alert = { s: { c: range.e.c, r: 4 }, e: { c: range.e.c, r: range.e.r - 9 } };
    const style_alert = {
        font: { sz: 10, color: { rgb: "aca888" } },
        border: {
            top: { style: "medium" },
            bottom: { style: "medium" },
            left: { style: "medium" },
            right: { style: "medium" },
        }
    };
    formatColumn(workSheet, range_alert, style_alert);
    // style money
    const range_money = { s: { c: 0, r: range.e.r - 8 }, e: { c: 6, r: range.e.r - 5 } };
    const style_money = {
        font: { sz: 12, color: { rgb: "3e7db7" }, bold: true },
    };
    formatColumn(workSheet, range_money, style_money);
    //style date
    const range_date = { s: { c: 7, r: range.e.r - 5 }, e: { c: 7, r: range.e.r - 5 } };
    const style_date = {
        font: { sz: 12 },
    };
    formatColumn(workSheet, range_date, style_date);
    //style role info
    const range_role = { s: { c: 0, r: range.e.r - 4 }, e: { c: range.e.c, r: range.e.r - 4 } };
    const style_role = {
        font: { sz: 12 }
    };
    formatColumn(workSheet, range_role, style_role);
    //style signature 
    const range_sig = { s: { c: 0, r: range.e.r - 3 }, e: { c: 8, r: range.e.r - 3 } };
    const style_sig = {
        font: { sz: 11, italic: true },
    };
    formatColumn(workSheet, range_sig, style_sig);
    // style des
    const rangeA = { s: { c: 0, r: 0 }, e: { c: 2, r: 1 } };
    const styleA = {
        font: { sz: 12, bold: true }
    };
    formatColumn(workSheet, rangeA, styleA);
    const range_fullname = { s: { c: 1, r: range.e.r }, e: { c: 1, r: range.e.r } };
    const style_fullname = {
        font: { sz: 13, bold: true }
    };
    formatColumn(workSheet, range_fullname, style_fullname);
    //style header
    workSheet["D1"].s = {
        font: { bold: true, underline: true, sz: 16 }
    };
    xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName);
    res.setHeader("Content-Disposition", `attachment; filename=${file_name}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).end(xlsx.write(workBook, { bookType: "xlsx", type: "buffer" }));
}
exports.ExportExcel = ExportExcel;
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, " ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    return str;
}
exports.removeVietnameseTones = removeVietnameseTones;
function readThreeDigits(number) {
    const digitText = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    let word = "";
    let numberDigits = [...number.toString()].map(Number).reverse();
    if (numberDigits[2]) {
        word += digitText[numberDigits[2]] + " trăm";
    }
    if (numberDigits[1]) {
        if (numberDigits[1] === 1) {
            word += " mười";
        }
        else {
            word += " " + digitText[numberDigits[1]] + " mươi";
        }
    }
    else if (numberDigits[2] && numberDigits[0]) {
        word += " linh";
    }
    if (numberDigits[0]) {
        if (numberDigits[0] === 5 && numberDigits[1]) {
            word += " lăm";
        }
        else if (numberDigits[0] === 1 && numberDigits[1] && numberDigits[1] !== 1) {
            word += " mốt";
        }
        else {
            word += " " + digitText[numberDigits[0]];
        }
    }
    return word;
}
;
function capitalizeString(str) {
    const arrString = str.split(" ").map(el => el).filter(string => string.trim().length > 0);
    const results = arrString.map(string => {
        return string[0].toUpperCase() + string.substr(1);
    });
    return results.join(" ");
}
function moneyToWord(money) {
    if (money == 0)
        return "Không đồng";
    const unit = [" nghìn ", " triệu ", " tỷ "];
    const space = " ";
    let word = "";
    let moneyTemp = money;
    let threeDigitsNumberArr = [];
    while (moneyTemp > 0) {
        threeDigitsNumberArr.push(moneyTemp % 1000);
        moneyTemp = Math.floor(moneyTemp / 1000);
    }
    if (threeDigitsNumberArr[0]) {
        word += readThreeDigits(threeDigitsNumberArr[0]) + space;
    }
    if (threeDigitsNumberArr[1]) {
        word = readThreeDigits(threeDigitsNumberArr[1]) + unit[0] + word;
    }
    if (threeDigitsNumberArr[2]) {
        word = readThreeDigits(threeDigitsNumberArr[2]) + unit[1] + word;
    }
    if (threeDigitsNumberArr[3]) {
        word = readThreeDigits(threeDigitsNumberArr[3]) + unit[2] + word;
    }
    if (threeDigitsNumberArr[4]) {
        word = readThreeDigits(threeDigitsNumberArr[4]) + unit[0] + word;
    }
    if (threeDigitsNumberArr[5]) {
        word = readThreeDigits(threeDigitsNumberArr[5]) + unit[1] + word;
    }
    if (!(money % 1000000000000)) {
        word += unit[2];
    }
    if (threeDigitsNumberArr[6] !== undefined) {
        return "Money too much";
    }
    return capitalizeString(word) + " Đồng";
}
exports.moneyToWord = moneyToWord;
;
//# sourceMappingURL=export_excel.js.map