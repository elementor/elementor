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

	it( 'should wire state, bindings and handlers end to end', () => {
		// Arrange
		renderPage( {
			state: { count: 0, site_name: 'My Site' },
			handlers: [ {
				elementId: 'btn1',
				handlers: [ { event: 'click', code: 'setState( "count", ( c ) => c + 1 );' } ],
			} ],
		} );

		// Act
		initDataFlow( document );
		document.querySelector( 'button' ).click();

		// Assert
		expect( document.getElementById( 'output' ).textContent ).toBe( 'Clicked 1 times on My Site' );
	} );
} );
