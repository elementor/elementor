import { useEffect } from 'react';

import { usePanelActions } from './class-manager/class-manager-panel';

const EVENT_OPEN_GLOBAL_CLASSES_MANAGER = 'elementor/open-global-classes-manager';

export function OpenPanelFromEvent() {
	const { open } = usePanelActions();

	useEffect( () => {
		const handler = () => open();

		window.addEventListener( EVENT_OPEN_GLOBAL_CLASSES_MANAGER, handler );

		return () => window.removeEventListener( EVENT_OPEN_GLOBAL_CLASSES_MANAGER, handler );
	}, [ open ] );

	return null;
}
