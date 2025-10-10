import { getWidgetsCache } from '@elementor/editor-elements';
import { __privateListenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { createDomRenderer } from '../renderers/create-dom-renderer';
import { createElementType } from './create-element-type';
import { canBeTemplated, createTemplatedElementType } from './create-templated-element-type';
import type { LegacyWindow } from './types';

export function initLegacyViews() {
	__privateListenTo( v1ReadyEvent(), () => {
		const config = getWidgetsCache() ?? {};
		const legacyWindow = window as unknown as LegacyWindow;

		const renderer = createDomRenderer();

		Object.entries( config ).forEach( ( [ type, element ] ) => {
			if ( ! element.atomic ) {
				return;
			}

			const ElementType = canBeTemplated( element )
				? createTemplatedElementType( { type, renderer, element } )
				: createElementType( type );

			legacyWindow.elementor.elementsManager.registerElementType( new ElementType() );
		} );
	} );
}
