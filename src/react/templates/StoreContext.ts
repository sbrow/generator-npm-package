import { createContext, Dispatch } from "react";

import { TemplateStore, TemplateStoreAction } from "./Store";

export const TemplateStoreContext = createContext<
    [TemplateStore, Dispatch<TemplateStoreAction>]
>([
    new TemplateStore(),
    () => {
        throw new Error("no reducer has been set");
    },
]);
