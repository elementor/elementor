import { ComponentType } from 'react';

declare function init(): void;

type Config = {
    id: string;
    label: string;
    component: ComponentType;
    position?: number;
};
declare function injectTab({ id, label, component, position }: Config): void;

type Tab = {
    id: string;
    label: string;
    component: ComponentType;
};
declare function registerTab(tab: Tab): void;

export { init, injectTab, registerTab };
