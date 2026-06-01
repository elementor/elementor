import * as React from 'react';
import { createMockElementType, createMockPropType, renderWithTheme } from 'test-utils';
import { createControl, PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import { type ObjectPropType, type PropType, type PropValue, stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { mockElement } from '../../__tests__/utils';
import { ElementProvider } from '../../contexts/element-context';
import { controlsRegistry } from '../../controls-registry/controls-registry';
import { extractDependencyEffect } from '../../utils/prop-dependency-utils';
import { ObjectSectionControl } from '../object-section-control';

const QUERY_BIND = 'query';
const SECTION_LABEL = 'Query';
const MOCK_CONTROL_TYPE = 'mock-text';

const MockTextControl = createControl( ( { ariaLabel }: { ariaLabel: string } ) => {
	const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );

	return (
		<input
			type="text"
			aria-label={ ariaLabel }
			value={ value ?? '' }
			disabled={ disabled }
			onChange={ ( event ) => setValue( event.target.value ) }
		/>
	);
} );

beforeAll( () => {
	controlsRegistry.register( MOCK_CONTROL_TYPE, MockTextControl, 'full', stringPropTypeUtil );
} );

afterAll( () => {
	controlsRegistry.unregister( MOCK_CONTROL_TYPE );
} );

const titleVisibleOnlyForPostSource = createMockPropType( {
	kind: 'plain',
	key: 'string',
	dependencies: {
		relation: 'and',
		terms: [ { operator: 'eq', path: [ 'source' ], value: 'post', effect: 'hide' } ],
	},
} );

const objectPropType: ObjectPropType = createMockPropType( {
	kind: 'object',
	key: 'object-section',
	shape: {
		source: createMockPropType( { kind: 'plain', key: 'string', default: { $$type: 'string', value: 'post' } } ),
		title: titleVisibleOnlyForPostSource,
	},
} );

const items = [
	{ type: MOCK_CONTROL_TYPE, bind: 'source', label: 'Source', props: { ariaLabel: 'Source' } },
	{ type: MOCK_CONTROL_TYPE, bind: 'title', label: 'Title', props: { ariaLabel: 'Title' } },
];

function renderObjectSection( value: Record< string, PropValue >, setValue = jest.fn() ) {
	const element = mockElement();
	const elementType = createMockElementType( { propsSchema: { [ QUERY_BIND ]: objectPropType } } );

	const outerPropType: ObjectPropType = createMockPropType( {
		kind: 'object',
		key: '',
		shape: { [ QUERY_BIND ]: objectPropType },
	} );

	const handleSetValue = ( next: Record< string, PropValue > ) => setValue( next[ QUERY_BIND ] );

	return renderWithTheme(
		<ElementProvider element={ element } elementType={ elementType } settings={ {} }>
			<PropProvider
				propType={ outerPropType }
				value={ { [ QUERY_BIND ]: { $$type: 'object-section', value } } }
				setValue={ handleSetValue }
			>
				<PropKeyProvider bind={ QUERY_BIND }>
					<ObjectSectionControl label={ SECTION_LABEL } items={ items } />
				</PropKeyProvider>
			</PropProvider>
		</ElementProvider>
	);
}

function expandSection() {
	fireEvent.click( screen.getByRole( 'button', { name: `${ SECTION_LABEL } section` } ) );
}

describe( '<ObjectSectionControl />', () => {
	it( 'renders a collapsible section using the label as its title', () => {
		// Act.
		renderObjectSection( {} );

		// Assert.
		expect( screen.getByRole( 'button', { name: `${ SECTION_LABEL } section` } ) ).toBeInTheDocument();
	} );

	it( 'renders the nested child controls via the registry', () => {
		// Arrange.
		renderObjectSection( {
			source: { $$type: 'string', value: 'post' },
			title: { $$type: 'string', value: 'My title' },
		} );

		// Act.
		expandSection();

		// Assert.
		expect( screen.getByText( 'Source' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Title' ) ).toBeInTheDocument();
	} );

	it( 'hides a child whose dependency triggers a hide effect', () => {
		// Arrange - "title" is visible only when source === 'post', so 'manual' hides it.
		renderObjectSection( { source: { $$type: 'string', value: 'manual' } } );

		// Act.
		expandSection();

		// Assert.
		expect( screen.getByText( 'Source' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Title' ) ).not.toBeInTheDocument();
	} );

	it( 'propagates a sub-key edit through the bound object setValue', () => {
		// Arrange.
		const setValue = jest.fn();
		renderObjectSection( { source: { $$type: 'string', value: 'post' } }, setValue );
		expandSection();

		// Act.
		const input = screen.getByRole( 'textbox', { name: 'Source' } );
		fireEvent.change( input, { target: { value: 'page' } } );

		// Assert - merged object value bubbles up with the edited sub-key.
		expect( setValue ).toHaveBeenCalledWith(
			expect.objectContaining( {
				$$type: 'object-section',
				value: expect.objectContaining( {
					source: { $$type: 'string', value: 'page' },
				} ),
			} )
		);
	} );

	it( 'resolves a union parent prop type before rendering nested fields', () => {
		// Arrange.
		const unionPropType = createMockPropType( {
			kind: 'union',
			prop_types: { 'object-section': objectPropType },
		} );

		const element = mockElement();
		const elementType = createMockElementType( { propsSchema: { [ QUERY_BIND ]: unionPropType } } );
		const outerPropType: ObjectPropType = createMockPropType( {
			kind: 'object',
			key: '',
			shape: { [ QUERY_BIND ]: unionPropType },
		} );

		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType } settings={ {} }>
				<PropProvider
					propType={ outerPropType }
					value={ { [ QUERY_BIND ]: { $$type: 'object-section', value: { source: { $$type: 'string', value: 'post' } } } } }
					setValue={ jest.fn() }
				>
					<PropKeyProvider bind={ QUERY_BIND }>
						<ObjectSectionControl label={ SECTION_LABEL } items={ items } />
					</PropKeyProvider>
				</PropProvider>
			</ElementProvider>
		);

		// Act.
		expandSection();

		// Assert.
		expect( screen.getByText( 'Source' ) ).toBeInTheDocument();
	} );

	it( 'uses the object variant key when saving from a union parent with no initial value', () => {
		// Arrange.
		const unionPropType = createMockPropType( {
			kind: 'union',
			prop_types: { 'object-section': objectPropType },
		} );
		const setValue = jest.fn();
		const element = mockElement();
		const elementType = createMockElementType( { propsSchema: { [ QUERY_BIND ]: unionPropType } } );
		const outerPropType: ObjectPropType = createMockPropType( {
			kind: 'object',
			key: '',
			shape: { [ QUERY_BIND ]: unionPropType },
		} );

		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType } settings={ {} }>
				<PropProvider propType={ outerPropType } value={ { [ QUERY_BIND ]: null } } setValue={ setValue }>
					<PropKeyProvider bind={ QUERY_BIND }>
						<ObjectSectionControl label={ SECTION_LABEL } items={ items } />
					</PropKeyProvider>
				</PropProvider>
			</ElementProvider>
		);
		expandSection();

		// Act.
		const input = screen.getByRole( 'textbox', { name: 'Source' } );
		fireEvent.change( input, { target: { value: 'page' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith(
			expect.objectContaining( {
				query: expect.objectContaining( {
					$$type: 'object-section',
					value: expect.objectContaining( {
						source: { $$type: 'string', value: 'page' },
					} ),
				} ),
			} ),
			{},
			expect.objectContaining( { bind: 'query' } )
		);
	} );

	it( 'evaluates disabled state against nested object settings instead of element-level settings', () => {
		// Arrange.
		const nestedObjectPropType: ObjectPropType = createMockPropType( {
			kind: 'object',
			key: 'object-section',
			shape: {
				template_type: createMockPropType( {
					kind: 'plain',
					key: 'string',
					default: { $$type: 'string', value: 'post' },
				} ),
				source: createMockPropType( {
					kind: 'plain',
					key: 'string',
					dependencies: {
						relation: 'and',
						terms: [
							{ operator: 'eq', path: [ 'template_type' ], value: 'post', effect: 'disable' },
						],
					},
				} ),
			},
		} );
		const nestedItems = [
			{ type: MOCK_CONTROL_TYPE, bind: 'source', label: 'Source', props: { ariaLabel: 'Source' } },
		];
		const { isDisabled: elementLevelDisabled } = extractDependencyEffect(
			'source',
			nestedObjectPropType.shape,
			{}
		);
		const element = mockElement();
		const elementType = createMockElementType( { propsSchema: { [ QUERY_BIND ]: nestedObjectPropType } } );
		const outerPropType: ObjectPropType = createMockPropType( {
			kind: 'object',
			key: '',
			shape: { [ QUERY_BIND ]: nestedObjectPropType },
		} );

		expect( elementLevelDisabled( nestedObjectPropType.shape.source as PropType ) ).toBe( true );

		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType } settings={ {} }>
				<PropProvider
					propType={ outerPropType }
					isDisabled={ elementLevelDisabled }
					value={ {
						[ QUERY_BIND ]: {
							$$type: 'object-section',
							value: { template_type: { $$type: 'string', value: 'post' } },
						},
					} }
					setValue={ jest.fn() }
				>
					<PropKeyProvider bind={ QUERY_BIND }>
						<ObjectSectionControl label={ SECTION_LABEL } items={ nestedItems } />
					</PropKeyProvider>
				</PropProvider>
			</ElementProvider>
		);
		expandSection();

		// Assert.
		expect( screen.getByRole( 'textbox', { name: 'Source' } ) ).toBeEnabled();
	} );
} );
