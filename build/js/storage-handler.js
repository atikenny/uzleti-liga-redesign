const isEmptyObject = (object) => {
    return !Boolean(Object.keys(object).length);
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.task) {
        case 'matchStats.save':
            matchStats.save(request.data);

            break;
        case 'matchStats.get':
            matchStats
                .get(request.matchId)
                .then(sendResponse);

            break;
        case 'filter.get':
            filter
                .get(request.eventId)
                .then(sendResponse)
                .catch(sendResponse);

            break;
        case 'filter.save':
            let storageObject = {};

            storageObject[`filter.${request.id}`] = request.data;

            filter.save(storageObject);

            break;
    }

    return true;
});

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

const filter = (() => {
    const get = (eventId) => {
        const key = `filter.${eventId}`;
        
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(key, (response) => {
                if(!isEmptyObject(response) && response[key]) {
                    resolve(response[key]);
                } else {
                    reject({
                        error: 'no-filter',
                        errorCode: 404,
                        errorMessage: `No saved filter for event: ${eventId}`
                    });
                }
            });
        });
    };

    const save = (eventFilter) => {
        chrome.storage.local.set(eventFilter);
    };

    return {
        get,
        save
    };
})();