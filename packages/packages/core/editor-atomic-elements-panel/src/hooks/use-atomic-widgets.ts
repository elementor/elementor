import { useEffect, useState } from 'react';
import { getWidgetsCache } from '@elementor/editor-elements';

import { getAtomicWidgets, type WidgetsCache } from '../utils/get-atomic-widgets';

const REFRESHED_ACTION = 'elementor/widgets/refreshed';

type HooksWindow = {
	elementor?: {
		hooks?: {
			addAction: ( name: string, callback: () => void ) => void;
			removeAction: ( name: string, callback: () => void ) => void;
		};
	};
};

const readWidgets = () => getAtomicWidgets( getWidgetsCache() as WidgetsCache | null );

export function useAtomicWidgets() {
	const [ widgets, setWidgets ] = useState( readWidgets );

	useEffect( () => {
		const hooks = ( window as unknown as HooksWindow ).elementor?.hooks;

		const onRefresh = () => setWidgets( readWidgets() );

		hooks?.addAction( REFRESHED_ACTION, onRefresh );

		return () => hooks?.removeAction( REFRESHED_ACTION, onRefresh );
	}, [] );

	return widgets;
}
