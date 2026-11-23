import { dispatchV1ReadyEvent } from 'test-utils';
import { __privateSetReady } from '@elementor/editor-v1-adapters';

import {
	COMPOSITE_WIDGET_ICON,
	initNavigatorIcon,
	NAVIGATOR_ICON_FILTER,
	resolveNavigatorIcon,
} from '../init-navigator-icon';

const FLEXBOX_ICON = 'eicon-flexbox';

type WindowWithHooks = { elementor?: { hooks: { addFilter: jest.Mock } } };

function createModel( attributes: Record< string, unknown > ) {
	return { get: ( key: string ) => attributes[ key ] };
}

function setHooks() {
	const addFilter = jest.fn();

	( window as unknown as WindowWithHooks ).elementor = { hooks: { addFilter } };

	return addFilter;
}

describe( 'resolveNavigatorIcon', () => {
	it( 'should return the composite widget icon for a widget root', () => {
		// Arrange
		const model = createModel( { widget: { id: 'elementor/icon-button', version: 1 } } );

		// Act
		const icon = resolveNavigatorIcon( FLEXBOX_ICON, model );

		// Assert
		expect( icon ).toBe( COMPOSITE_WIDGET_ICON );
	} );

	it( 'should keep the element icon when there is no widget marker', () => {
		// Arrange
		const model = createModel( {} );

		// Act
		const icon = resolveNavigatorIcon( FLEXBOX_ICON, model );

		// Assert
		expect( icon ).toBe( FLEXBOX_ICON );
	} );

	it( 'should keep the element icon for a widget part', () => {
		// Arrange
		const model = createModel( { part: 'icon' } );

		// Act
		const icon = resolveNavigatorIcon( FLEXBOX_ICON, model );

		// Assert
		expect( icon ).toBe( FLEXBOX_ICON );
	} );
} );

describe( 'initNavigatorIcon', () => {
	afterEach( () => {
		delete ( window as unknown as WindowWithHooks ).elementor;
		__privateSetReady( false );
	} );

	it( 'should register the filter immediately when the hooks exist', () => {
		// Arrange
		const addFilter = setHooks();

		// Act
		initNavigatorIcon();

		// Assert
		expect( addFilter ).toHaveBeenCalledTimes( 1 );
		expect( addFilter ).toHaveBeenCalledWith( NAVIGATOR_ICON_FILTER, resolveNavigatorIcon );
	} );

	it( 'should register the filter once v1 is ready when the hooks are not available yet', () => {
		// Arrange
		initNavigatorIcon();
		const addFilter = setHooks();

		// Act
		dispatchV1ReadyEvent();

		// Assert
		expect( addFilter ).toHaveBeenCalledTimes( 1 );
		expect( addFilter ).toHaveBeenCalledWith( NAVIGATOR_ICON_FILTER, resolveNavigatorIcon );
	} );
} );
