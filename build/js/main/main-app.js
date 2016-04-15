const mainApp = (() => {
    const init = () => {
        clean();
    };

    const clean = () => {
        clearBody();
        removeStyles();
        removeScripts();
        appendMainAppContainer();
    };

    const clearBody = () => {
        $('body').empty();
    };

    const removeStyles = () => {
        $('head link[rel="stylesheet"]').remove();
    };

    const removeScripts = () => {
        $('head script').remove();
    };

    const appendMainAppContainer = () => {
        $('body').append('<div id="business-league-app"></div>');
    };

    return {
        init
    };
})();