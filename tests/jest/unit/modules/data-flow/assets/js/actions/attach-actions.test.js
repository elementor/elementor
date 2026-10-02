import { createActionRegistry } from 'elementor/modules/data-flow/assets/js/actions/action-registry';
import { attachActions } from 'elementor/modules/data-flow/assets/js/actions/attach-actions';
import { createFrameLoop } from 'elementor/modules/data-flow/assets/js/actions/frame-loop';
import { createStore } from 'elementor/modules/data-flow/assets/js/data-flow-store';

const FRAME_MS = 1000 / 60;

function createManualLoop() {
	const queue = [];
	let time = 0;
	const loop = createFrameLoop( ( callback ) => queue.push( callback ) );

	loop.flush = ( maxFrames = 1000 ) => {
		for ( let i = 0; i < maxFrames && queue.length; i++ ) {
			time += FRAME_MS;
			queue.shift()( time );
		}
	};

	return loop;
}

function setup( actions, state = {}, { reducedMotion = false } = {} ) {
	document.body.innerHTML = `
		<div data-e-scope="scope">
			<button data-interaction-id="el">Button</button>
			<p class="panel" data-panel="paper">Paper</p>
			<p class="panel" data-panel="glass">Glass</p>
		</div>
	`;

	const store = createStore( state );
	const loop = createManualLoop();
	const element = document.querySelector( 'button' );

	attachActions( [ { elementId: 'el', actions } ], store, document, {
		registry: createActionRegistry(),
		loop,
		win: window,
		doc: document,
		reducedMotion,
	} );

	return { store, loop, element };
}

describe( 'attachActions — events', () => {
	it( 'should run built-in state actions on DOM events', () => {
		// Arrange
		const { store, element } = setup( [
			{ on: 'click', do: 'state/increment', args: { key: 'count', by: 2, max: 3 } },
		], { count: 0 } );

		// Act
		element.click();
		element.click();

		// Assert
		expect( store.getState().count ).toBe( 3 );
	} );

	it( 'should cycle and toggle state', () => {
		// Arrange
		const { store, element } = setup( [
			{ on: 'click', do: 'state/cycle', args: { key: 'palette', values: [ 'mint', 'dusk', 'velvet' ] } },
			{ on: 'click', do: 'state/toggle', args: { key: 'open' } },
		], { palette: 'velvet', open: false } );

		// Act
		element.click();

		// Assert
		expect( store.getState() ).toEqual( { palette: 'mint', open: true } );
	} );

	it( 'should pick a different random value', () => {
		// Arrange
		const { store, element } = setup( [
			{ on: 'click', do: 'state/random', args: { key: 'palette', values: [ 'mint', 'dusk' ] } },
		], { palette: 'mint' } );

		// Act
		element.click();

		// Assert
		expect( store.getState().palette ).toBe( 'dusk' );
	} );

	it( 'should react to state changes, scoped to the closest scope', () => {
		// Arrange
		const { store } = setup( [
			{ on: 'state', key: 'tab', do: 'element/visible', args: { selector: '[data-panel="paper"]', equals: 'paper' } },
			{ on: 'state', key: 'tab', do: 'element/visible', args: { selector: '[data-panel="glass"]', equals: 'glass' } },
		], { tab: 'paper' } );
		const [ paper, glass ] = document.querySelectorAll( '.panel' );

		// Assert
		expect( [ paper.hidden, glass.hidden ] ).toEqual( [ false, true ] );

		// Act
		store.setState( 'tab', 'glass' );

		// Assert
		expect( [ paper.hidden, glass.hidden ] ).toEqual( [ true, false ] );
	} );

	it( 'should only set data and aria attributes', () => {
		// Arrange
		const { element } = setup( [
			{ on: 'load', do: 'attribute/set', args: { name: 'aria-pressed', value: 'true' } },
			{ on: 'load', do: 'attribute/set', args: { name: 'onclick', value: 'alert(1)' } },
		] );

		// Assert
		expect( element.getAttribute( 'aria-pressed' ) ).toBe( 'true' );
		expect( element.hasAttribute( 'onclick' ) ).toBe( false );
	} );

	it( 'should isolate failing and unknown actions', () => {
		// Arrange
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const { store, element } = setup( [
			{ on: 'click', do: 'acme/missing', args: {} },
			{ on: 'click', do: 'state/increment', args: { key: 'count' } },
		], { count: 0 } );

		// Act
		element.click();

		// Assert
		expect( store.getState().count ).toBe( 1 );
		expect( consoleError ).toHaveBeenCalled();
		consoleError.mockRestore();
	} );
} );

describe( 'attachActions — inputs', () => {
	it( 'should write a mapped local pointer position into state', () => {
		// Arrange
		const { store, loop, element } = setup( [ {
			input: 'pointer',
			space: 'local',
			write: { tiltY: { from: 'x', map: [ -1, 1, -10, 10 ] } },
		} ], { tiltY: 0 } );
		element.getBoundingClientRect = () => ( { left: 0, top: 0, width: 200, height: 100 } );

		// Act
		element.dispatchEvent( new MouseEvent( 'pointermove', { clientX: 150, clientY: 50 } ) );
		loop.flush();

		// Assert
		expect( store.getState().tiltY ).toBe( 5 );

		// Act
		element.dispatchEvent( new MouseEvent( 'pointerleave' ) );
		loop.flush();

		// Assert
		expect( store.getState().tiltY ).toBe( 0 );
	} );

	it( 'should keep spinning after a drag with inertia and settle', () => {
		// Arrange
		const { store, loop, element } = setup( [ {
			input: 'drag',
			inertia: 0.9,
			write: { offset: { from: 'x', round: 1 } },
		} ], { offset: 0 } );
		element.getBoundingClientRect = () => ( { left: 0, top: 0, width: 100, height: 100 } );

		// Act
		element.dispatchEvent( new MouseEvent( 'pointerdown', { clientX: 10, clientY: 10 } ) );
		loop.flush( 1 );
		element.dispatchEvent( new MouseEvent( 'pointermove', { clientX: 30, clientY: 10 } ) );
		loop.flush( 1 );
		const releasedAt = store.getState().offset;
		element.dispatchEvent( new MouseEvent( 'pointerup' ) );
		loop.flush();

		// Assert
		expect( releasedAt ).toBe( 20 );
		expect( store.getState().offset ).toBeGreaterThan( releasedAt );
	} );

	it( 'should skip inputs when the user prefers reduced motion unless the input opts in', () => {
		// Arrange
		const { store, loop } = setup( [
			{ input: 'time', write: { skipped: { from: 't' } } },
			{ input: 'time', reducedMotion: 'run', write: { kept: { from: 't' } } },
		], { skipped: 0, kept: 0 }, { reducedMotion: true } );

		// Act
		loop.flush( 3 );

		// Assert
		expect( store.getState().skipped ).toBe( 0 );
		expect( store.getState().kept ).toBeGreaterThan( 0 );
	} );
} );
