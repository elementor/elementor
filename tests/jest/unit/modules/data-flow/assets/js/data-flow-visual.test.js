import { createScopedStore, createStore } from 'elementor/modules/data-flow/assets/js/data-flow-store';
import { bindVisualState } from 'elementor/modules/data-flow/assets/js/data-flow-visual';

describe( 'bindVisualState', () => {
	it( 'should mirror scope state into CSS variables and boolean state classes, and keep them updated', () => {
		// Arrange
		document.body.innerHTML = '<div data-e-scope="dial"></div>';
		const pageStore = createStore( {} );
		const scopes = [
			{
				id: 'dial',
				parentId: null,
				state: { angle: 10, open: false, gap: { $$type: 'size', value: { size: 4, unit: 'px' } }, tint: { $$type: 'color', value: '#fff' } },
				schema: { gap: { prop_type: 'size' }, tint: { prop_type: 'color' } },
			},
		];
		const scopeStores = new Map( [ [ 'dial', createScopedStore( scopes[ 0 ].state, pageStore ) ] ] );
		const element = document.querySelector( '[data-e-scope="dial"]' );

		// Act
		bindVisualState( { doc: document, pageStore, scopeStores, scopes } );
		const initial = {
			angle: element.style.getPropertyValue( '--e-state-angle' ),
			gap: element.style.getPropertyValue( '--e-state-gap' ),
			tint: element.style.getPropertyValue( '--e-state-tint' ),
			open: element.classList.contains( 'e--state-open' ),
		};
		scopeStores.get( 'dial' ).setState( { angle: 90, open: true } );

		// Assert
		expect( initial ).toEqual( { angle: '10', gap: '4px', tint: '#fff', open: false } );
		expect( element.style.getPropertyValue( '--e-state-angle' ) ).toBe( '90' );
		expect( element.classList.contains( 'e--state-open' ) ).toBe( true );
	} );

	it( 'should apply page state on the body', () => {
		// Arrange
		document.body.innerHTML = '';
		const pageStore = createStore( { total: 5, ready: true } );

		// Act
		bindVisualState( { doc: document, pageStore, scopeStores: new Map(), scopes: [] } );

		// Assert
		expect( document.body.style.getPropertyValue( '--e-state-total' ) ).toBe( '5' );
		expect( document.body.classList.contains( 'e--state-ready' ) ).toBe( true );
	} );

	it( 'should not rewrite variables the server already rendered', () => {
		// Arrange
		document.body.innerHTML = '<div data-e-scope="dial" style="--e-state-angle:10"></div>';
		const pageStore = createStore( {} );
		const scopes = [ { id: 'dial', parentId: null, state: { angle: 10 }, schema: {} } ];
		const scopeStores = new Map( [ [ 'dial', createScopedStore( scopes[ 0 ].state, pageStore ) ] ] );
		const element = document.querySelector( '[data-e-scope="dial"]' );
		const setProperty = jest.spyOn( element.style, 'setProperty' );

		// Act
		bindVisualState( { doc: document, pageStore, scopeStores, scopes } );

		// Assert
		expect( setProperty ).not.toHaveBeenCalled();
	} );

	it( 'should bind every element that carries the same scope id', () => {
		// Arrange
		document.body.innerHTML = '<div data-e-scope="s"></div><div data-e-scope="s"></div>';
		const pageStore = createStore( {} );
		const scopes = [ { id: 's', parentId: null, state: { open: true }, schema: {} } ];
		const scopeStores = new Map( [ [ 's', createScopedStore( scopes[ 0 ].state, pageStore ) ] ] );

		// Act
		bindVisualState( { doc: document, pageStore, scopeStores, scopes } );

		// Assert
		expect( document.querySelectorAll( '.e--state-open' ) ).toHaveLength( 2 );
	} );

	it( 'should skip values that are not safe to put in a css variable', () => {
		// Arrange
		document.body.innerHTML = '';
		const pageStore = createStore( { label: 'a;b{c}', ok: 'dark-mode' } );

		// Act
		bindVisualState( { doc: document, pageStore, scopeStores: new Map(), scopes: [], pageSchema: { ok: { prop_type: 'enum' } } } );

		// Assert
		expect( document.body.style.getPropertyValue( '--e-state-label' ) ).toBe( '' );
		expect( document.body.style.getPropertyValue( '--e-state-ok' ) ).toBe( 'dark-mode' );
	} );
} );
