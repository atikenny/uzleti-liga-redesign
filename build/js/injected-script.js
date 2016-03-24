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
            i = 0;

        for (i = 0, currentDepth = prev; i < menuDepth; i++) {
            if (!currentDepth.menuItems) {
                currentDepth.menuItems = [{
                    name: current.key,
                    value: current.value
                }];
            } else if (!currentDepth.menuItems[(menuIndexArray[i] - 1)]) {
                currentDepth.menuItems.push({
                    name: current.key,
                    value: current.value
                });
            }

            currentDepth = currentDepth.menuItems[(menuIndexArray[i] - 1)];
        }

        return prev;
    }

    function sendMenuItems(menuItems) {
        document.dispatchEvent(new CustomEvent('scriptInjected', {
            detail: menuItems
        }));
    }

    init(window);
}, 0);