//vars
const createShapesButton = document.querySelector('#createShapes');
const cancelButton = document.querySelector('#cancel');
const shapeMenu = document.querySelector('#shape');
const countInput = document.querySelector('#count');

//on load function
document.addEventListener("DOMContentLoaded", function() {
    formValidation();
});

//initialize select menu
selectMenu.init();

//event listeners
countInput.oninput = () => { formValidation(); }
shapeMenu.onchange = () => { formValidation(); }
createShapesButton.onclick = () => { createShapes(); }
cancelButton.onclick = () => { cancel(); }

//form validation
var formValidation = function(event) {

    if (shapeMenu.value === '' || countInput.value === '') {
        createShapesButton.disabled = true;
    } else {
        createShapesButton.disabled = false;
    }
}



//functions
function createShapes() {
    parent.postMessage({ pluginMessage: { 
        'type': 'create-shapes', 
        'count': countInput.value,
        'shape': shapeMenu.value
    } }, '*');
}

function cancel() {
    parent.postMessage({ pluginMessage: { 'type': 'cancel' } }, '*')
}