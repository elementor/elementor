import { getWidgetsCache } from '@elementor/editor-elements';
import { __privateListenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { createDomRenderer } from '../renderers/create-dom-renderer';
import { createElementType } from './create-element-type';
import { canBeTemplated, createTemplatedElementType } from './create-templated-element-type';
import type { ElementType, LegacyWindow } from './types';

type ElementLegacyType = {
	[ key: string ]: () => typeof ElementType;
};
export const elementsLegacyTypes: ElementLegacyType = {};

export function registerElementType( type: string, componentClass: () => typeof ElementType ) {
	elementsLegacyTypes[ type ] = componentClass;
}

export function initLegacyViews() {
	__privateListenTo( v1ReadyEvent(), () => {
		const config = getWidgetsCache() ?? {};
		const legacyWindow = window as unknown as LegacyWindow;

		const renderer = createDomRenderer();

		Object.entries( config ).forEach( ( [ type, element ] ) => {
			if ( ! element.atomic ) {
				return;
			}

			if ( elementsLegacyTypes[ type ] ) {
				const registeredElementTypeClass = elementsLegacyTypes[ type ]();
				legacyWindow.elementor.elementsManager.registerElementType( new registeredElementTypeClass() );
				return;
			}

			const ElementType = canBeTemplated( element )
				? createTemplatedElementType( { type, renderer, element } )
				: createElementType( type );
			legacyWindow.elementor.elementsManager.registerElementType( new ElementType() );
		} );
	} );
}
