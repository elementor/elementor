import { bindManifests, formatBinding } from 'elementor/modules/data-flow/assets/js/data-flow-manifest';
import { createStore } from 'elementor/modules/data-flow/assets/js/data-flow-store';

function bindAttribute( bindings ) {
	return `data-e-bind='${ JSON.stringify( bindings ) }'`;
}

describe( 'formatBinding', () => {
	it.each( [
		[ 1234.5678, { format: 'number' }, '1,234.57' ],
		[ 0.256, { format: 'percent' }, '25.6%' ],
		[ 3, { prefix: '#', suffix: '!' }, '#3!' ],
		[ true, {}, 'true' ],
		[ { a: 1 }, {}, '{"a":1}' ],
		[ null, { prefix: '#' }, '' ],
		[ undefined, { suffix: '!' }, '' ],
	] )( 'should format %p with %p as %p', ( value, options, expected ) => {
		// Act
		const result = formatBinding( value, options );

		// Assert
		expect( result ).toBe( expected );
	} );
} );

const binding = ( key, options = {} ) => ( { key, format: 'raw', prefix: '', suffix: '', ...options } );

describe( 'bindManifests', () => {
	it( 'should render and update the bound text from the store', () => {
		// Arrange
		const targets = [ { kind: 'text', index: 0, parts: [ binding( 'count', { format: 'number', prefix: 'Total: ' } ) ] } ];
		document.body.innerHTML = `<p id="a" ${ bindAttribute( targets ) }>?</p>`;
		const store = createStore( { count: 1000 } );

		// Act
		bindManifests( document.body, store );
		const initial = document.getElementById( 'a' ).textContent;
		store.setState( 'count', 2500 );

		// Assert
		expect( initial ).toBe( 'Total: 1,000' );
		expect( document.getElementById( 'a' ).textContent ).toBe( 'Total: 2,500' );
	} );

	it( 'should only touch the targeted text node and keep sibling markup', () => {
		// Arrange
		const targets = [ { kind: 'text', index: 1, parts: [ 'of ', binding( 'n' ) ] } ];
		document.body.innerHTML = `<p ${ bindAttribute( targets ) }>lead<b>x</b>of ?</p>`;
		const store = createStore( { n: 5 } );

		// Act
		bindManifests( document.body, store );

		// Assert
		expect( document.body.innerHTML ).toContain( 'lead<b>x</b>of 5</p>' );
	} );

	it( 'should update an attribute from state', () => {
		// Arrange
		const targets = [ { kind: 'attr', name: 'href', parts: [ '/p/', binding( 'slug' ) ] } ];
		document.body.innerHTML = `<a id="a" href="/p/one" ${ bindAttribute( targets ) }>Go</a>`;
		const store = createStore( { slug: 'one' } );
		bindManifests( document.body, store );

		// Act
		store.setState( 'slug', 'two' );

		// Assert
		expect( document.getElementById( 'a' ).getAttribute( 'href' ) ).toBe( '/p/two' );
	} );

	it( 'should refuse to write a javascript url into a url attribute', () => {
		// Arrange
		const targets = [ { kind: 'attr', name: 'href', parts: [ binding( 'url' ) ] } ];
		document.body.innerHTML = `<a id="a" href="/safe" ${ bindAttribute( targets ) }>Go</a>`;
		const store = createStore( { url: '/safe' } );
		bindManifests( document.body, store );

		// Act
		store.setState( 'url', 'javascript:alert(1)' );

		// Assert
		expect( document.getElementById( 'a' ).getAttribute( 'href' ) ).toBe( '/safe' );
	} );

	it( 'should toggle boolean attributes by the truthiness of the value', () => {
		// Arrange
		const targets = [ { kind: 'toggle', name: 'hidden', parts: [ binding( 'closed' ) ] } ];
		document.body.innerHTML = `<div id="a" ${ bindAttribute( targets ) }>x</div>`;
		const store = createStore( { closed: false } );
		bindManifests( document.body, store );
		const initial = document.getElementById( 'a' ).hasAttribute( 'hidden' );

		// Act
		store.setState( 'closed', true );

		// Assert
		expect( initial ).toBe( false );
		expect( document.getElementById( 'a' ).hasAttribute( 'hidden' ) ).toBe( true );
	} );

	it( 'should stop updating after unsubscribing', () => {
		// Arrange
		const targets = [ { kind: 'text', index: 0, parts: [ binding( 'n' ) ] } ];
		document.body.innerHTML = `<p id="a" ${ bindAttribute( targets ) }>?</p>`;
		const store = createStore( { n: 1 } );
		const unbind = bindManifests( document.body, store );

		// Act
		unbind();
		store.setState( 'n', 2 );

		// Assert
		expect( document.getElementById( 'a' ).textContent ).toBe( '1' );
	} );
} );
