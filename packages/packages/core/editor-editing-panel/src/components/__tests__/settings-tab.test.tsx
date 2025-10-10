import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { type Control, type ControlsSection, getElementLabel } from '@elementor/editor-elements';
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

const MockSelectComponent = ( { id }: { id?: string } ) => <select id={ id } />;

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
					items: [],
				} ),
				mockSection( {
					label: 'Section 2',
					items: [],
				} ),
			],
		} );

		jest.mocked( useElement ).mockReturnValue( {
			element: { type: 'mock-type', id: 'mock-id' },
			elementType,
		} );

		jest.mocked( useDefaultPanelSettings ).mockReturnValue( {
			defaultSectionsExpanded: {
				settings: [],
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
		} );

		// Act.
		renderWithTheme( <SettingsTab /> );

		// Assert.
		const control = screen.getByRole( 'textbox' );
		expect( control ).toHaveAttribute( 'placeholder', 'Enter some text' );
		const separator = screen.getByRole( 'separator' );
		expect( separator ).toBeInTheDocument();
	} );
} );

export const mockSection = ( {
	label = 'Section',
	description = 'Section description',
	items = [],
}: Partial< ControlsSection[ 'value' ] > ): ControlsSection => ( {
	type: 'section',
	value: {
		label,
		description,
		items,
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
