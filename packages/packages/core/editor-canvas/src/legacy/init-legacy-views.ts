import { getWidgetsCache } from '@elementor/editor-elements';
import { __privateListenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { createDomRenderer } from '../renderers/create-dom-renderer';
import { initReplacements } from '../replacements/replacement-manager';
import { createElementType } from './create-element-type';
import {
	canBeTemplated,
	createTemplatedElementType,
	type CreateTemplatedElementTypeOptions,
} from './create-templated-element-type';
import type { ElementType, LegacyWindow } from './types';

type ElementLegacyType = {
	[ key: string ]: ( options: CreateTemplatedElementTypeOptions ) => typeof ElementType;
};
export const elementsLegacyTypes: ElementLegacyType = {};

export function registerElementType(
	type: string,
	elementTypeGenerator: ElementLegacyType[ keyof ElementLegacyType ]
) {
	elementsLegacyTypes[ type ] = elementTypeGenerator;
}

export function initLegacyViews() {
	initReplacements();

	__privateListenTo( v1ReadyEvent(), () => {
		const config = getWidgetsCache() ?? {};
		const legacyWindow = window as unknown as LegacyWindow;

		const renderer = createDomRenderer();

		Object.entries( config ).forEach( ( [ type, element ] ) => {
			if ( ! element.atomic ) {
				return;
			}

			let ElementType;

			if ( !! elementsLegacyTypes[ type ] && canBeTemplated( element ) ) {
				ElementType = elementsLegacyTypes[ type ]( { type, renderer, element } );
			} else if ( canBeTemplated( element ) ) {
				ElementType = createTemplatedElementType( { type, renderer, element } );
			} else {
				ElementType = createElementType( type );
			}

			legacyWindow.elementor.elementsManager.registerElementType( new ElementType() );
		} );
	} );
}
