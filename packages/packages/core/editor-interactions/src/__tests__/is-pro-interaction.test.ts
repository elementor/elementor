import { isProInteraction } from '../utils/is-pro-interaction';
import { getInteractionsControlOptions } from '../interactions-controls-registry';
import type { InteractionItemPropValue } from '../types';
import { createInteractionItemValue } from './utils';

jest.mock( '../interactions-controls-registry', () => ( {
	getInteractionsControlOptions: jest.fn(),
} ) );

const mockedGetOptions = jest.mocked( getInteractionsControlOptions );

const wrapAsItem = ( value: ReturnType< typeof createInteractionItemValue > ): InteractionItemPropValue => ( {
	$$type: 'interaction-item',
	value,
} );

describe( 'isProInteraction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return false when trigger and easing are both in registered options', () => {
		mockedGetOptions.mockImplementation( ( type ) => {
			if ( type === 'trigger' ) {
				return [ 'load', 'scrollIn', 'scrollOut' ];
			}
			if ( type === 'easing' ) {
				return [ 'easeIn', 'easeOut', 'linear' ];
			}
			return [];
		} );

		const item = wrapAsItem( createInteractionItemValue( { trigger: 'load', easing: 'easeIn' } ) );

		expect( isProInteraction( item ) ).toBe( false );
	} );

	it( 'should return true when trigger is NOT in registered options (pro trigger)', () => {
		mockedGetOptions.mockImplementation( ( type ) => {
			if ( type === 'trigger' ) {
				return [ 'load', 'scrollIn' ];
			}
			if ( type === 'easing' ) {
				return [ 'easeIn', 'easeOut' ];
			}
			return [];
		} );

		const item = wrapAsItem( createInteractionItemValue( { trigger: 'hover' } ) );

		expect( isProInteraction( item ) ).toBe( true );
	} );

	it( 'should return true when easing is NOT in registered options (pro easing)', () => {
		mockedGetOptions.mockImplementation( ( type ) => {
			if ( type === 'trigger' ) {
				return [ 'load', 'scrollIn' ];
			}
			if ( type === 'easing' ) {
				return [ 'easeIn' ];
			}
			return [];
		} );

		const item = wrapAsItem( createInteractionItemValue( { trigger: 'load', easing: 'proCustomEasing' } ) );

		expect( isProInteraction( item ) ).toBe( true );
	} );

	it( 'should return true when both trigger and easing are pro', () => {
		mockedGetOptions.mockImplementation( ( type ) => {
			if ( type === 'trigger' ) {
				return [ 'load' ];
			}
			if ( type === 'easing' ) {
				return [ 'easeIn' ];
			}
			return [];
		} );

		const item = wrapAsItem( createInteractionItemValue( { trigger: 'click', easing: 'proCustomEasing' } ) );

		expect( isProInteraction( item ) ).toBe( true );
	} );

	it( 'should skip checks when control options are empty (no filtering)', () => {
		mockedGetOptions.mockReturnValue( [] );

		const item = wrapAsItem( createInteractionItemValue( { trigger: 'anyTrigger', easing: 'anyEasing' } ) );

		expect( isProInteraction( item ) ).toBe( false );
	} );

	it( 'should skip trigger check when trigger options are empty but flag pro easing', () => {
		mockedGetOptions.mockImplementation( ( type ) => {
			if ( type === 'trigger' ) {
				return [];
			}
			if ( type === 'easing' ) {
				return [ 'easeIn' ];
			}
			return [];
		} );

		const item = wrapAsItem( createInteractionItemValue( { trigger: 'anyTrigger', easing: 'proEasing' } ) );

		expect( isProInteraction( item ) ).toBe( true );
	} );

	it( 'should skip easing check when easing options are empty but flag pro trigger', () => {
		mockedGetOptions.mockImplementation( ( type ) => {
			if ( type === 'trigger' ) {
				return [ 'load' ];
			}
			if ( type === 'easing' ) {
				return [];
			}
			return [];
		} );

		const item = wrapAsItem( createInteractionItemValue( { trigger: 'hover', easing: 'anyEasing' } ) );

		expect( isProInteraction( item ) ).toBe( true );
	} );

	it( 'should flag as pro only when a concrete trigger value is outside the registered set', () => {
		mockedGetOptions.mockImplementation( ( type ) => {
			if ( type === 'trigger' ) {
				return [ 'load', 'scrollIn' ];
			}
			if ( type === 'easing' ) {
				return [ 'easeIn', 'easeOut' ];
			}
			return [];
		} );

		const freeItem = wrapAsItem( createInteractionItemValue( { trigger: 'scrollIn', easing: 'easeOut' } ) );
		expect( isProInteraction( freeItem ) ).toBe( false );

		const proItem = wrapAsItem( createInteractionItemValue( { trigger: 'click', easing: 'easeOut' } ) );
		expect( isProInteraction( proItem ) ).toBe( true );
	} );

	it( 'should flag as pro only when a concrete easing value is outside the registered set', () => {
		mockedGetOptions.mockImplementation( ( type ) => {
			if ( type === 'trigger' ) {
				return [ 'load', 'scrollIn' ];
			}
			if ( type === 'easing' ) {
				return [ 'easeIn' ];
			}
			return [];
		} );

		const freeItem = wrapAsItem( createInteractionItemValue( { trigger: 'load', easing: 'easeIn' } ) );
		expect( isProInteraction( freeItem ) ).toBe( false );

		const proItem = wrapAsItem( createInteractionItemValue( { trigger: 'load', easing: 'cubicBezier' } ) );
		expect( isProInteraction( proItem ) ).toBe( true );
	} );
} );
