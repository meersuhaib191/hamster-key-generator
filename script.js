const gamePromoConfigs = {
    ChainCube2048: {
        appToken: 'd1690a07-3780-4068-810f-9b5bbf2931b2',
        promoId: 'b4170868-cef0-424f-8eb9-be0622e8e8e3',
        eventsDelay: 20000,
        attemptsNumber: 10
    },
    TrainMiner: {
        appToken: '82647f43-3f87-402d-88dd-09a90025313f',
        promoId: 'c4480ac7-e178-4973-8061-9ed5b2e17954',
        eventsDelay: 20000,
        attemptsNumber: 10
    },
    MergeAway: {
        appToken: '8d1cc2ad-e097-4b86-90ef-7a27e19fb833',
        promoId: 'dc128d28-c45b-411c-98ff-ac7726fbaea4',
        eventsDelay: 20000,
        attemptsNumber: 10
    },
    TwerkRace: {
        appToken: '61308365-9d16-4040-8bb0-2f4a4c69074c',
        promoId: '61308365-9d16-4040-8bb0-2f4a4c69074c',
        eventsDelay: 20000,
        attemptsNumber: 10
    },
    Polysphere: {
        appToken: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71',
        promoId: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71',
        eventsDelay: 20000,
        attemptsNumber: 20
    },
    MowandTrim: {
        appToken: 'ef319a80-949a-492e-8ee0-424fb5fc20a6',
        promoId: 'ef319a80-949a-492e-8ee0-424fb5fc20a6',
        eventsDelay: 20000,
        attemptsNumber: 20
    },
    CafeDash: {
        appToken: 'bc0971b8-04df-4e72-8a3e-ec4dc663cd11',
        promoId: 'bc0971b8-04df-4e72-8a3e-ec4dc663cd11',
        eventsDelay: 23000,
        attemptsNumber: 16
    },
    GangsWars: {
        appToken: 'b6de60a0-e030-48bb-a551-548372493523',
        promoId: 'c7821fa7-6632-482c-9635-2bd5798585f9',
        eventsDelay: 40000,
        attemptsNumber: 23
    }, 
    Zoopolis: {
        appToken: 'b2436c89-e0aa-4aed-8046-9b0515e1c46b',
        promoId: 'b2436c89-e0aa-4aed-8046-9b0515e1c46b',
        eventsDelay: 21000,
        attemptsNumber: 23
    }
};

let currentAppConfig = Object.values(gamePromoConfigs)[0];
var keygenActive = false;

document.addEventListener('DOMContentLoaded', () => {
    const gameSelect = document.getElementById('gameSelect');

    gameSelect.addEventListener('change', () => {
        const selectedGame = gameSelect.value;
        currentAppConfig = gamePromoConfigs[selectedGame];
    });
});

document.getElementById('startBtn').addEventListener('click', async () => {
    const startBtn = document.getElementById('startBtn');
    const keyCountSelect = document.getElementById('keyCountSelect');
    const keyCountLabel = document.getElementById('keyCountLabel');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const keyContainer = document.getElementById('keyContainer');
    const keysList = document.getElementById('keysList');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const generatedKeysTitle = document.getElementById('generatedKeysTitle');
    const keyCount = parseInt(keyCountSelect.value);
    document.getElementById("gameSelect").disabled = true;

    progressBar.style.width = '0%';
    progressText.innerText = '0%';
    progressContainer.classList.remove('hidden');
    keyContainer.classList.add('hidden');
    generatedKeysTitle.classList.add('hidden');
    keysList.innerHTML = '';
    keyCountSelect.classList.add('hidden');
    keyCountLabel.innerText = 'Selected keys: ' + keyCount;
    startBtn.classList.add('hidden');
    copyAllBtn.classList.add('hidden');
    startBtn.disabled = true;

    let progress = 0;
    keygenActive = true;

    const updateProgress = (increment) => {
        const steps = 10;
        const stepIncrement = increment / steps;
        let step = 0;

        const increaseProgress = () => {
            if (!keygenActive) return;
            if (step < steps) {
                progress += stepIncrement;
                progressBar.style.width = `${progress}%`;
                progressText.innerText = `${Math.round(progress)}%`;
                step++;
                setTimeout(increaseProgress, 2000 / steps + Math.random() * 1000);
            }
        };

        increaseProgress();
    };

    const generateKeyProcess = async () => {
        const clientId = generateClientId();
        let clientToken;
        try {
            clientToken = await login(clientId);
        } catch (error) {
            alert(`Failed to log in: ${error.message}`);
            startBtn.disabled = false;
            return null;
        }
        
        for (let i = 0; i < currentAppConfig.attemptsNumber; i++) {
            await sleep(currentAppConfig.eventsDelay * delayRandom());
            const hasCode = await emulateProgress(clientToken);
            updateProgress((100 / currentAppConfig.attemptsNumber) / keyCount);
            if (hasCode) {
                break;
            }
        }

        try {
            const key = await generateKey(clientToken);
            return key;
        } catch (error) {
            alert(`Failed to generate key: ${error.message}`);
            return null;
        }
    };

    const keys = await Promise.all(Array.from({ length: keyCount }, generateKeyProcess));

    keygenActive = false;

    progressBar.style.width = '100%';
    progressText.innerText = '100%';

    if (keys.length > 1) {
        const keyItemsHtml = keys.filter(key => key).map((key, index) => `
            <div class="key-item">
                <div class="key-number">${index + 1}</div>
                <input type="text" value="${key}" readonly>
                <button class="copyKeyBtn copy-button" data-key="${key}">Copy Key</button>
            </div>
        `).join('');
        keysList.innerHTML = keyItemsHtml;
        copyAllBtn.classList.remove('hidden');
    } else if (keys.length === 1) {
        keysList.innerHTML = `
            <div class="key-item">
                <div class="key-number">1</div>
                <input type="text" value="${keys[0]}" readonly>
                <button class="copyKeyBtn copy-button" data-key="${keys[0]}">Copy Key</button>
            </div>
        `;
    }

    keyContainer.classList.remove('hidden');
    generatedKeysTitle.classList.remove('hidden');
    keyCountLabel.innerText = 'Select number of keys';
    document.getElementById("gameSelect").disabled = false;
    document.querySelectorAll('.copyKeyBtn').forEach(button => {
        button.addEventListener('click', (event) => {
            const key = event.target.getAttribute('data-key');
            navigator.clipboard.writeText(key).then(() => {
                event.target.innerText = 'Key Copied';
                event.target.style.backgroundColor = '#28a745';
                setTimeout(() => {
                    event.target.innerText = 'Copy Key';
                    event.target.style.backgroundColor = '#6a0080';
                }, 2000);
            });
        });
    });
    copyAllBtn.addEventListener('click', (event) => {
        const keysText = keys.filter(key => key).join('\n');
        navigator.clipboard.writeText(keysText).then(() => {
            event.target.innerText = 'All Keys Copied';
            event.target.style.backgroundColor = '#28a745';
            setTimeout(() => {
                event.target.innerText = 'Copy All Keys';
                event.target.style.backgroundColor = '#6a0080';
            }, 2000);
        });
    });

    startBtn.classList.remove('hidden');
    keyCountSelect.classList.remove('hidden');
    startBtn.disabled = false;
});

document.getElementById('creatorChannelBtn').addEventListener('click', () => {
    window.open('https://www.youtube.com/channel/UCO_G3gYlZ1z5RZGl9TgF7tQ', '_blank');
});

function generateClientId() {
    return 'client-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function login(clientId) {
    // Simulating an API login call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('fake-client-token-' + clientId);
        }, 1000);
    });
}

async function emulateProgress(clientToken) {
    // Simulating a progress step
    return new Promise((resolve) => {
        setTimeout(() => {
            const hasCode = Math.random() > 0.5;
            resolve(hasCode);
        }, 500);
    });
}

async function generateKey(clientToken) {
    // Simulating an API key generation call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('key-' + Math.random().toString(36).substring(2, 10).toUpperCase());
        }, 1500);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function delayRandom() {
    return Math.random() * 0.5 + 0.75; // Random delay multiplier between 0.75 and 1.25
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations(); // Apply translations
    document.getElementById('keyCountLabel').innerText = 'Select number of keys';
});

