import { getWidgetsCache, type V1ElementConfig } from '@elementor/editor-elements';
import { __privateListenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { createDomRenderer, type DomRenderer } from '../renderers/create-dom-renderer';
import { createElementType } from './create-element-type';
import {
	canBeNestedTemplated,
	createNestedTemplatedElementType,
	type ModelExtensions,
	type NestedTemplatedElementConfig,
} from './create-nested-templated-element-type';
import { canBeTemplated, type CreateTemplatedElementTypeOptions } from './create-templated-element-type';
import { createTemplatedElementTypeWithReplacements } from './replacements/manager';
import type { ElementType, LegacyWindow } from './types';

type ElementLegacyType = {
	[ key: string ]: ( options: CreateTemplatedElementTypeOptions ) => typeof ElementType;
};
export const elementsLegacyTypes: ElementLegacyType = {};

const modelExtensionsRegistry: Record< string, ModelExtensions > = {};

export function registerModelExtensions( type: string, extensions: ModelExtensions ) {
	modelExtensionsRegistry[ type ] = extensions;
}

export function registerElementType(
	type: string,
	elementTypeGenerator: ElementLegacyType[ keyof ElementLegacyType ]
) {
	elementsLegacyTypes[ type ] = elementTypeGenerator;
}

export function initLegacyViews() {
	__privateListenTo( v1ReadyEvent(), () => {
		const widgetsCache = getWidgetsCache() ?? {};
		const legacyWindow = window as unknown as LegacyWindow;
		const renderer = createDomRenderer();

		Object.entries( widgetsCache ).forEach( ( [ type, element ] ) => {
			if ( ! element.atomic ) {
				return;
			}

			const ResolvedElementType = resolveElementType( type, renderer, element );

			tryRegisterElement( legacyWindow, type, element, ResolvedElementType );
		} );
	} );
}

function resolveElementType( type: string, renderer: DomRenderer, element: V1ElementConfig ) {
	if ( canBeNestedTemplated( element ) ) {
		return createNestedTemplatedType( type, renderer, element );
	}

	if ( ! canBeTemplated( element ) ) {
		return createElementType( type );
	}

	const customGenerator = elementsLegacyTypes[ type ];

	return (
		customGenerator?.( { type, renderer, element } ) ??
		createTemplatedElementTypeWithReplacements( { type, renderer, element } )
	);
}

function tryRegisterElement(
	legacyWindow: LegacyWindow,
	type: string,
	element: V1ElementConfig,
	ResolvedElementType: typeof ElementType
) {
	const shouldBeRegistered = canBeTemplated( element ) || canBeNestedTemplated( element );

	if ( ! shouldBeRegistered ) {
		return;
	}

	const elementsManager = legacyWindow.elementor.elementsManager;
	const isAlreadyRegistered = Boolean( elementsManager.getElementTypeClass( type ) );

	try {
		elementsManager.registerElementType( new ResolvedElementType() );
	} catch {
		const canOverrideExisting = canBeNestedTemplated( element ) && isAlreadyRegistered;

		if ( canOverrideExisting ) {
			elementsManager._elementTypes[ type ] = new ResolvedElementType();
		}
	}
}

function createNestedTemplatedType( type: string, renderer: DomRenderer, element: NestedTemplatedElementConfig ) {
	return createNestedTemplatedElementType( {
		type,
		renderer,
		element,
		modelExtensions: modelExtensionsRegistry[ type ],
	} );
}
