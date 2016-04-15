setTimeout(() => {
    const menuItemRegExp = /Menu\d/;

    const init = (window) => {
        sendMenuItems(collectMenuItems(window));
    };

    const collectMenuItems = (window) => {
        return Object.keys(window)
            .filter(filterMenuProperty)
            .map(flattenMenuItems)
            .reduce(unflattenMenuItems, {});
    };

    const filterMenuProperty = (windowProperty) => {
        return menuItemRegExp.test(windowProperty);
    };

    const flattenMenuItems = (windowProperty) => {
        return {
            key: windowProperty,
            itemValue: window[windowProperty]
        };
    };

    const unflattenMenuItems = (prev, current) => {
        const menuIndex = current.key.substr(4);
        const menuIndexArray = menuIndex.split('_');
        const menuDepth = menuIndexArray.length;

        let i;
        let currentDepth;

        for (i = 0, currentDepth = prev; i < menuDepth; i++) {
            if (!currentDepth.menuItems) {
                currentDepth.menuItems = [{
                    name: current.key,
                    itemValue: current.itemValue
                }];
            } else if (!currentDepth.menuItems[(menuIndexArray[i] - 1)]) {
                currentDepth.menuItems.push({
                    name: current.key,
                    itemValue: current.itemValue
                });
            }

            currentDepth = currentDepth.menuItems[(menuIndexArray[i] - 1)];
        }

        return prev;
    }

    const sendMenuItems = (menuItems) => {
        document.dispatchEvent(new CustomEvent('scriptInjected', {
            detail: menuItems
        }));
    };

    init(window);
}, 0);