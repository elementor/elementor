import { getWidgetsCache } from '../../sync/get-widgets-cache';

export type AvailableElementType = {
	type: string;
	title: string;
};

export function handleListAvailableTypes(): AvailableElementType[] {
	const widgetsCache = getWidgetsCache();

	if ( ! widgetsCache ) {
		return [];
	}

	const availableTypes: AvailableElementType[] = [];

	Object.entries( widgetsCache ).forEach( ( [ type, config ] ) => {
		if ( config?.atomic_controls && config?.atomic_props_schema ) {
			availableTypes.push( {
				type,
				title: config.title || type,
			} );
		}
	} );

	return availableTypes;
}
