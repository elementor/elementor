import * as React from 'react';

import { useElement } from '../../../contexts/element-context';
import { getSubmenuToggle } from '../menu-items-control/submenu-toggle-registry';
import { getParentEntryId } from '../menu-items-control/use-submenu';

export const SubmenuToggleControl = () => {
	const { element } = useElement();
	const Toggle = getSubmenuToggle();

	return <Toggle entryId={ getParentEntryId( element.id ) } />;
};
