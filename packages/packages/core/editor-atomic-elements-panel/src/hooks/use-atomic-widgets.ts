import { useEffect, useState } from 'react';
import { getWidgetsCache } from '@elementor/editor-elements';

import { getAtomicWidgets, type WidgetsCache } from '../utils/get-atomic-widgets';

const REFRESHED_ACTION = 'elementor/widgets/refreshed';
const LISTENER_ID = 'atomic-elements-panel';

type HooksWindow = {
	elementor?: {
		hooks?: {
			addAction: ( name: string, id: string, callback: () => void ) => void;
			removeAction: ( name: string, id: string ) => void;
		};
	};
};

const readWidgets = () => getAtomicWidgets( getWidgetsCache() as WidgetsCache | null );

export function useAtomicWidgets() {
	const [ widgets, setWidgets ] = useState( readWidgets );

	useEffect( () => {
		const hooks = ( window as unknown as HooksWindow ).elementor?.hooks;

		hooks?.addAction( REFRESHED_ACTION, LISTENER_ID, () => setWidgets( readWidgets() ) );

		return () => hooks?.removeAction( REFRESHED_ACTION, LISTENER_ID );
	}, [] );

	return widgets;
}
