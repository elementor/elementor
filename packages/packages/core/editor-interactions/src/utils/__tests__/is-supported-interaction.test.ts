import { createInteractionItemValue } from '../../__tests__/utils';
import { getInteractionsControlOptions } from '../../interactions-controls-registry';
import { type InteractionItemPropValue } from '../../types';
import { isSupportedInteractionItem } from '../../utils/is-supported-interaction-item';

jest.mock( '../../interactions-controls-registry', () => ( {
	getInteractionsControlOptions: jest.fn(),
} ) );

const mockedGetOptions = jest.mocked( getInteractionsControlOptions );

const wrapAsItem = ( value: ReturnType< typeof createInteractionItemValue > ): InteractionItemPropValue => ( {
	$$type: 'interaction-item',
	value,
} );

describe( 'isSupportedInteractionItem', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should allow interaction when trigger and easing are both in registered options', () => {
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

		expect( isSupportedInteractionItem( item ) ).toBe( true );
	} );

	it( 'should not allow interaction when trigger is NOT in registered options (pro trigger)', () => {
		mockedGetOptions.mockImplementation( ( type ) => {
			if ( type === 'trigger' ) {
				return [ 'load', 'scrollIn' ];
			}
			return [];
		} );

		const item = wrapAsItem( createInteractionItemValue( { trigger: 'hover' } ) );

		expect( isSupportedInteractionItem( item ) ).toBe( false );
	} );

	it( 'should not allow interaction when easing is NOT in registered options (pro easing)', () => {
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

		expect( isSupportedInteractionItem( item ) ).toBe( false );
	} );

	it( 'should not allow interaction when both trigger and easing are pro', () => {
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

		expect( isSupportedInteractionItem( item ) ).toBe( false );
	} );

	it( 'should skip checks when control options are empty (no filtering)', () => {
		mockedGetOptions.mockReturnValue( [] );

		const item = wrapAsItem( createInteractionItemValue( { trigger: 'anyTrigger', easing: 'anyEasing' } ) );

		expect( isSupportedInteractionItem( item ) ).toBe( true );
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

		expect( isSupportedInteractionItem( item ) ).toBe( false );
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

		expect( isSupportedInteractionItem( item ) ).toBe( false );
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
		expect( isSupportedInteractionItem( freeItem ) ).toBe( true );

		const proItem = wrapAsItem( createInteractionItemValue( { trigger: 'click', easing: 'easeOut' } ) );
		expect( isSupportedInteractionItem( proItem ) ).toBe( false );
	} );

	it( 'should not flag as pro when easing is empty (missing config)', () => {
		mockedGetOptions.mockImplementation( ( type ) => {
			if ( type === 'trigger' ) {
				return [ 'load' ];
			}
			if ( type === 'easing' ) {
				return [ 'easeIn' ];
			}
			return [];
		} );

		const item = wrapAsItem( createInteractionItemValue( { trigger: 'load', easing: '' } ) );

		expect( isSupportedInteractionItem( item ) ).toBe( true );
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
		expect( isSupportedInteractionItem( freeItem ) ).toBe( true );

		const proItem = wrapAsItem( createInteractionItemValue( { trigger: 'load', easing: 'cubicBezier' } ) );
		expect( isSupportedInteractionItem( proItem ) ).toBe( false );
	} );
} );
