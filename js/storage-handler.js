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