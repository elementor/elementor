jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

jest.mock( '../../is-angie-entry-points-enabled', () => ( {
	shouldShowAngieEntryPoints: jest.fn( () => true ),
} ) );

jest.mock( '../create-angie-layout-behavior', () => ( {
	getAngieAddSectionLayoutBehaviorClass: jest.fn( () => function AngieAddSectionBehavior() {} ),
} ) );

jest.mock( '../create-angie-template-library-behavior', () => ( {
	getAngieTemplateLibraryBehaviorClass: jest.fn( () => function AngieTemplateLibraryBehavior() {} ),
} ) );

import { openAngieInAgentMode } from '@elementor/editor-mcp';

import { shouldShowAngieEntryPoints } from '../../is-angie-entry-points-enabled';
import {
	applyAngieAddSectionBehavior,
	applyAngieContainerContextMenu,
	applyAngieTemplateLibraryBehaviors,
	filterLibraryActionButtonTemplate,
} from '../apply-angie-layout-entry-points';
import { getAngieAddSectionLayoutBehaviorClass } from '../create-angie-layout-behavior';
import { getAngieTemplateLibraryBehaviorClass } from '../create-angie-template-library-behavior';

describe( 'applyAngieLayoutEntryPoints', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( shouldShowAngieEntryPoints ).mockReturnValue( true );
		window.elementor = {
			documents: {
				getCurrent: () => ( { config: { type: 'page' } } ),
			},
		} as unknown as Window[ 'elementor' ];
	} );

	it( 'creates add-section ai behavior when legacy did not register one', () => {
		// Arrange
		const behaviors = {};

		// Act
		const result = applyAngieAddSectionBehavior( behaviors );

		// Assert
		expect( result.ai ).toMatchObject( {
			context: { documentType: 'page' },
			layoutContext: { mode: 'new-layout', documentType: 'page' },
		} );
		expect( getAngieAddSectionLayoutBehaviorClass ).toHaveBeenCalled();
		expect( ( result.ai as { behaviorClass: unknown } ).behaviorClass ).toEqual(
			expect.any( Function )
		);
	} );

	it( 'replaces existing add-section ai behavior when entry points are enabled', () => {
		// Arrange
		function LegacyBehavior() {}
		const behaviors = {
			ai: { behaviorClass: LegacyBehavior, context: { documentType: 'page' } },
		};

		// Act
		const result = applyAngieAddSectionBehavior( behaviors );

		// Assert
		expect( ( result.ai as { behaviorClass: unknown } ).behaviorClass ).not.toBe( LegacyBehavior );
	} );

	it( 'skips add-section when entry points are disabled', () => {
		// Arrange
		jest.mocked( shouldShowAngieEntryPoints ).mockReturnValue( false );
		const behaviors = {};

		// Act
		const result = applyAngieAddSectionBehavior( behaviors );

		// Assert
		expect( result.ai ).toBeUndefined();
	} );

	it( 'adds container variation action when legacy did not register one', () => {
		// Arrange
		const groups = [ { name: 'save', actions: [] as { name?: string; callback?: () => void }[] } ];
		const currentElement = {
			getContainer: () => ( {
				id: 'c1',
				model: { get: () => 'Container' },
				view: { _index: 1 },
				children: { length: 2 },
			} ),
		};

		// Act
		applyAngieContainerContextMenu( groups, currentElement );
		groups[ 0 ].actions[ 0 ].callback?.();

		// Assert
		expect( groups[ 0 ].actions[ 0 ].name ).toBe( 'ai' );
		expect( openAngieInAgentMode ).toHaveBeenCalled();
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
				parent: { id: 'parent-1' },
			} ),
		};

		// Act
		applyAngieContainerContextMenu( groups, currentElement );
		groups[ 0 ].actions[ 0 ].callback?.();

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalled();
		expect( legacyCallback ).not.toHaveBeenCalled();
	} );

	it( 'creates template library ai behavior when legacy did not register one', () => {
		// Arrange
		const behaviors = {};

		// Act
		const result = applyAngieTemplateLibraryBehaviors( behaviors );

		// Assert
		expect( getAngieTemplateLibraryBehaviorClass ).toHaveBeenCalled();
		expect( ( result.applyAiTemplate as { behaviorClass: unknown } ).behaviorClass ).toEqual(
			expect.any( Function )
		);
	} );

	it( 'replaces template library ai behavior class', () => {
		// Arrange
		function LegacyBehavior() {}
		const behaviors = { applyAiTemplate: { behaviorClass: LegacyBehavior } };

		// Act
		const result = applyAngieTemplateLibraryBehaviors( behaviors );

		// Assert
		expect( ( result.applyAiTemplate as { behaviorClass: unknown } ).behaviorClass ).not.toBe( LegacyBehavior );
	} );

	it( 'switches blocks library insert template to include Generate Variations', () => {
		// Arrange
		( window as unknown as { $e: { routes: { current: { library: string } } } } ).$e = {
			routes: { current: { library: 'library/templates/blocks' } },
		};

		// Act
		const result = filterLibraryActionButtonTemplate( '#tmpl-elementor-template-library-insert-button' );

		// Assert
		expect( result ).toBe( '#tmpl-elementor-template-library-insert-and-ai-variations-buttons' );
	} );

	it( 'leaves non-blocks library templates unchanged', () => {
		// Arrange
		( window as unknown as { $e: { routes: { current: { library: string } } } } ).$e = {
			routes: { current: { library: 'library/templates/pages' } },
		};

		// Act
		const result = filterLibraryActionButtonTemplate( '#tmpl-elementor-template-library-insert-button' );

		// Assert
		expect( result ).toBe( '#tmpl-elementor-template-library-insert-button' );
	} );
} );
