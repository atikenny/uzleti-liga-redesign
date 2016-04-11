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
        const eventId = Object.keys(eventStats)[0];
        let bulkStats = {};

        bulkStats[String(eventId)] = Object.keys(eventStats[eventId]);
        chrome.storage.sync.set(bulkStats);

        Object.keys(eventStats[eventId]).forEach((teamName) => {
            let stats = {};

            stats[eventId + '.' + teamName] = eventStats[eventId][teamName];
            chrome.storage.sync.set(stats);
        });
    };

    const get = (eventId) => {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(String(eventId), (teamNamesResponse) => {
                const _eventId = Object.keys(teamNamesResponse)[0];
                const bulkIds = teamNamesResponse[eventId].map((teamName) => _eventId + '.' + teamName);
                
                chrome.storage.sync.get(bulkIds, (bulkResponse) => {
                    let finalResponse = {};
                    let reducedObject;

                    reducedObject = Object.keys(bulkResponse).reduce((response, teamNameWithEventId) => {
                        const teamName = teamNameWithEventId.substr(teamNameWithEventId.indexOf('.') + 1);
                        
                        response[teamName] = bulkResponse[teamNameWithEventId];

                        return response;
                    }, {});

                    finalResponse[_eventId] = reducedObject;

                    resolve(finalResponse);
                });
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