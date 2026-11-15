import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { ElementProvider } from '@elementor/editor-editing-panel';
import { type Control, type ElementType, getElementType } from '@elementor/editor-elements';
import { screen } from '@testing-library/react';

import {
	cleanupClosedStructureFixture,
	type ClosedStructureFixture,
	setupClosedStructureFixture,
	WIDGET_ID,
} from '../../closed-structure/__tests__/closed-structure-fixture';
import { type CompositeWidgetGeneralEntry } from '../../types';
import { WidgetGeneralTab } from '../widget-general-tab';

jest.mock( '@elementor/editor-editing-panel', () => {
	const actual = jest.requireActual( '@elementor/editor-editing-panel' );
	const { createElement } = jest.requireActual( 'react' );

	return {
		...actual,
		SettingsControl: ( { control }: { control: Control } ) => {
			const { element } = actual.useElement();

			return createElement( 'div', null, `${ control.value.label } -> ${ element.id }` );
		},
	};
} );

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementType: jest.fn(),
} ) );

const GENERAL: CompositeWidgetGeneralEntry[] = [
	{
		section: 'Content',
		fields: [
			{ label: 'Text', target: { part: 'label', prop: 'paragraph' } },
			{ label: 'Icon', target: { part: 'icon', prop: 'svg' } },
			{ label: 'Unknown prop', target: { part: 'label', prop: 'missing' } },
			{ label: 'Button', fields: [ { label: 'Link', target: { part: 'root', prop: 'link' } } ] },
		],
	},
	{ repeater: 'items', label: 'Items', item: 'label', container: 'root', item_fields: [] },
];

const createControl = ( bind: string ): Control => ( {
	type: 'control',
	value: { bind, label: bind, type: 'text', props: {} },
} );

const ELEMENT_TYPES: Record< string, ElementType > = {
	'e-flexbox': createMockElementType( { key: 'e-flexbox', controls: [ createControl( 'link' ) ] } ),
	'e-paragraph': createMockElementType( { key: 'e-paragraph', controls: [ createControl( 'paragraph' ) ] } ),
};

describe( '<WidgetGeneralTab />', () => {
	let fixture: ClosedStructureFixture;

	beforeEach( () => {
		fixture = setupClosedStructureFixture();

		const config = (
			window as unknown as { elementor: { config: { compositeWidgets: Record< string, object > } } }
		 ).elementor.config;
		config.compositeWidgets[ WIDGET_ID ] = { ...config.compositeWidgets[ WIDGET_ID ], general: GENERAL };

		jest.mocked( getElementType ).mockImplementation( ( type ) => ELEMENT_TYPES[ type ] ?? null );
	} );

	afterEach( () => {
		cleanupClosedStructureFixture();
	} );

	it( "should render each field with the target atom's control in that atom's context", () => {
		// Arrange
		const element = { id: fixture.root.id, type: 'e-flexbox' };

		// Act
		renderWithTheme(
			<ElementProvider element={ element } elementType={ ELEMENT_TYPES[ 'e-flexbox' ] } settings={ {} }>
				<WidgetGeneralTab />
			</ElementProvider>
		);

		// Assert
		expect( screen.getByText( 'Content' ) ).toBeInTheDocument();
		expect( screen.getByText( `Text -> ${ fixture.label.id }` ) ).toBeInTheDocument();
		expect( screen.getByText( `Link -> ${ fixture.root.id }` ) ).toBeInTheDocument();
	} );

	it( 'should hide fields whose part or control is missing, and skip repeaters', () => {
		// Arrange
		const element = { id: fixture.root.id, type: 'e-flexbox' };

		// Act
		renderWithTheme(
			<ElementProvider element={ element } elementType={ ELEMENT_TYPES[ 'e-flexbox' ] } settings={ {} }>
				<WidgetGeneralTab />
			</ElementProvider>
		);

		// Assert
		expect( screen.queryByText( /^Icon/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /^Unknown prop/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Items' ) ).not.toBeInTheDocument();
	} );
} );
