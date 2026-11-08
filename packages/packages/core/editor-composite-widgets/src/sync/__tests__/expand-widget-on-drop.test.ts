import { createHooksRegistry, setupHooksRegistry } from 'test-utils';
import { prepareWidgetTemplateForInsert, type WidgetDefinitionForInsert } from '@elementor/editor-elements';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { initExpandWidgetOnDrop } from '../expand-widget-on-drop';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	isExperimentActive: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	prepareWidgetTemplateForInsert: jest.fn(),
} ) );

const DROP_COMMAND = 'preview/drop';
const WIDGET_ID = 'elementor/icon-button';

const DEFINITION: WidgetDefinitionForInsert = {
	id: WIDGET_ID,
	version: 1,
	template: { elType: 'e-flexbox', part: 'root' },
};

const PREPARED_TREE = { id: 'new-root', elType: 'e-flexbox', part: 'root', elements: [] };

type DropArgs = { model?: Record< string, unknown > };

describe( 'initExpandWidgetOnDrop', () => {
	const hooksRegistry = createHooksRegistry();

	const runDropHook = ( args: DropArgs ) => hooksRegistry.getByCommand( DROP_COMMAND )?.apply( args );

	beforeEach( () => {
		setupHooksRegistry( hooksRegistry );
		jest.mocked( isExperimentActive ).mockReturnValue( true );
		jest.mocked( prepareWidgetTemplateForInsert ).mockReturnValue( PREPARED_TREE );

		( window as unknown as { elementor: unknown } ).elementor = {
			config: { v4Widgets: { [ WIDGET_ID ]: DEFINITION } },
		};
	} );

	afterEach( () => {
		delete ( window as unknown as { elementor?: unknown } ).elementor;
		jest.clearAllMocks();
	} );

	it( 'replaces the dropped model with the prepared widget tree', () => {
		// Arrange.
		initExpandWidgetOnDrop();

		const args: DropArgs = {
			model: { elType: 'e-flexbox', custom: { originalWidget: 'e-flexbox', v4WidgetId: WIDGET_ID } },
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
		initExpandWidgetOnDrop();

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
		initExpandWidgetOnDrop();

		const args: DropArgs = { model: { elType: 'e-flexbox', custom: { v4WidgetId: 'acme/missing' } } };

		// Act.
		const result = runDropHook( args );

		// Assert.
		expect( result ).toBe( false );
		expect( prepareWidgetTemplateForInsert ).not.toHaveBeenCalled();
	} );

	it( 'does not register the hook when the experiment is inactive', () => {
		// Arrange.
		jest.mocked( isExperimentActive ).mockReturnValue( false );

		// Act.
		initExpandWidgetOnDrop();

		// Assert.
		expect( hooksRegistry.getByCommand( DROP_COMMAND ) ).toBeUndefined();
	} );
} );
