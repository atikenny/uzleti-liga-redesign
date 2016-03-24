setTimeout(function() {
    var menuItemRegExp = /Menu\d/;

    function init(window) {
        var menuItems = collectMenuItems(window);

        sendMenuItems(menuItems);
    }

    function collectMenuItems(window) {
        var menu;

        menu = Object.keys(window)
            .filter(filterMenuProperty)
            .map(flattenMenuItems)
            .reduce(unflattenMenuItems, {});

        return menu;
    }

    function filterMenuProperty(windowProperty) {
        return menuItemRegExp.test(windowProperty);
    }

    function flattenMenuItems(windowProperty) {
        return {
            key: windowProperty,
            value: window[windowProperty]
        };
    }

    function unflattenMenuItems(prev, current) {
        var menuIndex = current.key.substr(4),
            menuIndexArray = menuIndex.split('_'),
            menuDepth = menuIndexArray.length,
            currentDepth,
            i;

        for (i = 0, currentDepth = prev; i < menuDepth; i++) {
            if (!currentDepth.menuItems) {
                currentDepth.menuItems = []
            }

            currentDepth = currentDepth.menuItems;
        }

        currentDepth.push({
            name: current.key,
            value: current.value
        });

        return prev;
    }

    function sendMenuItems(menuItems) {
        document.dispatchEvent(new CustomEvent('scriptInjected', {
            detail: menuItems
        }));
    }

    init(window);
}, 0);