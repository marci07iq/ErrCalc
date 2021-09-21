var rownum = 0;
var colnum = 0;

var cells = {};
var rows = {};

var headerRows;

var headerCells = [{},{},{}];

function createCell() {
	var tdElem = document.createElement("td");
	var input = document.createElement("input");
	input.classList.add('cell');
	tdElem.appendChild(input);
	return [tdElem, input];
}

function addRow() {
	var newRow = document.createElement("tr");
	var cols = {};

	var tdRowHead = document.createElement("td");
	//var name = document.createElement("input");
	//tdRowHead.appendChild(name);
	tdRowHead.innerText = rownum + 1;
	//name.disabled = true;
	newRow.appendChild(tdRowHead);

	for (var i = 0; i < colnum; i++) {
		var newCell = createCell();
		cols[i] = newCell[1];
		newRow.appendChild(newCell[0]);
	}
	document.getElementById("spreadsheet").appendChild(newRow);

	cells[rownum] = cols;
	rows[rownum] = newRow;

	++rownum;
}

function addCol() {
	var headerTd = document.createElement("td");
	var headerInp = document.createElement("input");
	headerTd.appendChild(headerInp);
	headerRows[0].appendChild(headerTd);
	headerCells[0][colnum] = headerInp;

	var headerTd = document.createElement("td");
	var headerInp = document.createElement("input");
	headerTd.appendChild(headerInp);
	headerRows[1].appendChild(headerTd);
	headerCells[1][colnum] = headerInp;

	var headerTd = document.createElement("td");
	var headerInp = document.createElement("input");
	headerTd.appendChild(headerInp);
	headerRows[2].appendChild(headerTd);
	headerCells[2][colnum] = headerInp;

	for (var i = 0; i < rownum; i++) {
		var newCell = createCell();
		cells[i][colnum] = newCell[1];
		rows[i].appendChild(newCell[0]);
	}

	++colnum;
}

function init() {
	headerRows = [document.getElementById("symbol_label"), document.getElementById("symbol_unit"), document.getElementById("symbol_exp")];
	addRow();
	addCol();
}

function calc() {
	var colNameIds = {};

	for(var c = 0; c < colnum; c++) {
		if(headerCells[2][c].value.length) {
			for(var r = 0; r < rownum; r++) {
				resetLiterals();
				for(var key in colNameIds) {
					literals[key] = readVal(cells[r][colNameIds[key]].value, 0)[1];
				}
				cells[r][c].value = readBrackets(headerCells[2][c].value,0)[1].getValue().stringAbs();
			}
		}
		if(headerCells[0][c].value.length) {
			colNameIds[headerCells[0][c].value] = c;
		}
	}
}

function exportLatex() {
	var tab="";
	for(var c=0;c < colnum; c++) {
	    tab += headerCells[0][c].value + headerCells[1][c].value + " & ";
	}
	tab += "\\\\\n\\hline\n"
	for(var r=0; r < rownum; r++) {
	  for(var c=0;c < colnum; c++) {
		if(c > 0) {
		  tab += " & ";
		}
	    tab += "$" + readVal(cells[r][c].value.replace("±","#"), 0)[1].stringPerc().replace("#"," \\pm ").replace("±","\\pm") + "$";
	  }
	    tab += "\\\\\n"
	}
	return tab;
}

function exportCsv() {
	var tab="";
	for(var c=0;c < colnum; c++) {
	    tab += headerCells[0][c].value + headerCells[1][c].value + ", d" + headerCells[0][c].value + headerCells[1][c].value + ", ";
	}
	tab += "\n";
	for(var r=0; r < rownum; r++) {
	  for(var c=0;c < colnum; c++) {
	    tab += readVal(cells[r][c].value.replace("±","#"), 0)[1].stringAbs().replace("±","#").split("#").join(", ") + ", ";
	  }
	  tab += "\n";
	}
	return tab;
}

function readSavefile() {
	var vals = JSON.parse(localStorage.getItem('err_spreadsheet'));

	for(var r = 0; r < vals.length; r++) {
		if(rownum <= r) {
			addRow();
		}
		for(var c = 0; c < vals[r].length; c++) {
			if(colnum <= c) {
				addCol();
			}
			cells[r][c].value = vals[r][c];
		}
	}
}

function createSavefile() {
	var vals = [];
	for(var r = 0; r < rownum; r++) {
		vals.push([]);
		for(var c = 0; c < colnum; c++) {
			vals[r].push(cells[r][c].value);
		}
	}
	localStorage.setItem('err_spreadsheet', JSON.stringify(vals));
	//return JSON.stringify(vals);
}
