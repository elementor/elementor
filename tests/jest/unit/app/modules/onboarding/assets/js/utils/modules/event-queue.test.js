import {
	clearEventQueue,
	enqueueEvent,
	getEventQueue,
} from '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/event-queue.js';

beforeEach( () => {
	sessionStorage.clear();
} );

describe( 'onboarding event queue', () => {
	test( 'keeps order', () => {
		enqueueEvent( 'first', { a: 1 } );
		enqueueEvent( 'second', { b: 2 } );

		expect( getEventQueue().map( ( item ) => item.name ) ).toEqual( [ 'first', 'second' ] );
	} );

	test( 'does not duplicate dedupe keys', () => {
		enqueueEvent( 'one', {}, 'dedupe-a' );
		enqueueEvent( 'two', {}, 'dedupe-a' );

		expect( getEventQueue() ).toHaveLength( 1 );
	} );

	test( 'clears stored items', () => {
		enqueueEvent( 'x', {} );
		clearEventQueue();

		expect( getEventQueue() ).toEqual( [] );
	} );
} );
