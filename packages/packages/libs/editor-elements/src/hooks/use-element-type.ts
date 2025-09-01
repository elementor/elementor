import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { getWidgetsCache } from '../sync/get-widgets-cache';
import { type ElementType } from '../types';

export function useElementType( type?: string ) {
	return useListenTo(
		commandEndEvent( 'editor/documents/load' ),
		(): ElementType | null => {
			if ( ! type ) {
				return null;
			}

			const widgetsCache = getWidgetsCache();
			const elementType = widgetsCache?.[ type ];

			if ( ! elementType?.atomic_controls ) {
				return null;
			}

			if ( ! elementType?.atomic_props_schema ) {
				return null;
			}

			return {
				key: type,
				controls: elementType.atomic_controls,
				propsSchema: elementType.atomic_props_schema,
				title: elementType.title,
			};
		},
		[ type ]
	);
}
