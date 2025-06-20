import * as React from 'react';
import { PropsWithChildren } from 'react';

declare const getSessionStorageItem: <T>(key: string) => T | undefined;
declare const setSessionStorageItem: (key: string, item: unknown) => void;
declare const removeSessionStorageItem: (key: string) => void;

declare const useSessionStorage: <T>(key: string) => readonly [T | null | undefined, (newValue: T) => void, () => void];

type ContextValue = {
    prefix: string;
};
declare const Context: React.Context<ContextValue | null>;
type Props = PropsWithChildren<ContextValue>;
declare function SessionStorageProvider({ children, prefix }: Props): React.JSX.Element;

export { Context, SessionStorageProvider, getSessionStorageItem, removeSessionStorageItem, setSessionStorageItem, useSessionStorage };
