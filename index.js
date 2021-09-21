var taskHistory = [];

function calculate() {
    let ogtask = document.getElementById('console').value;
    let task = ogtask;
    document.getElementById('console').value = "";
    try {
        if (task[0] == '\\') {
            let cmdres;
            switch (task.split(" ")[0]) {
                case "\\list":
                    cmdres = "Symbols: ";
                    for (let name in literals) {
                        cmdres += "\n\u2192  " + name + " : " + literals[name].stringAbs();
                    }
                    putResult(task, cmdres);
                    break;
                case "\\listfns":
                    cmdres = "Functions: ";
                    for (let name in functions) {
                        cmdres += "\n\u2192  " + name;
                    }
                    putResult(task, cmdres);
                    break;
                case "\\listunits":
                    cmdres = "Units: ";
                    for (let unit in units) {
                        cmdres += "\n\u2192  " + unit;
                    }
                    putResult(task, cmdres);
                    break;
                case "\\load":
                    let pack = task.split(" ")[1];
                    loadLiteralPack(pack);
                    putResult(task, "Loaded " + pack);
                    break;
                case "\\delvar":
                    let varname = task.split(" ")[1];
                    putResult(task, "Deleted value " + varname);
                    delete literals[varname];
                    break;
                case "\\delfn":
                    let fnname = task.split(" ")[1];
                    putResult(task, "Deleted function " + fnname);
                    delete functions[fnname];
                    break;
                case "\\packs":
                    cmdres = "Packs: ";
                    for (let packname in literal_packs) {
                        cmdres += "\n\u2192  " + packname;
                    }
                    putResult(task, cmdres);
                    break;
                case "\\help":
                    putResult(task,
                        "\\list: Show current literals\n" +
                        "\\delvar: Delete variable\n" +
                        "\\listfns: Show current funtions\n" +
                        "\\delfn: Delete function\n" +
                        "\\listunits: Show current funtions\n" +
                        "\\packs: Show known literal packs\n" +
                        "\\load <pack>: Load literal pack\n" +
                        "\\help: Display this screen\n" +
                        ":varname=expression This is evaluated at definition time\n" +
                        ":funcname(arg1, arg2, ...)=expression This is evaluated each time the function is ran"
                    );
                    break;
                default:
                    putResult(task, "Undefined command, type \\help");
                    break;
            }
        } else {
            let fullTask = task;

            let writeTo = undefined;
            let isFn = false;

            if (task.length && task[0] == ':') {
                task = task.substr(1, task.length);
                let taskParts = task.split('=');
                task = "0";
                if (taskParts.length == 2) {
                    writeTo = taskParts[0];
                    task = taskParts[1];

                    //Functions
                    if (writeTo[writeTo.length - 1] == ")") {
                        isFn = true;
                        let fnnameparts = writeTo.split('(');
                        writeTo = fnnameparts[0];

                        let args = fnnameparts[1].substr(0, fnnameparts[1].length - 1).split(",");
                        let i, val;
                        [i, val] = readBrackets(task, 0);
                        if (i != task.length) {
                            throw Error("Function parse failed at " + task.substr(i));
                        }
                        let newfn = (argv) => {
                            context = {};
                            for (let i in args) {
                                context[args[i]] = argv[i];
                            }

                            return val.getValue(context);
                        }
                        functions[writeTo] = newfn;
                        putResult(fullTask, writeTo + "[" + args.join(",") + "] \u2192 " + task);
                    }
                } else {
                    putResult(fullTask, "Error: invalid definition");
                }
            }

            if (!isFn) {

                let [i, val] = readBrackets(task, 0);
                if (i != task.length) {
                    throw Error("Function parse failed at " + task.substr(i));
                }
                let res = val.getValue()
                literals["ans"] = res;

                if (writeTo) {
                    putResult(fullTask, writeTo + " := " + res.stringAbs());
                    literals[writeTo] = res;
                } else {
                    putResult(fullTask, res.stringAbs());
                }

            }

        }
    } catch (e) {
        putResult(ogtask, "Error: " + e);
    }
    taskHistory.push(ogtask);
    historyBrowser = taskHistory.length;
    wipTask = "";
}

function putResult(calc, res) {
    let elem = document.createElement("li");
    elem.classList.add("calculation");

    let elem_task = document.createElement("div");
    elem_task.classList.add("task");
    elem_task.innerText = calc;
    elem.appendChild(elem_task);

    let elem_tab = document.createElement("table");
    let elem_tr = document.createElement("tr");

    let elem_arrow = document.createElement("td");
    elem_arrow.style.verticalAlign = "top";
    elem_arrow.classList.add("arrow");
    elem_arrow.innerText = "\u2192";
    elem_tr.appendChild(elem_arrow);

    let elem_res = document.createElement("td");
    elem_res.classList.add("result");
    elem_res.innerText = res;
    elem_tr.appendChild(elem_res);

    elem_tab.appendChild(elem_tr);
    elem.appendChild(elem_tab);

    elem.appendChild(document.createElement("br"));

    document.getElementById("res").appendChild(elem);

    document.getElementById("res").scrollTo(0, document.getElementById("res").scrollHeight);
}

var historyBrowser = 0;
var wipTask = "";

document.addEventListener("keydown", function(e) {
    if (e.keyCode == 38) {
        historyBrowser--;
        historyBrowser = Math.max(historyBrowser, 0);
        if (historyBrowser < taskHistory.length) {
            document.getElementById('console').value = taskHistory[historyBrowser];
            document.getElementById('console').focus();
        }
    } else if (e.keyCode == 40) {
        historyBrowser++;
        historyBrowser = Math.min(historyBrowser, taskHistory.length);
        if (historyBrowser < taskHistory.length) {
            document.getElementById('console').value = taskHistory[historyBrowser];
            document.getElementById('console').focus();
        } else {
            document.getElementById('console').value = wipTask;
            document.getElementById('console').focus()
        }
    } else if (!e.ctrlKey || e.key == 'v') {
        document.getElementById('console').focus();
    }
}, true);