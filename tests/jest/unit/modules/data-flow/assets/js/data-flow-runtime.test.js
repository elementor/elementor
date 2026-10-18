import { createActionRegistry } from 'elementor/modules/data-flow/assets/js/actions/action-registry';
import { DATA_SCRIPT_ID, initDataFlow } from 'elementor/modules/data-flow/assets/js/data-flow-runtime';

function renderPage( data ) {
	document.body.innerHTML = `
		<p id="output">Clicked {{state.count}} times on {{state.site_name}}</p>
		<button data-interaction-id="btn1">Increment</button>
		<script type="application/json" id="${ DATA_SCRIPT_ID }">${ JSON.stringify( data ) }</script>
	`;
}

describe( 'initDataFlow', () => {
	it( 'should do nothing when the data script is missing', () => {
		// Arrange
		document.body.innerHTML = '<p>{{state.count}}</p>';

		// Act
		const store = initDataFlow( document );

		// Assert
		expect( store ).toBeNull();
	} );

	it( 'should wire state, bindings and actions end to end', () => {
		// Arrange
		renderPage( {
			state: { count: 0, site_name: 'My Site' },
			actions: [ {
				elementId: 'btn1',
				actions: [ { on: 'click', do: 'state/increment', args: { key: 'count' } } ],
			} ],
		} );

		// Act
		initDataFlow( document );
		document.querySelector( 'button' ).click();

		// Assert
		expect( document.getElementById( 'output' ).textContent ).toBe( 'Clicked 1 times on My Site' );
	} );

	it( 'should give each scope its own state resolved by DOM ancestry', () => {
		// Arrange
		const counter = ( scopeId ) => `
			<div data-e-scope="${ scopeId }">
				<p class="value">Count: {{state.count}} of {{state.site}}</p>
				<button data-interaction-id="increment">+</button>
			</div>
		`;
		const data = {
			state: { count: 100, site: 'My Site' },
			scopes: [
				{ id: 'first', parentId: null, state: { count: 0 } },
				{ id: 'second', parentId: null, state: { count: 10 } },
			],
			actions: [ {
				elementId: 'increment',
				actions: [ { on: 'click', do: 'state/increment', args: { key: 'count' } } ],
			} ],
		};
		document.body.innerHTML = `
			<p id="page">Page: {{state.count}}</p>
			${ counter( 'first' ) }
			${ counter( 'second' ) }
			<script type="application/json" id="${ DATA_SCRIPT_ID }">${ JSON.stringify( data ) }</script>
		`;
		const [ firstButton, secondButton ] = document.querySelectorAll( 'button' );

		// Act
		initDataFlow( document );
		firstButton.click();
		secondButton.click();
		secondButton.click();

		// Assert
		const values = [ ...document.querySelectorAll( '.value' ) ].map( ( node ) => node.textContent );
		expect( values ).toEqual( [ 'Count: 1 of My Site', 'Count: 12 of My Site' ] );
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
			actions: [ {
				elementId: 'rename',
				actions: [ { on: 'click', do: 'state/set', args: { key: 'label', value: 'Sum' } } ],
			} ],
		};
		document.body.innerHTML = `
			<div data-e-scope="outer">
				<div data-e-scope="inner">
					<p id="inner">{{state.label}}: {{state.count}}</p>
					<button data-interaction-id="rename">Rename</button>
				</div>
				<p id="outer">{{state.label}}</p>
			</div>
			<script type="application/json" id="${ DATA_SCRIPT_ID }">${ JSON.stringify( data ) }</script>
		`;

		// Act
		initDataFlow( document );
		document.querySelector( 'button' ).click();

		// Assert
		expect( document.getElementById( 'inner' ).textContent ).toBe( 'Sum: 3' );
		expect( document.getElementById( 'outer' ).textContent ).toBe( 'Sum' );
	} );

	it( 'should mirror page and scope state as CSS variables', () => {
		// Arrange
		const data = {
			state: { theme: 'dusk' },
			scopes: [ { id: 'card', parentId: null, state: { tilt: 0 } } ],
			actions: [ {
				elementId: 'tilt',
				actions: [ { on: 'click', do: 'state/set', args: { key: 'tilt', value: 12.5 } } ],
			} ],
		};
		document.body.innerHTML = `
			<div data-e-scope="card"><button data-interaction-id="tilt">Tilt</button></div>
			<script type="application/json" id="${ DATA_SCRIPT_ID }">${ JSON.stringify( data ) }</script>
		`;

		// Act
		initDataFlow( document );
		document.querySelector( 'button' ).click();

		// Assert
		expect( document.documentElement.style.getPropertyValue( '--e-state-theme' ) ).toBe( 'dusk' );
		expect( document.querySelector( '[data-e-scope]' ).style.getPropertyValue( '--e-state-tilt' ) ).toBe( '12.5' );
	} );

	it( 'should run custom actions registered by name', () => {
		// Arrange
		const registry = createActionRegistry();
		const run = jest.fn();
		registry.register( 'acme/greet', run );
		renderPage( {
			state: { count: 0 },
			actions: [ { elementId: 'btn1', actions: [ { on: 'click', do: 'acme/greet', args: { name: 'Ada' } } ] } ],
		} );

		// Act
		initDataFlow( document, { registry } );
		document.querySelector( 'button' ).click();

		// Assert
		expect( run ).toHaveBeenCalledWith( expect.objectContaining( { args: { name: 'Ada' } } ) );
	} );
} );
