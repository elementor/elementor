import { updateElementInteractions } from '@elementor/editor-elements';

import { interactionsRepository } from '../../interactions-repository';
import { createInteractionItem } from '../../utils/prop-value-utils';
import { MAX_INTERACTIONS_PER_ELEMENT } from '../constants';
import { initManageElementInteractionTool } from '../tools/manage-element-interaction-tool';

jest.mock( '../../interactions-repository', () => ( {
	interactionsRepository: {
		all: jest.fn(),
	},
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	updateElementInteractions: jest.fn(),
} ) );

const mockAll = interactionsRepository.all as jest.Mock;
const mockUpdateElementInteractions = updateElementInteractions as jest.Mock;

function createRegistryAndGetHandler(): ( args: Record< string, unknown > ) => unknown {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let capturedHandler: ( ( args: any ) => unknown ) | null = null;

	const reg = {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		addTool: jest.fn( ( opts: { handler: ( args: any ) => unknown } ) => {
			capturedHandler = opts.handler;
		} ),
		resource: jest.fn(),
		setMCPDescription: jest.fn(),
		getActiveChatInfo: jest.fn(),
		sendResourceUpdated: jest.fn(),
		waitForReady: jest.fn(),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mcpServer: {} as any,
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	initManageElementInteractionTool( reg as any );

	return ( args: Record< string, unknown > ) => {
		if ( ! capturedHandler ) {
			throw new Error( 'addTool was not called' );
		}
		return capturedHandler( args );
	};
}

function makeElementData( elementId: string, items = [] as ReturnType< typeof createInteractionItem >[] ) {
	return {
		elementId,
		dataId: elementId,
		interactions: {
			version: 1,
			items,
		},
	};
}

describe( 'manage-element-interaction tool', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'get action', () => {
		it( 'returns empty list when element has no interactions', () => {
			mockAll.mockReturnValue( [] );

			const callHandler = createRegistryAndGetHandler();
			const result = JSON.parse( callHandler( { elementId: 'el-123', action: 'get' } ) as string );

			expect( result.elementId ).toBe( 'el-123' );
			expect( result.interactions ).toEqual( [] );
			expect( result.count ).toBe( 0 );
		} );

		it( 'returns interaction summary for an element', () => {
			const item = createInteractionItem( {
				interactionId: 'temp-abc123',
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				direction: '',
				duration: 600,
				delay: 0,
				replay: false,
				easing: 'easeIn',
			} );

			mockAll.mockReturnValue( [ makeElementData( 'el-456', [ item ] ) ] );

			const callHandler = createRegistryAndGetHandler();
			const result = JSON.parse( callHandler( { elementId: 'el-456', action: 'get' } ) as string );

			expect( result.count ).toBe( 1 );
			expect( result.interactions[ 0 ] ).toMatchObject( {
				id: 'temp-abc123',
				trigger: 'load',
				effect: 'fade',
				effectType: 'in',
				direction: '',
				easing: 'easeIn',
				excludedBreakpoints: [],
			} );
		} );

		it( 'includes excludedBreakpoints in the response', () => {
			const item = createInteractionItem( {
				interactionId: 'bp-id',
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				replay: false,
				easing: 'easeIn',
				excludedBreakpoints: [ 'mobile', 'tablet' ],
			} );

			mockAll.mockReturnValue( [ makeElementData( 'el-bp', [ item ] ) ] );

			const callHandler = createRegistryAndGetHandler();
			const result = JSON.parse( callHandler( { elementId: 'el-bp', action: 'get' } ) as string );

			expect( result.interactions[ 0 ].excludedBreakpoints ).toEqual( [ 'mobile', 'tablet' ] );
		} );

		it( 'does not call updateElementInteractions', () => {
			mockAll.mockReturnValue( [] );
			const callHandler = createRegistryAndGetHandler();
			callHandler( { elementId: 'el-123', action: 'get' } );

			expect( mockUpdateElementInteractions ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'add action', () => {
		it( 'adds an interaction to an element with no existing interactions', () => {
			mockAll.mockReturnValue( [] );

			const callHandler = createRegistryAndGetHandler();
			const result = JSON.parse(
				callHandler( {
					elementId: 'el-123',
					action: 'add',
					trigger: 'load',
					effect: 'fade',
					effectType: 'in',
					direction: '',
					duration: 600,
					delay: 0,
					easing: 'easeIn',
				} ) as string
			);

			expect( result.success ).toBe( true );
			expect( result.interactionCount ).toBe( 1 );
			expect( mockUpdateElementInteractions ).toHaveBeenCalledWith(
				expect.objectContaining( { elementId: 'el-123' } )
			);
		} );

		it( 'does not set replay (PRO-only) on new interactions', () => {
			mockAll.mockReturnValue( [] );

			const callHandler = createRegistryAndGetHandler();
			callHandler( {
				elementId: 'el-noreplay',
				action: 'add',
				trigger: 'load',
				effect: 'fade',
				effectType: 'in',
			} );

			const interactions = mockUpdateElementInteractions.mock.calls[ 0 ][ 0 ].interactions;
			const createdItem = interactions.items[ 0 ];
			expect( createdItem.value.animation.value.config.value.replay.value ).toBe( false );
		} );

		it( 'sets excludedBreakpoints when provided', () => {
			mockAll.mockReturnValue( [] );

			const callHandler = createRegistryAndGetHandler();
			callHandler( {
				elementId: 'el-bp-add',
				action: 'add',
				trigger: 'load',
				effect: 'fade',
				effectType: 'in',
				excludedBreakpoints: [ 'mobile' ],
			} );

			const interactions = mockUpdateElementInteractions.mock.calls[ 0 ][ 0 ].interactions;
			const createdItem = interactions.items[ 0 ];
			expect( createdItem.value.breakpoints ).toBeDefined();
			expect( createdItem.value.breakpoints.value.excluded.value[ 0 ].value ).toBe( 'mobile' );
		} );

		it( 'appends to existing interactions', () => {
			const existingItem = createInteractionItem( {
				interactionId: 'existing-id',
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				replay: false,
				easing: 'easeIn',
			} );

			mockAll.mockReturnValue( [ makeElementData( 'el-456', [ existingItem ] ) ] );

			const callHandler = createRegistryAndGetHandler();
			const result = JSON.parse(
				callHandler( {
					elementId: 'el-456',
					action: 'add',
					trigger: 'scrollIn',
					effect: 'slide',
					effectType: 'out',
					direction: 'top',
				} ) as string
			);

			expect( result.interactionCount ).toBe( 2 );
		} );

		it( `throws when element already has ${ MAX_INTERACTIONS_PER_ELEMENT } interactions`, () => {
			const items = Array.from( { length: MAX_INTERACTIONS_PER_ELEMENT }, ( _, i ) =>
				createInteractionItem( {
					interactionId: `id-${ i }`,
					trigger: 'load',
					effect: 'fade',
					type: 'in',
					duration: 300,
					delay: 0,
					replay: false,
					easing: 'easeIn',
				} )
			);

			mockAll.mockReturnValue( [ makeElementData( 'el-full', items ) ] );

			const callHandler = createRegistryAndGetHandler();

			expect( () =>
				callHandler( {
					elementId: 'el-full',
					action: 'add',
					trigger: 'load',
					effect: 'fade',
					effectType: 'in',
				} )
			).toThrow( new RegExp( `${ MAX_INTERACTIONS_PER_ELEMENT }`, 'i' ) );
		} );
	} );

	describe( 'update action', () => {
		it( 'updates trigger and duration of an existing interaction', () => {
			const existingItem = createInteractionItem( {
				interactionId: 'update-me',
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				replay: false,
				easing: 'easeIn',
			} );

			mockAll.mockReturnValue( [ makeElementData( 'el-789', [ existingItem ] ) ] );

			const callHandler = createRegistryAndGetHandler();
			const result = JSON.parse(
				callHandler( {
					elementId: 'el-789',
					action: 'update',
					interactionId: 'update-me',
					trigger: 'scrollIn',
					duration: 800,
				} ) as string
			);

			expect( result.success ).toBe( true );

			const updatedItem = mockUpdateElementInteractions.mock.calls[ 0 ][ 0 ].interactions.items[ 0 ];
			expect( updatedItem.value.trigger.value ).toBe( 'scrollIn' );
		} );

		it( 'preserves replay=false from existing item (PRO-only)', () => {
			const existingItem = createInteractionItem( {
				interactionId: 'replay-test',
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				replay: false,
				easing: 'easeIn',
			} );

			mockAll.mockReturnValue( [ makeElementData( 'el-replay', [ existingItem ] ) ] );

			const callHandler = createRegistryAndGetHandler();
			callHandler( {
				elementId: 'el-replay',
				action: 'update',
				interactionId: 'replay-test',
				duration: 500,
			} );

			const updatedItem = mockUpdateElementInteractions.mock.calls[ 0 ][ 0 ].interactions.items[ 0 ];
			expect( updatedItem.value.animation.value.config.value.replay.value ).toBe( false );
		} );

		it( 'updates excludedBreakpoints when provided', () => {
			const existingItem = createInteractionItem( {
				interactionId: 'bp-update',
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				replay: false,
				easing: 'easeIn',
				excludedBreakpoints: [ 'mobile' ],
			} );

			mockAll.mockReturnValue( [ makeElementData( 'el-bp', [ existingItem ] ) ] );

			const callHandler = createRegistryAndGetHandler();
			callHandler( {
				elementId: 'el-bp',
				action: 'update',
				interactionId: 'bp-update',
				excludedBreakpoints: [ 'mobile', 'tablet' ],
			} );

			const updatedItem = mockUpdateElementInteractions.mock.calls[ 0 ][ 0 ].interactions.items[ 0 ];
			expect( updatedItem.value.breakpoints.value.excluded.value ).toHaveLength( 2 );
		} );

		it( 'preserves existing excludedBreakpoints when not specified in update', () => {
			const existingItem = createInteractionItem( {
				interactionId: 'bp-preserve',
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				replay: false,
				easing: 'easeIn',
				excludedBreakpoints: [ 'mobile' ],
			} );

			mockAll.mockReturnValue( [ makeElementData( 'el-preserve', [ existingItem ] ) ] );

			const callHandler = createRegistryAndGetHandler();
			callHandler( {
				elementId: 'el-preserve',
				action: 'update',
				interactionId: 'bp-preserve',
				duration: 500,
			} );

			const updatedItem = mockUpdateElementInteractions.mock.calls[ 0 ][ 0 ].interactions.items[ 0 ];
			expect( updatedItem.value.breakpoints.value.excluded.value[ 0 ].value ).toBe( 'mobile' );
		} );

		it( 'throws when interactionId is missing', () => {
			mockAll.mockReturnValue( [] );
			const callHandler = createRegistryAndGetHandler();

			expect( () => callHandler( { elementId: 'el-abc', action: 'update', trigger: 'load' } ) ).toThrow(
				/interactionId is required/
			);
		} );

		it( 'throws when interaction ID is not found', () => {
			const existingItem = createInteractionItem( {
				interactionId: 'real-id',
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				replay: false,
				easing: 'easeIn',
			} );

			mockAll.mockReturnValue( [ makeElementData( 'el-abc', [ existingItem ] ) ] );
			const callHandler = createRegistryAndGetHandler();

			expect( () =>
				callHandler( { elementId: 'el-abc', action: 'update', interactionId: 'ghost-id', trigger: 'scrollIn' } )
			).toThrow( /not found/ );
		} );
	} );

	describe( 'delete action', () => {
		it( 'removes the specified interaction and keeps the rest', () => {
			const item1 = createInteractionItem( {
				interactionId: 'keep-me',
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				replay: false,
				easing: 'easeIn',
			} );

			const item2 = createInteractionItem( {
				interactionId: 'delete-me',
				trigger: 'scrollIn',
				effect: 'slide',
				type: 'out',
				duration: 500,
				delay: 0,
				replay: false,
				easing: 'easeIn',
			} );

			mockAll.mockReturnValue( [ makeElementData( 'el-del', [ item1, item2 ] ) ] );

			const callHandler = createRegistryAndGetHandler();
			const result = JSON.parse(
				callHandler( { elementId: 'el-del', action: 'delete', interactionId: 'delete-me' } ) as string
			);

			expect( result.success ).toBe( true );
			expect( result.interactionCount ).toBe( 1 );

			const remaining = mockUpdateElementInteractions.mock.calls[ 0 ][ 0 ].interactions.items;
			expect( remaining[ 0 ].value.interaction_id.value ).toBe( 'keep-me' );
		} );

		it( 'throws when interactionId is missing', () => {
			mockAll.mockReturnValue( [] );
			const callHandler = createRegistryAndGetHandler();

			expect( () => callHandler( { elementId: 'el-abc', action: 'delete' } ) ).toThrow(
				/interactionId is required/
			);
		} );

		it( 'throws when interaction ID is not found', () => {
			const item = createInteractionItem( {
				interactionId: 'real-id',
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				duration: 300,
				delay: 0,
				replay: false,
				easing: 'easeIn',
			} );

			mockAll.mockReturnValue( [ makeElementData( 'el-abc', [ item ] ) ] );
			const callHandler = createRegistryAndGetHandler();

			expect( () => callHandler( { elementId: 'el-abc', action: 'delete', interactionId: 'ghost-id' } ) ).toThrow(
				/not found/
			);
		} );
	} );

	describe( 'clear action', () => {
		it( 'removes all interactions from an element', () => {
			const items = Array.from( { length: 3 }, ( _, i ) =>
				createInteractionItem( {
					interactionId: `id-${ i }`,
					trigger: 'load',
					effect: 'fade',
					type: 'in',
					duration: 300,
					delay: 0,
					replay: false,
					easing: 'easeIn',
				} )
			);

			mockAll.mockReturnValue( [ makeElementData( 'el-clear', items ) ] );

			const callHandler = createRegistryAndGetHandler();
			const result = JSON.parse( callHandler( { elementId: 'el-clear', action: 'clear' } ) as string );

			expect( result.success ).toBe( true );
			expect( result.interactionCount ).toBe( 0 );
			expect( mockUpdateElementInteractions.mock.calls[ 0 ][ 0 ].interactions.items ).toHaveLength( 0 );
		} );

		it( 'succeeds for an element with no existing interactions', () => {
			mockAll.mockReturnValue( [] );

			const callHandler = createRegistryAndGetHandler();
			const result = JSON.parse( callHandler( { elementId: 'el-empty', action: 'clear' } ) as string );

			expect( result.success ).toBe( true );
			expect( result.interactionCount ).toBe( 0 );
		} );
	} );

	describe( 'error handling', () => {
		it( 'wraps updateElementInteractions errors with element context', () => {
			mockAll.mockReturnValue( [] );
			mockUpdateElementInteractions.mockImplementationOnce( () => {
				throw new Error( 'Element not found' );
			} );

			const callHandler = createRegistryAndGetHandler();

			expect( () =>
				callHandler( {
					elementId: 'el-missing',
					action: 'add',
					trigger: 'load',
					effect: 'fade',
					effectType: 'in',
				} )
			).toThrow( /Failed to update interactions for element "el-missing"/ );
		} );

		it( 'includes the original error message in the thrown error', () => {
			mockAll.mockReturnValue( [] );
			mockUpdateElementInteractions.mockImplementationOnce( () => {
				throw new Error( 'Element not found' );
			} );

			const callHandler = createRegistryAndGetHandler();

			expect( () =>
				callHandler( {
					elementId: 'el-missing',
					action: 'add',
					trigger: 'load',
					effect: 'fade',
					effectType: 'in',
				} )
			).toThrow( /Element not found/ );
		} );
	} );
} );
