import * as React from 'react';
import { createContext, useContext, type ReactNode } from 'react';

type InteractionsExtensions = {
    isProControlEnabled: (controlName: 'easing' | 'replay' | 'repeats') => boolean;
};

const defaultExtensions: InteractionsExtensions = {
    isProControlEnabled: () => false,
};

const InteractionsExtensionsContext = createContext<InteractionsExtensions>(defaultExtensions);

let registeredExtensions: InteractionsExtensions = defaultExtensions;

export function registerInteractionsExtensions(extensions: Partial<InteractionsExtensions>) {
    registeredExtensions = { ...defaultExtensions, ...extensions };
}

export function InteractionsExtensionsProvider({ children }: { children: ReactNode }) {
    return (
        <InteractionsExtensionsContext.Provider value={registeredExtensions}>
            {children}
        </InteractionsExtensionsContext.Provider>
    );
}

export const useInteractionsExtensions = () => useContext(InteractionsExtensionsContext);