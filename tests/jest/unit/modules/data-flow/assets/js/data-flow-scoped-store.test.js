import { createScopedStore, createStore } from 'elementor/modules/data-flow/assets/js/data-flow-store';

describe( 'createScopedStore', () => {
	it( 'should read a merged view where the nearest scope wins', () => {
		// Arrange
		const page = createStore( { count: 100, site: 'My Site' } );
		const section = createScopedStore( { count: 1, step: 2 }, page );
		const card = createScopedStore( { count: 5 }, section );

		// Act
		const state = card.getState();

		// Assert
		expect( state ).toEqual( { count: 5, site: 'My Site', step: 2 } );
	} );

	it( 'should write to the nearest scope that defines the key', () => {
		// Arrange
		const page = createStore( { site: 'My Site' } );
		const section = createScopedStore( { step: 2 }, page );
		const card = createScopedStore( { count: 0 }, section );

		// Act
		card.setState( 'count', ( count ) => count + 1 );
		card.setState( 'step', ( step ) => step * 10 );
		card.setState( 'site', 'Other' );

		// Assert
		expect( card.getState() ).toEqual( { count: 1, site: 'Other', step: 20 } );
		expect( section.getState() ).toEqual( { site: 'Other', step: 20 } );
		expect( page.getState() ).toEqual( { site: 'Other' } );
	} );

	it( 'should write unknown keys to the nearest scope', () => {
		// Arrange
		const page = createStore( {} );
		const card = createScopedStore( {}, page );

		// Act
		card.setState( { fresh: true } );

		// Assert
		expect( card.getState() ).toEqual( { fresh: true } );
		expect( page.getState() ).toEqual( {} );
	} );

	it( 'should notify subscribers through the scope that provides the key', () => {
		// Arrange
		const page = createStore( { count: 100, site: 'My Site' } );
		const card = createScopedStore( { count: 0 }, page );
		const countListener = jest.fn();
		const siteListener = jest.fn();
		const anyListener = jest.fn();
		card.subscribe( 'count', countListener );
		card.subscribe( 'site', siteListener );
		card.subscribe( '*', anyListener );

		// Act
		page.setState( 'count', 200 );
		page.setState( 'site', 'Other' );
		card.setState( 'count', 1 );

		// Assert
		expect( countListener ).toHaveBeenCalledTimes( 1 );
		expect( countListener ).toHaveBeenCalledWith( 1, 'count', { count: 1, site: 'Other' } );
		expect( siteListener ).toHaveBeenCalledWith( 'Other', 'site', { count: 0, site: 'Other' } );
		expect( anyListener ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should keep sibling scopes independent', () => {
		// Arrange
		const page = createStore( {} );
		const first = createScopedStore( { count: 0 }, page );
		const second = createScopedStore( { count: 10 }, page );

		// Act
		first.setState( 'count', 1 );

		// Assert
		expect( first.getState().count ).toBe( 1 );
		expect( second.getState().count ).toBe( 10 );
	} );
} );
