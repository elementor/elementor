import * as React from 'react';
import { createMockElementType, createMockPropType, renderWithTheme } from 'test-utils';
import { createPropUtils, type PropValue } from '@elementor/editor-props';
import { z } from '@elementor/schema';
import { type Control, type ControlsSection, type ElementControl, getElementLabel } from '@elementor/editor-elements';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { screen } from '@testing-library/react';

import { useElement } from '../../contexts/element-context';
import { useDefaultPanelSettings } from '../../hooks/use-default-panel-settings';
import { SettingsTab } from '../settings-tab';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../../contexts/element-context' );
jest.mock( '../../hooks/use-default-panel-settings' );
jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementLabel: jest.fn(),
} ) );

const MockSelectComponent = ( { id }: { id?: string } ) => <select id={ id } aria-label="mock-select" />;

const MockTextAreaComponent = ( { placeholder }: { placeholder?: string } ) => (
	<input type="text" placeholder={ placeholder } />
);

jest.mocked( isExperimentActive ).mockReturnValue( false );
jest.mock( '../../controls-registry/control', () => ( {
	Control: jest.fn( ( { type, props } ) => {
		if ( type === 'select' ) {
			return <MockSelectComponent { ...props } />;
		}

		if ( type === 'textarea' ) {
			return <MockTextAreaComponent { ...props } />;
		}

		return null;
	} ),
} ) );

describe( '<SettingsTab />', () => {
	beforeEach( () => {
		jest.mocked( getElementLabel ).mockReturnValue( 'Mock Element' );
	} );

	it( 'should render the widget sections', () => {
		// Arrange.
		const elementType = createMockElementType( {
			controls: [
				mockSection( {
					label: 'Section 1',
					items: [ mockTextAreaControl( { label: 'Section 1 Control' } ) ],
				} ),
				mockSection( {
					label: 'Section 2',
					items: [ mockTextAreaControl( { label: 'Section 2 Control' } ) ],
				} ),
			],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings: {},
		} );

		jest.mocked( useDefaultPanelSettings ).mockReturnValue( {
			defaultSectionsExpanded: {
				settings: [ 'Section 1', 'Section 2' ],
			},
			defaultTab: 'settings',
		} );

		// Act.
		renderWithTheme( <SettingsTab /> );

		// Assert.
		expect( screen.getByText( 'Section 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Section 2' ) ).toBeInTheDocument();
	} );

	it( 'should render the widget controls without sections', () => {
		// Arrange.
		const elementType = createMockElementType( {
			controls: [ mockSelectControl(), mockTextAreaControl() ],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings: {},
		} );

		// Act.
		renderWithTheme( <SettingsTab /> );

		// Assert.
		expect( screen.getByText( 'Select Control' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Textarea Control' ) ).toBeInTheDocument();
	} );

	it( 'should render the controls and sections in the correct structure', () => {
		// Arrange.
		const elementType = createMockElementType( {
			controls: [
				mockTextAreaControl( { label: 'Top level Control' } ),
				mockSection( {
					label: 'Section 1',
					items: [ mockSelectControl( { label: 'Control inside section 1' } ) ],
				} ),
				mockSection( {
					label: 'Section 2',
					items: [ mockTextAreaControl( { label: 'Control inside section 2' } ) ],
				} ),
			],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings: {},
		} );

		jest.mocked( useDefaultPanelSettings ).mockReturnValue( {
			defaultSectionsExpanded: {
				settings: [ 'section' ],
			},
			defaultTab: 'settings',
		} );

		// Act.
		renderWithTheme( <SettingsTab /> );

		// Assert.

		const [ control, firstSectionBtn, firstSectionContent, secondSectionBtn, secondSectionContent ] =
			screen.getAllByText( /.+/ );

		expect( control ).toHaveTextContent( 'Top level Control' );

		expect( firstSectionBtn ).toHaveTextContent( 'Section 1' );
		expect( firstSectionContent ).toHaveTextContent( 'Control inside section 1' );

		expect( secondSectionBtn ).toHaveTextContent( 'Section 2' );
		expect( secondSectionContent ).toHaveTextContent( 'Control inside section 2' );
	} );

	it( 'should not render the widget controls if the control item type is not supported', () => {
		// Arrange.
		const elementType = createMockElementType( {
			controls: [
				mockSelectControl(),
				{
					...mockTextAreaControl(),
					// @ts-expect-error - Testing unsupported control type.
					type: 'unsupported',
				},
			],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings: {},
		} );

		// Act.
		const { container } = renderWithTheme( <SettingsTab /> );

		// Assert.
		// eslint-disable-next-line testing-library/no-node-access
		expect( container.firstChild?.childNodes ).toHaveLength( 1 );
		expect( screen.getByText( 'Select Control' ) ).toBeInTheDocument();
	} );

	it( 'should only render the supported control types', () => {
		// Arrange.
		const elementType = createMockElementType( {
			controls: [
				mockSelectControl(),
				mockTextAreaControl(),
				{
					type: 'control',
					value: {
						label: 'Unsupported Control',
						bind: 'unsupported',
						type: 'unsupported',
						props: {},
					},
				},
			],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings: {},
		} );

		// Act.
		const { container } = renderWithTheme( <SettingsTab /> );

		// Assert.
		expect( screen.getByText( 'Select Control' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Textarea Control' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Unsupported Control' ) ).not.toBeInTheDocument();
		// eslint-disable-next-line testing-library/no-node-access
		expect( container.firstChild?.childNodes ).toHaveLength( 2 );
	} );

	it( 'should pass the control props to the control component', () => {
		// Arrange.
		const elementType = createMockElementType( {
			controls: [
				mockTextAreaControl( {
					props: { placeholder: 'Enter some text' },
				} ),
				mockSelectControl( {
					props: { id: 'select-control' },
				} ),
			],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings: {},
		} );

		// Act.
		renderWithTheme( <SettingsTab /> );

		// Assert.
		expect( screen.getByRole( 'textbox' ) ).toHaveAttribute( 'placeholder', 'Enter some text' );
		expect( screen.getByRole( 'combobox' ) ).toHaveAttribute( 'id', 'select-control' );
	} );

	it( 'should render a control with divider when topDivider is true', () => {
		// Arrange.
		const elementType = createMockElementType( {
			controls: [
				mockTextAreaControl( {
					props: { placeholder: 'Enter some text' },
					meta: { topDivider: true },
				} ),
			],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings: {},
		} );

		renderWithTheme( <SettingsTab /> );

		const control = screen.getByRole( 'textbox' );
		expect( control ).toHaveAttribute( 'placeholder', 'Enter some text' );
		const separator = screen.getByRole( 'separator' );
		expect( separator ).toBeInTheDocument();
	} );

	it( 'should hide a section when all child controls are dependency-hidden', () => {
		// Arrange.
		const elementType = createMockElementType( {
			propsSchema: {
				'actions-after-submit': createMockPropType( {
					kind: 'array',
					item_prop_type: createMockPropType( { kind: 'plain' } ),
				} ),
				email: createMockPropType( {
					kind: 'plain',
					dependencies: {
						relation: 'or',
						terms: [
							{
								operator: 'contains',
								path: [ 'actions-after-submit' ],
								value: 'email',
								effect: 'hide',
							},
						],
					},
				} ),
			},
			controls: [
				mockSection( {
					label: 'Email Section',
					items: [ mockTextAreaControl( { bind: 'email', label: 'Email Control' } ) ],
				} ),
			],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings: {
				'actions-after-submit': {
					$$type: 'array',
					value: [ { $$type: 'string', value: 'webhook' } ],
				},
			},
		} );
		jest.mocked( useDefaultPanelSettings ).mockReturnValue( {
			defaultSectionsExpanded: {
				settings: [ 'Mixed Section' ],
			},
			defaultTab: 'settings',
		} );

		// Act.
		renderWithTheme( <SettingsTab /> );

		// Assert.
		expect( screen.queryByText( 'Email Section' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Email Control' ) ).not.toBeInTheDocument();
	} );

	it( 'should render section with only visible controls when mixed dependency visibility exists', () => {
		// Arrange.
		const elementType = createMockElementType( {
			propsSchema: {
				'actions-after-submit': createMockPropType( {
					kind: 'array',
					item_prop_type: createMockPropType( { kind: 'plain' } ),
				} ),
				email: createMockPropType( {
					kind: 'plain',
					dependencies: {
						relation: 'or',
						terms: [
							{
								operator: 'contains',
								path: [ 'actions-after-submit' ],
								value: 'email',
								effect: 'hide',
							},
						],
					},
				} ),
				title: createMockPropType( { kind: 'plain' } ),
			},
			controls: [
				mockSection( {
					label: 'Mixed Section',
					items: [
						mockTextAreaControl( { bind: 'email', label: 'Hidden Control' } ),
						mockTextAreaControl( { bind: 'title', label: 'Visible Control' } ),
					],
				} ),
			],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings: {
				'actions-after-submit': {
					$$type: 'array',
					value: [ { $$type: 'string', value: 'webhook' } ],
				},
			},
		} );

		jest.mocked( useDefaultPanelSettings ).mockReturnValue( {
			defaultSectionsExpanded: {
				settings: [ 'section' ],
			},
			defaultTab: 'settings',
		} );

		// Act.
		renderWithTheme( <SettingsTab /> );

		// Assert.
		expect( screen.getByText( 'Mixed Section' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Visible Control' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Hidden Control' ) ).not.toBeInTheDocument();
	} );

	it( 'should keep section visible when it contains element-control items', () => {
		// Arrange.
		const elementType = createMockElementType( {
			controls: [
				mockSection( {
					label: 'Element Control Section',
					items: [ mockElementControl( { label: 'Element Control' } ) ],
				} ),
			],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings: {},
		} );
		jest.mocked( useDefaultPanelSettings ).mockReturnValue( {
			defaultSectionsExpanded: {
				settings: [ 'section' ],
			},
			defaultTab: 'settings',
		} );

		// Act.
		renderWithTheme( <SettingsTab /> );

		// Assert.
		expect( screen.getByText( 'Element Control Section' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Element Control' ) ).toBeInTheDocument();
	} );

	it( 'should render a bound section with nested controls', () => {
		createPropUtils( 'loop-query', z.record( z.string(), z.unknown() ) );

		const queryPropType = createMockPropType( {
			kind: 'object',
			key: 'loop-query',
			shape: {
				title: createMockPropType( { kind: 'plain', key: 'string' } ),
			},
		} );

		const elementType = createMockElementType( {
			propsSchema: { query: queryPropType },
			controls: [
				mockSection( {
					id: 'Query',
					label: 'Query',
					bind: 'query',
					items: [ mockTextAreaControl( { label: 'Nested Query Control', bind: 'title' } ) ],
				} ),
			],
		} );

		const settings: Record< string, PropValue > = {
			query: {
				$$type: 'loop-query',
				value: {
					title: { $$type: 'string', value: 'Hello' },
				},
			},
		};

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
			settings,
		} );

		jest.mocked( useDefaultPanelSettings ).mockReturnValue( {
			defaultSectionsExpanded: {
				settings: [ 'Query' ],
			},
			defaultTab: 'settings',
		} );

		renderWithTheme( <SettingsTab /> );

		expect( screen.getByText( 'Query' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Nested Query Control' ) ).toBeInTheDocument();
	} );
} );

export const mockSection = ( {
	id = 'section',
	label = 'Section',
	description = 'Section description',
	items = [],
	bind,
}: Partial< ControlsSection[ 'value' ] > ): ControlsSection => ( {
	type: 'section',
	value: {
		id,
		label,
		description,
		items,
		...( bind !== undefined && { bind } ),
	},
} );

const mockSelectControl = ( value?: Partial< Control[ 'value' ] > ): Control => ( {
	type: 'control',
	value: {
		label: `Select Control`,
		bind: 'tag',
		type: 'select',
		props: {
			options: Array.from( { length: 3 }, ( _, i ) => ( {
				value: `value-${ i + 1 }`,
				label: `label-${ i + 1 }`,
			} ) ),
		},
		...value,
	},
} );

const mockTextAreaControl = ( value?: Partial< Control[ 'value' ] > ): Control => ( {
	type: 'control',
	value: {
		label: 'Textarea Control',
		bind: 'title',
		type: 'textarea',
		props: {},
		...value,
	},
} );

const mockElementControl = ( value?: Partial< ElementControl[ 'value' ] > ): ElementControl => ( {
	type: 'element-control',
	value: {
		label: 'Element Control',
		type: 'textarea',
		props: {},
		...value,
	},
} );
