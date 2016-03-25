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
        cleanupHTML();
    }

    function getMenuItemsHTML(menuItem) {
        var html = '';

        html += '<ul>';

        menuItem.menuItems.forEach(function (menuItem) {
            html += '<li>';

            if (menuItem.itemValue && menuItem.itemValue[0]) {
                html += '<span>';
                
                if (menuItem.menuItems) {
                    html += menuItem.itemValue[0];
                } else {
                    html += '<a href="' + menuItem.itemValue[1] + '">' + menuItem.itemValue[0] + '</a>';
                }
                
                html += '</span>';
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

    function cleanupHTML() {
        $('.matches_table tr:has(th[colspan="4"]:contains(" "))').remove();
    }

    init(menuItems);
}
