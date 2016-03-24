var script = document.createElement('script');

script.src = chrome.extension.getURL('js/injected-script.js');
(document.head||document.documentElement).appendChild(script);

script.onload = function() {
    script.parentNode.removeChild(script);
};

document.addEventListener('scriptInjected', function (event) {
    console.log(event.detail);
    redesigner(event.detail);
});

function redesigner(menuItems) {
    function init(menuItems) {
        appendMenuItems(getMenuItemsHTML(menuItems));
    }

    function getMenuItemsHTML(menuItem) {
        var html = '';

        html += '<ul>';

        menuItem.menuItems.forEach(function (menuItem) {
            html += '<li>';

            if (menuItem.itemValue && menuItem.itemValue[0]) {
                html += '<span>' + menuItem.itemValue[0] + '</span>';
            }

            if (menuItem.menuItems) {
                html += getMenuItemsHTML(menuItem);
            }

            html += '</li>';
        });
        
        html += '</ul>';

        return html;
    }

    function appendMenuItems(html) {
        $('.menu').html(html);
    }

    init(menuItems);
}
