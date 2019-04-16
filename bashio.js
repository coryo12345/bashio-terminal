const FILE_TYPES = {
    FILE: 'file',
    DIR: 'dir',
};

/**
 * A tree data structure to keep track of directories
 */
class Tree {
    constructor(name, fileType) {
        this.name = name;
        this.type = fileType;
        this.children = [];
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
    let a = document.createTextNode("--This is a simulated terminal environment.--");
    element.appendChild(a);
    newLine("--Type '!' to view implemented commands.-----");
    newPromptLine();
}

/**
 * builds the starting environment for the terminal
 * @return root node of tree
 */
function directoryInit() {
    let a = new Tree("file.txt", FILE_TYPES.FILE);
    let aa = new Tree("notes.txt", FILE_TYPES.FILE);
    let b = new Tree("my_stuff", FILE_TYPES.DIR);
    b.addChild(aa);
    let c = new Tree(".bashrc", FILE_TYPES.FILE);
    let rr = [a, b, c];
    var root = new Tree("~", FILE_TYPES.DIR);
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
    }
    // ls
    else if (curr_line.substr(0, 2) == "ls") {
        // TODO arguments
        let str = "";
        dir.getChildren().forEach(element => {
            str += element.getName();
            str += " ";
        });
        newLine(str);
    }
    // cd
    else if (curr_line.substr(0, 2) == "cd") {
        // TODO
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