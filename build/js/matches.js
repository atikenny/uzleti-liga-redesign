var script = document.createElement('script');

script.src = chrome.extension.getURL('js/injected-script.js');
(document.head || document.documentElement).appendChild(script);

script.onload = function () {
    script.parentNode.removeChild(script);
};

document.addEventListener('scriptInjected', function (event) {
    redesigner(event.detail);
});

function redesigner(sidebarItems) {
    var activePageName = $('.lap').html(),
        activeLeagueName = $('.eventmenu_table h2').html(),
        hamburgerMenuIconHTML = '<svg width="24px" height="24px" viewBox="0 0 48 48"><path d="M6 36h36v-4H6v4zm0-10h36v-4H6v4zm0-14v4h36v-4H6z"></path></svg>',
        $hamburgerMenu,
        $sidebar;

    function init(sidebarItems) {
        appendMetaTags();
        appendMenuItems();
        appendSidebarItems(getSidebarItemsHTML(sidebarItems));
        cleanupHTML();
        attachEventHandlers();
        removeTextNodesFromBody();
    }

    function appendMetaTags() {
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
    }

    function getSidebarItemsHTML(sidebarItems) {
        var html = '';

        html += '<ul>';

        sidebarItems.menuItems.forEach(function (menuItem) {
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
                html += getSidebarItemsHTML(menuItem);
            }

            html += '</li>';
        });
        
        html += '</ul>';

        return html;
    }

    function appendMenuItems() {
        var menuItems = '';

        menuItems += '<button class="hamburger-menu">' + hamburgerMenuIconHTML + '</button>';
        menuItems += '<span class="logo"></span>';
        menuItems += '<span class="page-name">' + activeLeagueName + '</span>';
        menuItems += '<button class="login-button"></button>';

        $('.menu').append(menuItems);
        $hamburgerMenu = $('.hamburger-menu');
    }

    function appendSidebarItems(html) {
        $('body').append('<div class="sidebar">' + html + '</div>');
        $sidebar = $('.sidebar');
    }

    function cleanupHTML() {
        removeEmptyRows();
        addMainTableContainerClass();
        setActiveTab();
        addMenuTabsClass();
        removeEmptyTabsRow();
        moveSeasonsList();
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

    function moveSeasonsList() {
        var newSeasonsHTML = '';

        newSeasonsHTML += '<ul id="seasons-list">';

        $('.idenylink,.idenyaktiv').each(function () {
            newSeasonsHTML += '<li>';
            newSeasonsHTML += $(this).get(0).outerHTML;
            newSeasonsHTML += '</li>';
        });

        newSeasonsHTML += '</ul>';

        $('.tabs:first').after(newSeasonsHTML);
    }

    function removeTextNodesFromBody() {
        $('body')
            .contents()
            .filter(function () {
                return this.nodeType === 3;
            })
            .remove();
    }

    function attachEventHandlers() {
        $hamburgerMenu.on('click', function () {
            $('body').toggleClass('sidebarred');
        });
    }


    init(sidebarItems);
}
