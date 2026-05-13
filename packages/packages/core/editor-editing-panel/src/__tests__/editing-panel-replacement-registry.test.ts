import { type ElementType } from '@elementor/editor-elements';

import { getEditingPanelReplacement, registerEditingPanelReplacement } from '../editing-panel-replacement-registry';
import { mockElement } from './utils';

const mockElementType = ( key = 'e-heading' ): ElementType => ( {
	key,
	controls: [],
	propsSchema: {},
	title: key,
} );

const MockComponent = () => null;
const AnotherMockComponent = () => null;

describe( 'editing-panel-replacement-registry', () => {
	it( 'should return replacement when condition is met', () => {
		// Arrange
		const element = mockElement( { type: 'test-condition-met' } );
		const elementType = mockElementType( 'test-condition-met' );

		registerEditingPanelReplacement( {
			id: 'test-condition-met-replacement',
			condition: ( _, type ) => type.key === 'test-condition-met',
			component: MockComponent,
		} );

		// Act
		const result = getEditingPanelReplacement( element, elementType );

		// Assert
		expect( result ).not.toBeNull();
		expect( result?.component ).toBe( MockComponent );
	} );

	it( 'should return null when no condition is met', () => {
		// Arrange
		const element = mockElement( { type: 'test-no-condition-met' } );
		const elementType = mockElementType( 'test-no-condition-met' );

		registerEditingPanelReplacement( {
			id: 'test-no-condition-met-replacement',
			condition: ( _, type ) => type.key === 'replacement-type',
			component: MockComponent,
		} );

		// Act
		const result = getEditingPanelReplacement( element, elementType );

		// Assert
		expect( result ).toBeNull();
	} );

	it( 'should return highest priority (i.e. lowest value) replacement when multiple conditions match', () => {
		// Arrange
		const element = mockElement( { type: 'replacement-type' } );
		const elementType = mockElementType( 'replacement-type' );
		const HIGH_PRIORITY = 5;
		const LOW_PRIORITY = 20;

		registerEditingPanelReplacement( {
			id: 'test-priority-low',
			condition: ( _, type ) => type.key === 'replacement-type',
			component: AnotherMockComponent,
			priority: LOW_PRIORITY,
		} );

		registerEditingPanelReplacement( {
			id: 'test-priority-high',
			condition: ( _, type ) => type.key === 'replacement-type',
			component: MockComponent,
			priority: HIGH_PRIORITY,
		} );

		// Act
		const result = getEditingPanelReplacement( element, elementType );

		// Assert
		expect( result ).not.toBeNull();
		expect( result?.component ).toBe( MockComponent );
		expect( result?.priority ).toBe( HIGH_PRIORITY );
	} );
} );
