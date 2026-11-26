import { createMockElement } from 'test-utils';
import { type V1Element, type V1ElementModelProps } from '@elementor/editor-elements';
import { __deleteStore as deleteStore } from '@elementor/store';

import { setCompositeWidgetDefinitions } from '../../__tests__/set-composite-widget-definitions';
import { type CompositeWidgetDefinition } from '../../types';

export const WIDGET_ID = 'elementor/tabs-like';

export const WIDGET_DEFINITION: CompositeWidgetDefinition = {
	id: WIDGET_ID,
	version: 1,
	source: 'code',
	title: 'Tabs',
	template: { elType: 'e-flexbox', part: 'root' },
};

type FixtureElement = 'document' | 'page' | 'root' | 'label' | 'slot' | 'slotChild' | 'nestedRoot' | 'nestedPart';
type UnknownElement = 'unknownRoot' | 'unknownPart';
type UnnamedElement = 'unnamedNode';

export type ClosedStructureFixture = Record< FixtureElement | UnknownElement | UnnamedElement, V1Element >;

export function setupClosedStructureFixture(): ClosedStructureFixture {
	const elements = new Map< string, V1Element >();

	const add = ( model: Partial< V1ElementModelProps > & { id: string }, parent?: V1Element ) => {
		const element = createMockElement( { model, parent } );

		elements.set( model.id, element );
		parent?.children?.push( element );

		return element;
	};

	const document = add( { id: 'document', elType: 'document' } );
	const page = add( { id: 'page', elType: 'e-flexbox' }, document );
	const root = add(
		{ id: 'root', elType: 'e-flexbox', part: 'root', widget: { id: WIDGET_ID, version: 1 } },
		document
	);
	const label = add( { id: 'label', widgetType: 'e-paragraph', part: 'label' }, root );
	const unnamedNode = add( { id: 'unnamed-node', elType: 'e-flexbox' }, root );
	const slot = add( { id: 'slot', elType: 'e-flexbox', part: 'tab_content', slot: true }, root );
	const slotChild = add( { id: 'slot-child', elType: 'e-flexbox' }, slot );
	const nestedRoot = add(
		{ id: 'nested-root', elType: 'e-flexbox', part: 'root', widget: { id: WIDGET_ID, version: 1 } },
		slot
	);
	const nestedPart = add( { id: 'nested-part', widgetType: 'e-heading', part: 'label' }, nestedRoot );
	const unknownRoot = add(
		{ id: 'unknown-root', elType: 'e-flexbox', part: 'root', widget: { id: 'acme/missing', version: 1 } },
		document
	);
	const unknownPart = add( { id: 'unknown-part', widgetType: 'e-heading', part: 'label' }, unknownRoot );

	setCompositeWidgetDefinitions( { [ WIDGET_ID ]: WIDGET_DEFINITION } );

	( window as unknown as { elementor: unknown } ).elementor = {
		getContainer: jest.fn( ( id: string ) => elements.get( id ) ),
	};

	return {
		document,
		page,
		root,
		label,
		slot,
		slotChild,
		nestedRoot,
		nestedPart,
		unknownRoot,
		unknownPart,
		unnamedNode,
	};
}

export function getContainerSpy(): jest.Mock {
	return ( window as unknown as { elementor: { getContainer: jest.Mock } } ).elementor.getContainer;
}

export function cleanupClosedStructureFixture() {
	deleteStore();
	delete ( window as unknown as { elementor?: unknown } ).elementor;
}
