import apigClientFactory from 'aws-api-gateway-client';

const awsClient = apigClientFactory.newClient({
    invokeUrl: 'https://4ks5nf7ul7.execute-api.eu-central-1.amazonaws.com',
    region: 'eu-central-1'
});

export const getEventData = (eventId) => {
    if (!eventId) {
        throw new Error('EventId is missing!');
    }

    return awsClient.invokeApi({}, '/dev/geteventdata', 'GET', { queryParams: { eventId } });
};
