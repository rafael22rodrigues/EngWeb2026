let popupCallback = null; // callback para o function mode 

function openPopup(action, mode = 'form', msg) {
    document.getElementById('confirmation-overlay').style.display = 'flex';
    document.getElementById('confirmation-message-text').innerText = msg;

    const form = document.getElementById('confirmation-form');
    const funcBtn = document.getElementById('confirmation-func-btn');

    if (mode === 'form') {
        form.style.display = 'block';
        funcBtn.style.display = 'none';
        form.action = action;
    } else { // function mode
        form.style.display = 'none';
        funcBtn.style.display = 'block';
        popupCallback = action;
        funcBtn.onclick = function() {
            if (popupCallback) popupCallback();
            closePopup();
        };
    }
}

function closePopup() {
    document.getElementById('confirmation-overlay').style.display = 'none';
    popupCallback = null;
}
window.onclick = function(event) {
    const overlay = document.getElementById('confirmation-overlay');
    if (event.target == overlay) {
        closePopup();
    }
}