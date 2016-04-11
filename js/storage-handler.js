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
        let bulkStats = {};

        bulkStats[String(eventStats.id)] = Object.keys(eventStats[eventStats.id]);
        chrome.storage.sync.set(bulkStats);

        Object.keys(eventStats[eventStats.id]).forEach((teamName) => {
            let stats = {};

            stats[eventStats.id + '.' + teamName] = eventStats[eventStats.id][teamName];
            chrome.storage.sync.set(stats);
        });
    };

    const get = (eventId) => {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(String(eventId), (response) => {
                console.log(response);
                reject();
            });
        });
    };

    return {
        save,
        get
    };
})();

const matchStats = (() => {
    const save = (matchStats) => {
        chrome.storage.sync.set(matchStats);
    };

    const get = (matchId) => {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(String(matchId), resolve);
        });
    };

    return {
        save,
        get
    };
})();