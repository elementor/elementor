import * as React from 'react';

import { useElement } from '../../../contexts/element-context';
import { SubmenuToggle } from '../menu-items-control/submenu-toggle';
import { getParentEntryId } from '../menu-items-control/use-submenu';

export const SubmenuToggleControl = () => {
	const { element } = useElement();

	return <SubmenuToggle entryId={ getParentEntryId( element.id ) } />;
};
