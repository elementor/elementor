import { createMockElement, createMockElementType, dispatchCommandAfter } from 'test-utils';
import { getElementType, type V1Element } from '@elementor/editor-elements';
import { type PropsSchema } from '@elementor/editor-props';
import { act, renderHook } from '@testing-library/react';

import {
	cleanupClosedStructureFixture,
	type ClosedStructureFixture,
	setupClosedStructureFixture,
	WIDGET_ID,
} from '../../closed-structure/__tests__/closed-structure-fixture';
import { type CompositeWidgetDefinition } from '../../types';
import { useWidgetPartElements } from '../use-widget-part-elements';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementType: jest.fn(),
} ) );

const DEFINITION: CompositeWidgetDefinition = {
	id: WIDGET_ID,
	version: 1,
	source: 'code',
	title: 'Tabs',
	template: { elType: 'e-flexbox' },
	general: [ { section: 'Content', fields: [ { label: 'Text', target: { part: 'label', prop: 'paragraph' } } ] } ],
};

const PARAGRAPH = { $$type: 'string', value: 'Hello' };
const CHANGED_PARAGRAPH = { $$type: 'string', value: 'Changed' };

type WindowWithGetContainer = { elementor: { getContainer: ( id: string ) => V1Element | undefined } };

describe( 'useWidgetPartElements', () => {
	let fixture: ClosedStructureFixture;

	beforeEach( () => {
		fixture = setupClosedStructureFixture();
		fixture.label.settings.set( 'paragraph', PARAGRAPH );

		jest.mocked( getElementType ).mockReturnValue(
			createMockElementType( { key: 'e-paragraph', propsSchema: { paragraph: {} } as unknown as PropsSchema } )
		);
	} );

	afterEach( () => {
		cleanupClosedStructureFixture();
	} );

	it( "should refresh when a part's settings change", () => {
		// Arrange
		const { result } = renderHook( () => useWidgetPartElements( fixture.root.id, DEFINITION ) );
		fixture.label.settings.set( 'paragraph', CHANGED_PARAGRAPH );

		// Act
		act( () => dispatchCommandAfter( 'document/elements/set-settings', { container: fixture.label } ) );

		// Assert
		expect( result.current.label?.settings.paragraph ).toBe( CHANGED_PARAGRAPH );
	} );

	it( 'should drop a deleted part and restore it when it is created again', () => {
		// Arrange
		const { result } = renderHook( () => useWidgetPartElements( fixture.root.id, DEFINITION ) );
		const { children: rootChildren = [] } = fixture.root;
		const labelIndex = rootChildren.indexOf( fixture.label );

		// Act
		rootChildren.splice( labelIndex, 1 );
		act( () => dispatchCommandAfter( 'document/elements/delete', { container: fixture.label } ) );
		const afterDelete = result.current.label;

		rootChildren.splice( labelIndex, 0, fixture.label );
		act( () => dispatchCommandAfter( 'document/elements/create', { container: fixture.root } ) );

		// Assert
		expect( afterDelete ).toBeNull();
		expect( result.current.label?.element.id ).toBe( fixture.label.id );
	} );

	it( 'should read the re-created root after a move, not the old tree', () => {
		// Arrange
		const { result } = renderHook( () => useWidgetPartElements( fixture.root.id, DEFINITION ) );
		const movedChildren: V1Element[] = [];
		const movedRoot = createMockElement( {
			model: { id: fixture.root.id, part: 'root', widget: { id: WIDGET_ID, version: 1 } },
			children: movedChildren,
		} );
		const movedLabel = createMockElement( {
			model: { id: fixture.label.id, widgetType: 'e-paragraph', part: 'label' },
			settings: { paragraph: CHANGED_PARAGRAPH },
			parent: movedRoot,
		} );
		movedChildren.push( movedLabel );

		const elementor = ( window as unknown as WindowWithGetContainer ).elementor;
		const getContainer = elementor.getContainer;
		elementor.getContainer = ( id ) =>
			( { [ movedRoot.id ]: movedRoot, [ movedLabel.id ]: movedLabel } )[ id ] ?? getContainer( id );

		// Act
		act( () => dispatchCommandAfter( 'document/elements/set-settings', { container: movedLabel } ) );

		// Assert
		expect( result.current.label?.settings.paragraph ).toBe( CHANGED_PARAGRAPH );
	} );
} );
