const obsi = (() => {
    const getProto = (handlers) => {
        return {
            onChange(changeHandler) {
                handlers.push(changeHandler);
            },
            change(newValue) {
                handlers.forEach((handler) => {
                    handler.call(null, newValue);
                });
            }
        };
    };

    const create = () => {
        return Object.create(getProto([]));
    };

    return {
        create
    };
})();