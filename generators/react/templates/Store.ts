export interface TemplateStoreAction {
    // @todo fill out Action interface.
    source: string; // Where the action originated.
}

export class TemplateStore {
    // @todo implement Store properties.

    constructor(store?: TemplateStore) {
        // @todo Handle constructor arguments.
    }
}

export function reducer(
    state: TemplateStore,
    action: TemplateStoreAction,
): TemplateStore {
    const newState = new TemplateStore(state);

    // @todo Handle reducer action.
    const changed = false;

    if (changed) {
        return newState;
    }
    return state;
}
