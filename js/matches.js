var script = document.createElement('script');

script.src = chrome.extension.getURL('js/injected-script.js');
(document.head||document.documentElement).appendChild(script);

script.onload = function() {
    script.parentNode.removeChild(script);
};

document.addEventListener('scriptInjected', function (event) {
    console.log(event.detail);
});
