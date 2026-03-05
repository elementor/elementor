import * as React from 'react';

import useOpenPanelInjection from '../../hooks/use-open-panel-injection';
import Portal from './portal';

export default function Panels() {
	const openPanel = useOpenPanelInjection();
	const Component = openPanel?.component ?? null;

	if ( ! Component ) {
		return null;
	}

	return (
		<Portal>
			<Component />
		</Portal>
	);
}
