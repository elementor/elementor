import { bindTextNodes, renderTemplate } from 'elementor/modules/data-flow/assets/js/data-flow-bindings';
import { createStore } from 'elementor/modules/data-flow/assets/js/data-flow-store';

describe( 'renderTemplate', () => {
	it( 'should replace state placeholders including nested paths', () => {
		// Arrange
		const state = { name: 'Ada', posts: [ { title: 'Hello' } ] };

		// Act
		const result = renderTemplate( 'Hi {{ state.name }}, latest: {{state.posts.0.title}}', state );

		// Assert
		expect( result ).toBe( 'Hi Ada, latest: Hello' );
	} );

	it( 'should render missing values as empty strings and objects as JSON', () => {
		// Arrange
		const state = { user: { id: 1 } };

		// Act
		const result = renderTemplate( '[{{state.missing}}] {{state.user}}', state );

		// Assert
		expect( result ).toBe( '[] {"id":1}' );
	} );
} );

describe( 'bindTextNodes', () => {
	it( 'should render bound text nodes and re-render on state change', () => {
		// Arrange
		document.body.innerHTML = '<div><p id="counter">Count: {{state.count}}</p><p id="static">Static</p></div>';
		const store = createStore( { count: 0 } );

		// Act
		bindTextNodes( document.body, store );
		const initialText = document.getElementById( 'counter' ).textContent;
		store.setState( 'count', 5 );

		// Assert
		expect( initialText ).toBe( 'Count: 0' );
		expect( document.getElementById( 'counter' ).textContent ).toBe( 'Count: 5' );
		expect( document.getElementById( 'static' ).textContent ).toBe( 'Static' );
	} );

	it( 'should keep server rendered text nodes in sync with the state', () => {
		// Arrange
		document.body.innerHTML = '<p id="a">Count: 0</p><p id="b">Count: 0</p><p id="c">Count: 0</p>';
		const store = createStore( { count: 0, other: 0 } );
		const serverBindings = [
			{ template: 'Count: {{state.count}}', text: 'Count: 0' },
			{ template: 'Count: {{state.other}}', text: 'Count: 0' },
		];

		// Act
		bindTextNodes( document.body, store, serverBindings );
		store.setState( 'count', 7 );

		// Assert
		expect( document.getElementById( 'a' ).textContent ).toBe( 'Count: 7' );
		expect( document.getElementById( 'b' ).textContent ).toBe( 'Count: 0' );
		expect( document.getElementById( 'c' ).textContent ).toBe( 'Count: 0' );
		expect( document.body.innerHTML ).toBe( '<p id="a">Count: 7</p><p id="b">Count: 0</p><p id="c">Count: 0</p>' );
	} );
} );
