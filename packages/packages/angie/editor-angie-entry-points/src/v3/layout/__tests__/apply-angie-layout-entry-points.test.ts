jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

jest.mock( '../../is-angie-entry-points-enabled', () => ( {
	isAngieEntryPointsEnabled: jest.fn( () => true ),
} ) );

jest.mock( '../create-angie-layout-behavior', () => ( {
	getAngieAddSectionLayoutBehaviorClass: jest.fn( () => function AngieAddSectionBehavior() {} ),
} ) );

jest.mock( '../create-angie-template-library-behavior', () => ( {
	getAngieTemplateLibraryBehaviorClass: jest.fn( () => function AngieTemplateLibraryBehavior() {} ),
} ) );

import { openAngieInAgentMode } from '@elementor/editor-mcp';

import { isAngieEntryPointsEnabled } from '../../is-angie-entry-points-enabled';
import {
	applyAngieAddSectionBehavior,
	applyAngieContainerContextMenu,
	applyAngieTemplateLibraryBehaviors,
} from '../apply-angie-layout-entry-points';

describe( 'applyAngieLayoutEntryPoints', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( isAngieEntryPointsEnabled ).mockReturnValue( true );
		window.elementor = {
			documents: {
				getCurrent: () => ( { config: { type: 'page' } } ),
			},
		} as unknown as Window[ 'elementor' ];
	} );

	it( 'replaces add-section ai behavior when entry points are enabled', () => {
		// Arrange
		const LegacyBehavior = class {};
		const behaviors = {
			ai: { behaviorClass: LegacyBehavior, context: { documentType: 'page' } },
		};

		// Act
		const result = applyAngieAddSectionBehavior( behaviors );

		// Assert
		expect( result.ai ).toMatchObject( {
			context: { documentType: 'page' },
		} );
		expect( ( result.ai as { behaviorClass: unknown } ).behaviorClass ).not.toBe( LegacyBehavior );
	} );

	it( 'skips add-section override when entry points are disabled', () => {
		// Arrange
		jest.mocked( isAngieEntryPointsEnabled ).mockReturnValue( false );
		const LegacyBehavior = class {};
		const behaviors = { ai: { behaviorClass: LegacyBehavior } };

		// Act
		const result = applyAngieAddSectionBehavior( behaviors );

		// Assert
		expect( ( result.ai as { behaviorClass: unknown } ).behaviorClass ).toBe( LegacyBehavior );
	} );

	it( 'overrides container variation callback to open Angie', () => {
		// Arrange
		const legacyCallback = jest.fn();
		const groups = [
			{
				name: 'save',
				actions: [ { name: 'ai', callback: legacyCallback } ],
			},
		];
		const currentElement = {
			getContainer: () => ( {
				id: 'c1',
				model: { get: () => 'Container' },
				view: { _index: 1 },
			} ),
		};

		// Act
		applyAngieContainerContextMenu( groups, currentElement );
		groups[ 0 ].actions[ 0 ].callback?.();

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalled();
		expect( legacyCallback ).not.toHaveBeenCalled();
	} );

	it( 'replaces template library ai behavior class', () => {
		// Arrange
		const LegacyBehavior = class {};
		const behaviors = { applyAiTemplate: { behaviorClass: LegacyBehavior } };

		// Act
		const result = applyAngieTemplateLibraryBehaviors( behaviors );

		// Assert
		expect( ( result.applyAiTemplate as { behaviorClass: unknown } ).behaviorClass ).not.toBe( LegacyBehavior );
	} );
} );