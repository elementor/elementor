import { type StyleDefinitionID } from '@elementor/editor-styles';

import { type ElementID } from '../types';
import { mutateElementStyles } from './mutate-element-styles';

export function deleteElementStyle( elementId: ElementID, styleId: StyleDefinitionID ) {
	mutateElementStyles( elementId, ( styles ) => {
		// The object is deep cloned so mutating it is fine.
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete styles[ styleId ];

		return styles;
	} );
}
