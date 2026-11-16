import { createHooksRegistry, setupHooksRegistry } from 'test-utils';

import { prepareWidgetTemplateForInsert } from '../../prepare-widget-template-for-insert';
import { type CompositeWidgetDefinition } from '../../types';
import { initExpandWidgetOnDrop } from '../expand-widget-on-drop';

jest.mock( '../../prepare-widget-template-for-insert' );

const DROP_COMMAND = 'preview/drop';
const WIDGET_ID = 'elementor/icon-button';

const DEFINITION: CompositeWidgetDefinition = {
	id: WIDGET_ID,
	version: 1,
	title: 'Icon button',
	template: { elType: 'e-flexbox', part: 'root' },
};

const PREPARED_TREE = { id: 'new-root', elType: 'e-flexbox', part: 'root', elements: [] };

type DropArgs = { model?: Record< string, unknown > };

describe( 'initExpandWidgetOnDrop', () => {
	const hooksRegistry = createHooksRegistry();

	const runDropHook = ( args: DropArgs ) => hooksRegistry.getByCommand( DROP_COMMAND )?.apply( args );

	beforeEach( () => {
		setupHooksRegistry( hooksRegistry );
		jest.mocked( prepareWidgetTemplateForInsert ).mockReturnValue( PREPARED_TREE );

		( window as unknown as { elementor: unknown } ).elementor = {
			config: { compositeWidgets: { [ WIDGET_ID ]: DEFINITION } },
		};

		initExpandWidgetOnDrop();
	} );

	afterEach( () => {
		delete ( window as unknown as { elementor?: unknown } ).elementor;
		jest.clearAllMocks();
	} );

	it( 'replaces the dropped model with the prepared widget tree', () => {
		// Arrange.
		const args: DropArgs = {
			model: { elType: 'e-flexbox', custom: { originalWidget: 'e-flexbox', compositeWidgetId: WIDGET_ID } },
		};

		// Act.
		const result = runDropHook( args );

		// Assert.
		expect( result ).toBe( true );
		expect( prepareWidgetTemplateForInsert ).toHaveBeenCalledWith( DEFINITION );
		expect( args.model ).toBe( PREPARED_TREE );
	} );

	it( 'leaves regular drops untouched', () => {
		// Arrange.
		const model = { elType: 'e-flexbox', custom: { isPreset: true } };
		const args: DropArgs = { model };

		// Act.
		const result = runDropHook( args );

		// Assert.
		expect( result ).toBe( true );
		expect( args.model ).toBe( model );
		expect( prepareWidgetTemplateForInsert ).not.toHaveBeenCalled();
	} );

	it( 'blocks the drop when the widget definition is missing', () => {
		// Arrange.
		const args: DropArgs = { model: { elType: 'e-flexbox', custom: { compositeWidgetId: 'acme/missing' } } };

		// Act.
		const result = runDropHook( args );

		// Assert.
		expect( result ).toBe( false );
		expect( prepareWidgetTemplateForInsert ).not.toHaveBeenCalled();
	} );
} );
