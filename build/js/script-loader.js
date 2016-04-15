const getMenuItems = () => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.src = chrome.extension.getURL('js/injected-script.js');
        (document.head || document.documentElement).appendChild(script);

        script.onload = () => {
            script.parentNode.removeChild(script);
        };

        document.addEventListener('scriptInjected', (event) => {
            resolve(event.detail);
        });
    });
};