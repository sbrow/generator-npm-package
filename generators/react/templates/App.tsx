import React, { ReactElement, useReducer } from "react";

import { reducer, TemplateStore } from "./Store";
import { TemplateStoreContext } from "./StoreContext";

export function TemplateApp(): ReactElement {
    const [state, dispatch] = useReducer(reducer, new TemplateStore());
    return (
        <TemplateStoreContext.Provider value={[state, dispatch]}>
            {/* @todo Your App here */}
        </TemplateStoreContext.Provider>
    );
}
