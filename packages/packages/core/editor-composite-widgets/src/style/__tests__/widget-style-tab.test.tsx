import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { ElementProvider } from '@elementor/editor-editing-panel';
import { getElementType } from '@elementor/editor-elements';
import { type PropType } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { setCompositeWidgetDefinitions } from '../../__tests__/set-composite-widget-definitions';
import {
	cleanupClosedStructureFixture,
	type ClosedStructureFixture,
	setupClosedStructureFixture,
	WIDGET_DEFINITION,
	WIDGET_ID,
} from '../../closed-structure/__tests__/closed-structure-fixture';
import { type CompositeWidgetQuickEdit } from '../../types';
import { WidgetStyleTab } from '../widget-style-tab';

const REGISTERED_STYLE_PROP = 'gap';

jest.mock( '@elementor/editor-editing-panel', () => {
	const actual = jest.requireActual( '@elementor/editor-editing-panel' );
	const { createElement } = jest.requireActual( 'react' );

	const ProbeField = ( { label }: { label?: string } ) => {
		const { element } = actual.useElement();

		return createElement( 'div', null, `${ label } -> ${ element.id }` );
	};

	const StyleProviderProbe = ( {
		id,
		meta,
		children,
	}: {
		id: string | null;
		meta: { breakpoint: string | null };
		children: React.ReactNode;
	} ) => createElement( 'section', { 'aria-label': `Style ${ id } @ ${ meta.breakpoint }` }, children );

	return {
		...actual,
		StyleTab: () => createElement( 'div', null, 'Root style tab' ),
		StyleProvider: StyleProviderProbe,
		StyleInheritanceProvider: ( { children }: { children: React.ReactNode } ) => children,
		getStylesFieldComponent: ( propKey: string ) => ( propKey === 'gap' ? ProbeField : null ),
	};
} );

jest.mock( '@elementor/editor-responsive', () => ( {
	...jest.requireActual( '@elementor/editor-responsive' ),
	useActiveBreakpoint: () => 'tablet',
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementType: jest.fn(),
} ) );

const CLASSES_PROP_TYPE = { kind: 'plain', key: 'classes' } as PropType;
const LABEL_STYLE_ID = 'e-label-style';

const renderTab = ( fixture: ClosedStructureFixture, quickEdit: CompositeWidgetQuickEdit[] ) => {
	setCompositeWidgetDefinitions( { [ WIDGET_ID ]: { ...WIDGET_DEFINITION, style: { quick_edit: quickEdit } } } );

	const element = { id: fixture.root.id, type: 'e-flexbox' };
	const elementType = createMockElementType( { key: 'e-flexbox', propsSchema: { classes: CLASSES_PROP_TYPE } } );

	renderWithTheme(
		<ElementProvider element={ element } elementType={ elementType } settings={ {} }>
			<WidgetStyleTab />
		</ElementProvider>
	);
};

describe( '<WidgetStyleTab />', () => {
	let fixture: ClosedStructureFixture;

	beforeEach( () => {
		fixture = setupClosedStructureFixture();

		jest.mocked( getElementType ).mockImplementation( ( type ) =>
			createMockElementType( { key: type, propsSchema: { classes: CLASSES_PROP_TYPE } } )
		);
	} );

	afterEach( () => {
		cleanupClosedStructureFixture();
		sessionStorage.clear();
	} );

	it( "should render a quick edit with the definition label, reading the first target's local style at the current breakpoint", () => {
		// Arrange
		fixture.label.model.set( 'styles', {
			[ LABEL_STYLE_ID ]: { id: LABEL_STYLE_ID, type: 'class', label: 'local', variants: [] },
		} );

		// Act
		renderTab( fixture, [ { label: 'Gap', style_prop: REGISTERED_STYLE_PROP, targets: [ 'label', 'root' ] } ] );

		// Assert
		expect( screen.getByText( 'Quick edit' ) ).toBeInTheDocument();
		expect( screen.getByText( `Gap -> ${ fixture.label.id }` ) ).toBeInTheDocument();
		expect( screen.getByRole( 'region', { name: `Style ${ LABEL_STYLE_ID } @ tablet` } ) ).toBeInTheDocument();
	} );

	it( 'should skip missing target parts and read from the first present one', () => {
		// Act
		renderTab( fixture, [ { label: 'Gap', style_prop: REGISTERED_STYLE_PROP, targets: [ 'icon', 'root' ] } ] );

		// Assert
		expect( screen.getByText( `Gap -> ${ fixture.root.id }` ) ).toBeInTheDocument();
		expect( screen.getByRole( 'region', { name: 'Style null @ tablet' } ) ).toBeInTheDocument();
	} );

	it( 'should hide quick edits without a registered field or without any present target', () => {
		// Act
		renderTab( fixture, [
			{ label: 'Padding', style_prop: 'padding', targets: [ 'root' ] },
			{ label: 'Gap', style_prop: REGISTERED_STYLE_PROP, targets: [ 'icon' ] },
		] );

		// Assert
		expect( screen.queryByText( /^Padding/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /^Gap/ ) ).not.toBeInTheDocument();
	} );

	it( 'should not render the Quick edit section when the definition has no quick edits', () => {
		// Act
		renderTab( fixture, [] );

		// Assert
		expect( screen.queryByText( 'Quick edit' ) ).not.toBeInTheDocument();
	} );

	it( "should show the root's own style tab only after Edit container is opened", () => {
		// Arrange
		renderTab( fixture, [] );

		// Act & Assert
		expect( screen.queryByText( 'Root style tab' ) ).not.toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: 'Edit container' } ) );

		expect( screen.getByText( 'Root style tab' ) ).toBeInTheDocument();
	} );
} );
