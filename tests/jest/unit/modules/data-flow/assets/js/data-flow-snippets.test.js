import { createSnippetRegistry } from 'elementor/modules/data-flow/assets/js/data-flow-snippet-registry';
import { attachSnippets } from 'elementor/modules/data-flow/assets/js/data-flow-snippets';
import { createStore } from 'elementor/modules/data-flow/assets/js/data-flow-store';

const attach = ( { handlers, store, pageStore = createStore( {} ), event = 'click' } ) => {
	const registry = createSnippetRegistry();

	registry.registerSnippet( 'sample', { [ event ]: handlers } );
	attachSnippets( {
		entries: [ { elementId: 'btn1', snippets: [ { snippet: 'sample', event } ] } ],
		registry,
		storeOrResolver: store,
		pageStore,
		root: document,
	} );
};

describe( 'attachSnippets', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation( ( callback ) => setTimeout( callback, 0 ) );
		document.body.innerHTML = '<button data-interaction-id="btn1">Click</button>';
	} );

	afterEach( () => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	} );

	it( 'should batch state writes of several events into a single store update per frame', () => {
		// Arrange
		const store = createStore( { count: 0 } );
		const listener = jest.fn();
		store.subscribe( 'count', listener );
		attach( { store, handlers: ( { state } ) => {
			state.count += 1;
		} } );

		// Act
		document.querySelector( 'button' ).click();
		document.querySelector( 'button' ).click();
		const beforeFrame = store.getState().count;
		jest.runAllTimers();

		// Assert
		expect( beforeFrame ).toBe( 0 );
		expect( store.getState().count ).toBe( 2 );
		expect( listener ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should let a handler read its own pending writes', () => {
		// Arrange
		const store = createStore( { a: 1, b: 0 } );
		attach( { store, handlers: ( { state } ) => {
			state.a = 5; state.b = state.a * 2;
		} } );

		// Act
		document.querySelector( 'button' ).click();
		jest.runAllTimers();

		// Assert
		expect( store.getState() ).toEqual( { a: 5, b: 10 } );
	} );

	it( 'should expose the page state next to the scope state', () => {
		// Arrange
		const store = createStore( { local: 1 } );
		const pageStore = createStore( { total: 0 } );
		attach( { store, pageStore, handlers: ( { state, page } ) => {
			page.total += state.local;
		} } );

		// Act
		document.querySelector( 'button' ).click();
		jest.runAllTimers();

		// Assert
		expect( pageStore.getState().total ).toBe( 1 );
	} );

	it( 'should give handlers the event value and an element local position, never the element', () => {
		// Arrange
		document.body.innerHTML = '<input data-interaction-id="btn1" value="hello" />';
		const store = createStore( { text: '', hasElement: true } );
		attach( {
			store,
			event: 'input',
			handlers: ( context ) => {
				context.state.text = context.event.value;
				context.state.hasElement = 'element' in context;
			},
		} );

		// Act
		document.querySelector( 'input' ).dispatchEvent( new Event( 'input', { bubbles: true } ) );
		jest.runAllTimers();

		// Assert
		expect( store.getState() ).toEqual( { text: 'hello', hasElement: false } );
	} );

	it( 'should run init handlers immediately and isolate errors', () => {
		// Arrange
		const store = createStore( { ready: false } );
		const errorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		attach( { store, event: 'init', handlers: () => {
			throw new Error( 'boom' );
		} } );
		attach( { store, event: 'init', handlers: ( { state } ) => {
			state.ready = true;
		} } );

		// Act
		jest.runAllTimers();

		// Assert
		expect( errorSpy ).toHaveBeenCalledTimes( 1 );
		expect( store.getState().ready ).toBe( true );
	} );

	it( 'should emit a bubbling custom event from the element', () => {
		// Arrange
		const received = jest.fn();
		document.body.addEventListener( 'e-state:done', ( event ) => received( event.detail ) );
		attach( { store: createStore( {} ), handlers: ( { emit } ) => emit( 'done', { ok: true } ) } );

		// Act
		document.querySelector( 'button' ).click();

		// Assert
		expect( received ).toHaveBeenCalledWith( { ok: true } );
	} );
} );
