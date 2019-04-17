const FILE_TYPES = {
    FILE: 'file',
    DIR: 'dir',
};

/**
 * A tree data structure to keep track of directories
 */
class Tree {
    constructor(name, parent, fileType) {
        this.name = name;
        this.type = fileType;
        this.children = [];
        this.parent = parent;
    }

    getName() {
        return this.name;
    }

    getType() {
        return this.type;
    }

    getChildren() {
        return this.children;
    }

    addChild(newChild) {
        this.children.push(newChild);
    }

    removeChild(child) {
        let pos = this.children.indexOf(child);
        if (pos !== -1) this.children.splice(pos, 1);
    }

    getParent() {
        return this.parent;
    }

    setParent(node) {
        this.parent = node;
    }
}

/**
 *  var element
 *  the bashio terminal html element
 */
var element = document.getElementById("bashio-terminal");
// REMOVE INSTANTIATION BEFORE PRODUCTION //

/**
 *  var user
 *  the current user to use
 */
var user = "user";
var host = "host";
var ELEMENT_SELECTED = false;
var curr_line = "";
var root_tree = directoryInit();
var dir = root_tree;

function mainLoop() {
    let lastLine = element.lastChild;
    lastLine.textContent = `${user}@${host} ${dir.getName()}$ ${curr_line}`;
    //console.log(lastLine);
}

window.addEventListener("DOMContentLoaded", (ev) => {
    element = document.getElementById("bashio-terminal");
    element_init();
    setInterval(mainLoop, 1000 / 15);
});

document.addEventListener("click", (ev) => {
    let rect = element.getBoundingClientRect();
    if (ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom) {
        ELEMENT_SELECTED = true;
    } else {
        ELEMENT_SELECTED = false;
    }
});

document.addEventListener("keydown", (ev) => {
    if (!ELEMENT_SELECTED) {
        return;
    }
    ev = ev || window.event;
    var code = ev.which || ev.keyCode;
    // pressed enter
    if (code == 13) {
        handleCommand();
    }
    // delete or backspace
    if (code == 8 || code == 46) {
        curr_line = curr_line.substring(0, curr_line.length - 1);
        return;
    }
});

document.addEventListener("keypress", (ev) => {
    if (!ELEMENT_SELECTED) {
        return;
    }
    ev = ev || window.event;
    var code = ev.which || ev.keyCode;
    if (code == 127) {
        return;
    }
    // add the character
    var str = String.fromCharCode(code);
    curr_line += str;
});

/**
 * Initialize the style of the terminal
 * print out starting messages
 */
function element_init() {
    curr_line = "";
    element.style.width = "900px";
    element.style.height = "400px";
    element.style.maxWidth = "900px";
    element.style.maxHeight = "400px";
    element.style.background = "black";
    element.style.color = "white";
    element.style.fontSize = "1.2em";
    element.style.fontFamily = "monospace";
    user = element.getAttribute("user");
    host = element.getAttribute("host");
    clear();
    newPromptLine();
}

/**
 * builds the starting environment for the terminal
 * @return root node of tree
 */
function directoryInit() {
    var root = new Tree("~", null, FILE_TYPES.DIR);
    root.setParent(root);
    let a = new Tree("file.txt", root, FILE_TYPES.FILE);
    let b = new Tree("my_stuff", root, FILE_TYPES.DIR);
    let aa = new Tree("notes.txt", b, FILE_TYPES.FILE);
    b.addChild(aa);
    let c = new Tree(".bashrc", root, FILE_TYPES.FILE);
    root.addChild(a);
    root.addChild(b);
    root.addChild(c);
    return root;
}

/**
 * handleCommand
 * takes the current line and parses it for available commands
 * then creates a new prompt line
 */
function handleCommand() {
    curr_line = curr_line.trim();
    // help message
    if (curr_line.substring(0, 1) == "!") {
        newLine("Supported Commands:");
        newLine("cd [dir]");
        newLine("ls [-aAlF]");
        newLine("clear");
    }
    // ls
    else if (curr_line.substr(0, 2) == "ls") {
        // TODO arguments
        let args = curr_line.split(" ");
        let a = false;
        let A = false;
        let l = false;
        let F = false;
        if (args.length >= 2) {
            let str = args[1].trim();
            if (str.charAt() == "-" && str.length >= 2) {
                for (let i = 1; i < str.length; i++) {
                    let char = str.charAt(i);
                    switch (char) {
                        case "a":
                            a = true;
                            break;
                        case "A":
                            A = true;
                            break;
                        case "l":
                            l = true;
                            break;
                        case "F":
                            F = true;
                            break;
                        default:
                            continue;
                    }
                }
            }
        }

        let str = "";
        if (a && F) {
            str += "./ ../ "
        } else if (a) {
            str += ". .. "
        }
        dir.getChildren().forEach(element => {
            // TODO -l long listing flag //
            if (element.getName().trim().charAt() != "." || a || A) {
                str += element.getName();
                if (F && element.getType() == FILE_TYPES.DIR) {
                    str += "/";
                }
                // TODO CHECK PERMISSIONS AND PRINT * //
                str += " ";
            }
        });
        newLine(str);
    }
    // cd
    else if (curr_line.substr(0, 2) == "cd") {
        if (curr_line.split(" ").length < 2) {
            newPromptLine();
            return;
        }
        let target = curr_line.split(" ")[1];
        if(target == ".."){
            dir = dir.getParent();
            newPromptLine();
            return;
        }
        let chi = dir.getChildren();
        let found = false;
        for (let i = 0; i < chi.length; i++) {
            if (target === chi[i].getName()) {
                if (chi[i].getType() != FILE_TYPES.DIR) {
                    newLine(`bash: cd: ${chi[i].getName()}: Not a directory`);
                } else {
                    dir = chi[i];
                }
                found = true;
            }
        }
        if(!found){
            newLine(`bash: cd: ${target}: No such file or directory`);
        }
    }
    else if (curr_line.substr(0, 5) == "clear") {
        clear();
    }
    else {
        newLine(`bash: ${curr_line.split(" ")[0]}: command not found`);
    }
    newPromptLine();
}

/**
 * newLine
 * @param str takes a string and prints it in the terminal
 */
function newLine(str) {
    let br = document.createElement("br");
    let t = document.createTextNode(str);
    element.appendChild(br);
    element.appendChild(t);
}

/**
 * newPromptLine
 * creates a new text node and resets the current line
 */
function newPromptLine() {
    let t = document.createTextNode(`${user}@${host} ${dir.getName()}$ `);
    let br = document.createElement("br");
    curr_line = "";
    element.appendChild(br);
    element.appendChild(t);
}

/**
 * clear
 * removes all children of terminal element
 * then prints out info message
 */
function clear() {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    let a = document.createTextNode("--This is a simulated terminal environment.--");
    element.appendChild(a);
    newLine("--Type '!' to view implemented commands.-----");
}