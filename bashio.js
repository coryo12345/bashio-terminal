var element;
var user = "user";
var host = "host";

window.addEventListener("DOMContentLoaded", (ev) => {
    element = document.getElementById("bashio-terminal");
    element_init();
});

function element_init(){
    element.style.width = "900px";
    element.style.height = "400px";
    element.style.background = "black";
    user = element.getAttribute("user");
    machine = element.getAttribute("host");
}

function new_prompt_line(){
    element.create
}