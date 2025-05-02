
function save() {
    console.log('Зашел в сохранение')
    var api_token = document.querySelector('#api_token').value;
    var chat_id = document.querySelector('#chat_id').value;
    var checkbox = document.querySelector('#checkbox1').checked;
    console.log(api_token, chat_id, checkbox)
    chrome.storage.sync.set({ api_token: api_token }).then(() => {
        console.log("api_token is set");
    });

    chrome.storage.sync.set({ chat_id: chat_id }).then(() => {
        console.log("chat_id is set");
    });

    chrome.storage.sync.set({
        notify: checkbox
    }).then(() => {
        console.log("notify is set");
    })
    console.log('Saved')
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(["api_token", "chat_id", "notify"]).then((result) => {
        console.log("Value is " + result.api_token);
        document.querySelector('#api_token').value = result.api_token
        console.log("Value is " + result.chat_id);
        document.querySelector('#chat_id').value = result.chat_id
        document.querySelector('#checkbox1').checked = result.notify
        console.log("Value is " + result.notify);
    });

})

document.querySelector('#save').addEventListener('click', save);
