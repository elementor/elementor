import { SCROLL_INTERACTION_EVENT, extractScrollOverlayParams, syncGridOverlay } from '../utils/scroll-interaction-event';
import { createInteractionItemValue } from './utils';

function getScrollEvents( spy: jest.SpyInstance ) {
	return spy.mock.calls
		.filter( ( [ event ]: [ Event ] ) => event.type === SCROLL_INTERACTION_EVENT )
		.map( ( [ event ]: [ CustomEvent ] ) => event.detail );
}

describe( 'syncGridOverlay', () => {
	let dispatchSpy: jest.SpyInstance;

	beforeEach( () => {
		dispatchSpy = jest.spyOn( window, 'dispatchEvent' );
	} );

	afterEach( () => {
		dispatchSpy.mockRestore();
	} );

	it( 'should show grid lines when trigger is scrollOn', () => {
		syncGridOverlay( 'scrollOn', '85%', '15%', 'viewport' );

		expect( getScrollEvents( dispatchSpy ) ).toEqual( [
			{ start: '85%', end: '15%', relativeTo: 'viewport' },
		] );
	} );

	it( 'should hide grid lines when trigger is not scrollOn', () => {
		syncGridOverlay( 'load', '85%', '15%', 'viewport' );

		expect( getScrollEvents( dispatchSpy ) ).toEqual( [ null ] );
	} );

	it( 'should pass relativeTo value through to the event', () => {
		syncGridOverlay( 'scrollOn', '50%', '10%', 'page' );

		expect( getScrollEvents( dispatchSpy ) ).toEqual( [
			{ start: '50%', end: '10%', relativeTo: 'page' },
		] );
	} );
} );

describe( 'extractScrollOverlayParams', () => {
	const defaults = { trigger: 'load', start: 85, end: 15, relativeTo: 'viewport' };

	it( 'should extract trigger, start, end, and relativeTo from an interaction', () => {
		const interaction = createInteractionItemValue( {
			trigger: 'scrollOn',
			start: 70,
			end: 30,
			relativeTo: 'page',
		} );

		expect( extractScrollOverlayParams( interaction, defaults ) ).toEqual( {
			trigger: 'scrollOn',
			start: '70%',
			end: '30%',
			relativeTo: 'page',
		} );
	} );

	it( 'should use default values when interaction omits optional scroll fields', () => {
		const interaction = createInteractionItemValue( { trigger: 'load' } );

		const result = extractScrollOverlayParams( interaction, defaults );

		expect( result.trigger ).toBe( 'load' );
		expect( result.relativeTo ).toBe( 'viewport' );
		expect( result.start ).toBe( '85%' );
		expect( result.end ).toBe( '15%' );
	} );
} );
