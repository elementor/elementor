import { clearEventQueue, enqueueEvent, getEventQueue } from '../event-queue';

const STORAGE_KEY = 'elementor_ob_event_queue';

beforeEach( () => {
	sessionStorage.clear();
} );

afterEach( () => {
	jest.restoreAllMocks();
} );

describe( 'event-queue', () => {
	describe( 'enqueueEvent', () => {
		it( 'adds event with correct structure (name, payload, timestamp)', () => {
			enqueueEvent( 'test_event', { foo: 'bar' } );

			const queue = getEventQueue();
			expect( queue ).toHaveLength( 1 );
			expect( queue[ 0 ] ).toMatchObject( {
				name: 'test_event',
				payload: { foo: 'bar' },
			} );
			expect( typeof queue[ 0 ].timestamp ).toBe( 'number' );
		} );

		it( 'handles sessionStorage quota exceeded gracefully', () => {
			jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
				throw new Error( 'QuotaExceededError' );
			} );

			expect( () => enqueueEvent( 'x', {} ) ).not.toThrow();
		} );
	} );

	describe( 'getEventQueue', () => {
		it( 'returns empty array when storage is empty', () => {
			expect( getEventQueue() ).toEqual( [] );
		} );

		it( 'returns parsed events from storage', () => {
			const events = [
				{ name: 'a', payload: { x: 1 }, timestamp: 100 },
				{ name: 'b', payload: { y: 2 }, timestamp: 200 },
			];
			sessionStorage.setItem( STORAGE_KEY, JSON.stringify( events ) );

			expect( getEventQueue() ).toEqual( events );
		} );

		it( 'handles corrupted JSON gracefully', () => {
			sessionStorage.setItem( STORAGE_KEY, 'invalid json {{{' );

			expect( getEventQueue() ).toEqual( [] );
		} );
	} );

	describe( 'clearEventQueue', () => {
		it( 'removes all events', () => {
			enqueueEvent( 'e1', {} );
			enqueueEvent( 'e2', {} );
			expect( getEventQueue() ).toHaveLength( 2 );

			clearEventQueue();
			expect( getEventQueue() ).toEqual( [] );
		} );

		it( 'handles clear failure gracefully', () => {
			enqueueEvent( 'e', {} );
			jest.spyOn( Storage.prototype, 'removeItem' ).mockImplementation( () => {
				throw new Error( 'Storage unavailable' );
			} );

			expect( () => clearEventQueue() ).not.toThrow();
		} );
	} );

	describe( 'multiple enqueue / dequeue operations', () => {
		it( 'maintains correct order', () => {
			enqueueEvent( 'first', {} );
			enqueueEvent( 'second', {} );
			enqueueEvent( 'third', {} );

			const queue = getEventQueue();
			expect( queue.map( ( e ) => e.name ) ).toEqual( [ 'first', 'second', 'third' ] );
			expect( queue[ 0 ].timestamp ).toBeLessThanOrEqual( queue[ 1 ].timestamp );
			expect( queue[ 1 ].timestamp ).toBeLessThanOrEqual( queue[ 2 ].timestamp );

			clearEventQueue();
			expect( getEventQueue() ).toEqual( [] );
		} );
	} );
} );
