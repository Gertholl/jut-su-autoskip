
function waitForElement(selector, callback) {
    if (document.querySelector(selector)) {
        callback();
    }

    setTimeout(function () {
        waitForElement(selector, callback);
    }, 1000);
}


function send_post(msg_id, data) {


    chrome.storage.sync.get(["api_token", "chat_id", "notify"]).then((result) => {
        const token = result.api_token
        const chat_id = result.chat_id
        const notify = result.notify
        console.log(token, chat_id, notify, data)
        if (notify === true) {
            send_photo(token, chat_id, data)
        } else {
            console.log('Уведомления отключены')
        }
    }).catch((error) => {
        console.log(error)
    });
}


function send_photo(token, chat_id, data) {
    const telegramApiUrl = `https://api.telegram.org/bot${token}/sendPhoto`;
    const msg = '<b>Эпизод:</b>\n' + data.title + '\n\n' + '<b>Описание:</b>\n' + data.description + '\n\n';

    const body_data = {
        chat_id: chat_id,
        photo: data.image,
        caption: msg,
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Смотреть онлайн', url: data.url, callback_data: 'button_click' }]  // Inline-кнопка (опционально)
            ]
        },
        parse_mode: 'HTML',
    }

    fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body_data)
    })
        .then(response => response.json())
        .then(result => {
            console.log('Фото отправлено:', result);
        })
        .catch(error => {
            console.error('Ошибка при отправке фото:', error);
        });

}

function is_paused() {
    var player = document.getElementById('my-player');
    return player.classList.contains('vjs-paused')
}

function get_meta_info(msg_id, timestamp) {
    var title = document.getElementsByTagName('h2')[1].textContent;
    var url = window.location.href;
    var image = document.querySelector('meta[property="og:image"]').getAttribute('content');
    var description = document.querySelector('meta[name="description"]').getAttribute('content');
    var keywords = document.querySelector('meta[name="keywords"]').getAttribute('content');
    var current_time = document.querySelector('.vjs-current-time-display').textContent;
    var duration = document.querySelector('meta[itemprop=duration]').getAttribute('content')
    data = {
        msg_id: msg_id ? msg_id : null,
        title: title,
        url: url,
        image: image,
        description: description,
        duration: duration,
        keywords: keywords,
        current_time: current_time,
        timestamp: my_current_timestamp
    }

    return data
}


function play() {
    var player = document.getElementById('my-player');
    // content.js


    if (player.classList.contains('vjs-paused') && (player.classList.contains('vjs-has-started') == false)) {
        btn = document.getElementsByClassName('vjs-big-play-button')[0]
        btn.click()
        log('Play')
        my_current_timestamp = current_date()
        data = get_meta_info(null)
        my_msg_id = null
        send_post(my_msg_id, data)
        // sender_post(data, 'http://127.0.0.1:8081/extension/', (response) => {
        //     my_msg_id = response.msg_id ? response.msg_id : null
        // })
    }
}

function update_current_time(msg_id) {
    data = get_meta_info(msg_id)
    // sender_post(data, 'http://127.0.0.1:8081/extension/', (response) => {
    //     if (response.ok) {
    //         console.log('Update Current Time')
    //     }
    // })
}

function sender_post(JSONdata, ApiUrl, callback) {
    chrome.runtime.sendMessage(
        {
            contentScriptQuery: "postData",
            data: JSONdata,
            url: ApiUrl,
        }, function (response) {
            if (response != undefined && response != "") {
                console.log(my_msg_id)
                callback(response);
            }
            else {
                callback(null);
            }
        });

}

function request(title, url) {
    fetch('http://127.0.0.1:8081/extension/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            url: url,

            timestamp: current_date(),
        }),
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response data here
            console.log(data);
        })
        .catch(error => {
            // Handle any errors that occurred during the request
            console.log(error);
        });
}


function log(message) {
    formattedDate = current_date();
    console.log(message, window.location.href, formattedDate);

}


function convertTimeString(timeStr) {
    const [days, time] = timeStr.split('T');
    const [hours, minutes, seconds] = time.split('M').join('').split('S').join('');

    const duration = {
        days: parseInt(days),
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        seconds: parseInt(seconds),
    };
    const date = new Date();
    const formatter = date.toLocaleTimeString('ru-RU', { style: 'long' });
    const humanReadableTime = formatter.format(duration);

    return humanReadableTime;
}


function current_date() {
    let currentDate = new Date();
    let options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    let formattedDate = currentDate.toLocaleString('ru-RU', options);
    return formattedDate
}


function send_poll(msg_id) {
    data = get_meta_info(msg_id)
    // sender_post(data, 'http://127.0.0.1:8081/poll/', null)
}

function auto_skip() {
    var skip_btns = document.getElementsByClassName('vjs-overlay-skip-intro');

    var intro_skip = skip_btns[0];
    var next_episode = skip_btns[1];
    // console.log(next_episode)
    var myPlayer = document.querySelector('.my-fullscreen-btn');
    // myPlayer.scrollIntoView()
    const event = new MouseEvent('mouseover', {
        view: window,
        bubbles: true,
        cancelable: true
    })

    if (intro_skip.classList.contains('vjs-hidden') === false) {
        intro_skip.click()
        setTimeout(() => {
            myPlayer.dispatchEvent(event)
        }, 100)
        myPlayer.click()
    }

    if (next_episode.classList.contains('vjs-hidden') === false) {
        // send_poll(my_msg_id)
        next_episode.click()
        log('Next Episode')
    }
}

my_msg_id = null
my_current_timestamp = null



const button = document.createElement('button');
button.innerText = 'В полноэкранный режим';
button.classList.add('my-fullscreen-btn');
document.querySelector('#dle-content > div > div.videoContent > div.videoBlock > div.post_media.pm_videojs').appendChild(button);

button.addEventListener('click', () => {
    const element = document.querySelector('#my-player'); // или другой элемент
    if (element) {
        if (element.requestFullscreen) {
            // element.classList.toggle('vjs-fullscreen');
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            // element.classList.toggle('vjs-fullscreen');
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            // element.classList.toggle('vjs-fullscreen');
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            // element.classList.toggle('vjs-fullscreen');
            element.msRequestFullscreen();
        }
    }
});

waitForElement('#my-player', play)
waitForElement('.vjs-overlay-skip-intro', auto_skip)
// observer.observe(document, { childList: true, subtree: true })
setInterval(() => {
    update_current_time(my_msg_id)
}, 10000)