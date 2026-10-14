import { DATA_SCRIPT_ID, initDataFlow } from 'elementor/modules/data-flow/assets/js/data-flow-runtime';
import { createSnippetRegistry } from 'elementor/modules/data-flow/assets/js/data-flow-snippet-registry';

const createRegistry = () => {
	const registry = createSnippetRegistry();

	registry.registerSnippet( 'increment', { click: ( { state } ) => {
		state.count += 1;
	} } );
	registry.registerSnippet( 'rename', { click: ( { state } ) => {
		state.label = 'Sum';
	} } );

	return registry;
};

const reference = ( elementId, snippet = 'increment' ) => ( { elementId, snippets: [ { snippet, event: 'click' } ] } );

beforeEach( () => {
	jest.useFakeTimers();
	jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation( ( callback ) => setTimeout( callback, 0 ) );
} );

afterEach( () => {
	jest.useRealTimers();
	jest.restoreAllMocks();
} );

function bind( key, options = {} ) {
	const binding = { key, format: 'raw', prefix: '', suffix: '', ...options };

	return `data-e-bind='${ JSON.stringify( [ { kind: 'text', index: 0, parts: [ binding ] } ] ) }'`;
}

function renderPage( data ) {
	document.body.innerHTML = `
		<p id="output" ${ bind( 'count', { prefix: 'Clicked ', suffix: ' times' } ) }>Clicked 0 times</p>
		<button data-interaction-id="btn1">Increment</button>
		<script type="application/json" id="${ DATA_SCRIPT_ID }">${ JSON.stringify( data ) }</script>
	`;
}

describe( 'initDataFlow', () => {
	it( 'should do nothing when the data script is missing', () => {
		// Arrange
		document.body.innerHTML = `<p ${ bind( 'count' ) }>0</p>`;

		// Act
		const store = initDataFlow( document, createRegistry() );

		// Assert
		expect( store ).toBeNull();
	} );

	it( 'should wire state, bindings and snippets end to end', () => {
		// Arrange
		renderPage( {
			state: { count: 0, site_name: 'My Site' },
			snippets: [ reference( 'btn1' ) ],
		} );

		// Act
		initDataFlow( document, createRegistry() );
		document.querySelector( 'button' ).click();
		jest.runAllTimers();

		// Assert
		expect( document.getElementById( 'output' ).textContent ).toBe( 'Clicked 1 times' );
	} );

	it( 'should give each scope its own state resolved by DOM ancestry', () => {
		// Arrange
		const counter = ( scopeId ) => `
			<div data-e-scope="${ scopeId }">
				<p class="value" ${ bind( 'count', { prefix: 'Count: ' } ) }>Count: ?</p>
				<button data-interaction-id="increment">+</button>
			</div>
		`;
		const data = {
			state: { count: 100, site: 'My Site' },
			scopes: [
				{ id: 'first', parentId: null, state: { count: 0 } },
				{ id: 'second', parentId: null, state: { count: 10 } },
			],
			snippets: [ reference( 'increment' ) ],
		};
		document.body.innerHTML = `
			<p id="page" ${ bind( 'count', { prefix: 'Page: ' } ) }>Page: ?</p>
			${ counter( 'first' ) }
			${ counter( 'second' ) }
			<script type="application/json" id="${ DATA_SCRIPT_ID }">${ JSON.stringify( data ) }</script>
		`;
		const [ firstButton, secondButton ] = document.querySelectorAll( 'button' );

		// Act
		initDataFlow( document, createRegistry() );
		firstButton.click();
		secondButton.click();
		secondButton.click();
		jest.runAllTimers();

		// Assert
		const values = [ ...document.querySelectorAll( '.value' ) ].map( ( node ) => node.textContent );
		expect( values ).toEqual( [ 'Count: 1', 'Count: 12' ] );
		expect( document.getElementById( 'page' ).textContent ).toBe( 'Page: 100' );
	} );

	it( 'should chain a nested scope to its parent scope', () => {
		// Arrange
		const data = {
			state: {},
			scopes: [
				{ id: 'outer', parentId: null, state: { label: 'Total' } },
				{ id: 'inner', parentId: 'outer', state: { count: 3 } },
			],
			snippets: [ reference( 'rename', 'rename' ) ],
		};
		document.body.innerHTML = `
			<div data-e-scope="outer">
				<div data-e-scope="inner">
					<p id="inner" ${ bind( 'label', { suffix: ': 3' } ) }>?</p>
					<button data-interaction-id="rename">Rename</button>
				</div>
				<p id="outer" ${ bind( 'label' ) }>?</p>
			</div>
			<script type="application/json" id="${ DATA_SCRIPT_ID }">${ JSON.stringify( data ) }</script>
		`;

		// Act
		initDataFlow( document, createRegistry() );
		document.querySelector( 'button' ).click();
		jest.runAllTimers();

		// Assert
		expect( document.getElementById( 'inner' ).textContent ).toBe( 'Sum: 3' );
		expect( document.getElementById( 'outer' ).textContent ).toBe( 'Sum' );
	} );
} );
