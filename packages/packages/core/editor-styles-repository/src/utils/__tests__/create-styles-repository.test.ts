import { createMockStyleDefinition, createMockStylesProvider } from 'test-utils';

import { createStylesRepository } from '../create-styles-repository';

const styleDef1 = createMockStyleDefinition( { props: { color: { $$type: 'color', value: '#dddddd' } } } );
const styleDef2 = createMockStyleDefinition( { props: { color: { $$type: 'color', value: '#eeeeee' } } } );

describe( 'createStylesRepository', () => {
	it( 'should get all the style defs from all providers ordered by priority', () => {
		// Arrange
		const repo = createStylesRepository();

		repo.register( createMockStylesProvider( { key: 'mock1', priority: 10 }, [ styleDef1 ] ) );
		repo.register( createMockStylesProvider( { key: 'mock2', priority: 20 }, [ styleDef2 ] ) );

		// Assert
		expect( repo.all() ).toEqual( [ styleDef2, styleDef1 ] );
	} );

	it( 'should subscribe and unsubscribe to all style providers', () => {
		// Arrange
		const repo = createStylesRepository();

		const mockStylesProvider1 = createMockStylesProvider(
			{
				key: 'mock1',
				priority: 10,
			},
			[ styleDef1 ]
		);

		const mockStylesProvider2 = createMockStylesProvider(
			{
				key: 'mock2',
				priority: 20,
			},
			[ styleDef2 ]
		);

		repo.register( mockStylesProvider1 );
		repo.register( mockStylesProvider2 );

		const cb = jest.fn();
		const unsubscribe = repo.subscribe( cb );

		// Force notifying the subscribers.
		const notify1 = () => mockStylesProvider1.actions.update?.( {} as never );
		const notify2 = () => mockStylesProvider2.actions.update?.( {} as never );

		// Act
		notify1();

		// Assert
		expect( cb ).toHaveBeenCalledTimes( 1 );

		// Act
		notify2();

		// Assert
		expect( cb ).toHaveBeenCalledTimes( 2 );

		// Act
		unsubscribe();

		notify1();
		notify2();

		// Assert
		expect( cb ).toHaveBeenCalledTimes( 2 );
	} );
} );
