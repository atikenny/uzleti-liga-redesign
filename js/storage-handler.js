chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.task) {
        case 'eventStats.save':
            eventStats.save(request.data);

            break;
        case 'eventStats.get':
            eventStats
                .get(request.eventId)
                .then(sendResponse);

            break;
        case 'matchStats.save':
            matchStats.save(request.data);

            break;
        case 'matchStats.get':
            matchStats
                .get(request.matchId)
                .then(sendResponse);

            break;
    }

    return true;
});

const eventStats = (() => {
    const save = (eventStats) => {
        chrome.storage.local.set(eventStats);
    };

    const get = (eventId) => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(String(eventId), resolve);
        });
    };

    return {
        save,
        get
    };
})();

const matchStats = (() => {
    const save = (matchStats) => {
        chrome.storage.local.set(matchStats);
    };

    const get = (matchId) => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(String(matchId), resolve);
        });
    };

    return {
        save,
        get
    };
})();