const http = require('http');

const minEventId = 100;
const eventUrl = 'http://www.uzletiliga.hu/eredmenyek/event.php?eid=';

const getEventPageAsync = (eventId) => {
    let responseBody = '';

    return new Promise((resolve, reject) => {
        http.get(`${eventUrl}${eventId}`, (response) => {
            if (response.statusCode === 302) {
                reject();
            }

            response.on('data', (chunk) => responseBody += chunk);
            response.on('end', () => {
                resolve(responseBody);
            });
        });
    });
};

const collectEvents = (eventId) => {
    return getEventPageAsync(eventId)
        .then(() => {
            collectEvents(eventId++);
        });
};

collectEvents(minEventId);