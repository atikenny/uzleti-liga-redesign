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
    var activePageName = $('.lap').html();

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
        removeEmptyRows();
        addMainTableContainerClass();
        setActiveTab();
        addMenuTabsClass();
        removeEmptyTabsRow();
    }

    function removeEmptyRows() {
        $('.matches_table tr:has(th[colspan="4"]:contains(" "))').remove();
    }

    function addMainTableContainerClass() {
        $('.matches_table').parent().addClass('table_container');
    }

    function setActiveTab() {
        $('.eventmenu_table th:has(a:contains("' + activePageName + '"))').addClass('active');
    }

    function addMenuTabsClass() {
        $('.eventmenu_table:has(a:contains("' + activePageName + '"))').addClass('tabs');
    }

    function removeEmptyTabsRow() {
        $('.eventmenu_table tr:has(td[colspan="7"])').remove();
    }

    init(menuItems);
}
