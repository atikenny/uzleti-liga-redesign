import apigClientFactory from 'aws-api-gateway-client';

const awsClient = apigClientFactory.newClient({
    invokeUrl: 'https://4ks5nf7ul7.execute-api.eu-central-1.amazonaws.com'
});

export const getEventData = () => {
    return awsClient.invokeApi({}, '/dev/geteventdata', 'GET');
};
