import { type ComponentType } from 'react';

import { SubmenuToggle } from './submenu-toggle';

export type SubmenuToggleProps = {
	entryId: string | null;
};

let submenuToggle: ComponentType< SubmenuToggleProps > = SubmenuToggle;

export const registerSubmenuToggle = ( component: ComponentType< SubmenuToggleProps > ) => {
	submenuToggle = component;
};

export const getSubmenuToggle = () => submenuToggle;
