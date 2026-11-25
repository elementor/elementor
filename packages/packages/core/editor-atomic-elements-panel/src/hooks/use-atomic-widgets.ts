import { useEffect, useState } from 'react';
import { getWidgetsCache } from '@elementor/editor-elements';

import { type ExtendedWindow } from '../types';
import { getAtomicWidgets, type WidgetsCache } from '../utils/get-atomic-widgets';

const REFRESHED_ACTION = 'elementor/widgets/refreshed';

const readWidgets = () => getAtomicWidgets( getWidgetsCache() as WidgetsCache | null );

export function useAtomicWidgets() {
	const [ widgets, setWidgets ] = useState( readWidgets );

	useEffect( () => {
		const hooks = ( window as unknown as ExtendedWindow ).elementor?.hooks;

		const onRefresh = () => setWidgets( readWidgets() );

		hooks?.addAction( REFRESHED_ACTION, onRefresh );

		return () => hooks?.removeAction( REFRESHED_ACTION, onRefresh );
	}, [] );

	return widgets;
}
