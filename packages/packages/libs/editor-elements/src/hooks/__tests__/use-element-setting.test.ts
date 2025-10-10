import { createMockElement, dispatchCommandAfter } from 'test-utils';
import { act, renderHook } from '@testing-library/react';

import { getContainer } from '../../sync/get-container';
import { useElementSetting } from '../use-element-setting';

jest.mock( '../../sync/get-container' );

describe( 'useWidgetSetting', () => {
	it( 'should return the value of the setting', () => {
		// Arrange.
		const bind = 'title';
		const element = { id: 'element-id' };
		jest.mocked( getContainer ).mockReturnValue( createMockElement( { settings: { [ bind ]: 'Hello, World!' } } ) );

		// Act.
		const result = renderHook( () => useElementSetting( element.id, bind ) ).result.current;

		// Assert.
		expect( result ).toEqual( 'Hello, World!' );
	} );

	it( 'should return null if the setting is not found', () => {
		// Arrange.
		const bind = 'title';
		const element = { id: 'element-id' };
		jest.mocked( getContainer ).mockReturnValue( createMockElement( { settings: {} } ) );

		// Act.
		const result = renderHook( () => useElementSetting( element.id, bind ) ).result.current;

		// Assert.
		expect( result ).toEqual( null );
	} );

	it( 'should update the state value on settings change', () => {
		// Arrange.
		const bind = 'title';
		const element = { id: 'element-id' };
		jest.mocked( getContainer ).mockReturnValue( createMockElement( { settings: { [ bind ]: 'Hello, World!' } } ) );

		// Act.
		const { result } = renderHook( () => useElementSetting( element.id, bind ) );

		// Assert.
		expect( result.current ).toEqual( 'Hello, World!' );

		// Act.
		act( () => {
			jest.mocked( getContainer ).mockReturnValue(
				createMockElement( { settings: { [ bind ]: 'Goodbye, World!' } } )
			);
			dispatchCommandAfter( 'document/elements/set-settings' );
		} );

		// Assert.
		expect( result.current ).toEqual( 'Goodbye, World!' );
	} );

	it( 'should get new snapshot for different elements', () => {
		// Arrange.
		jest.mocked( getContainer ).mockImplementation(
			( id: string ) =>
				( {
					'element-id-1': createMockElement( { settings: { prop: 'value' } } ),
					'element-id-2': createMockElement( { settings: { prop: 'value-2' } } ),
				} )[ id ] || null
		);

		// Act.
		const { result, rerender } = renderHook( ( props ) => useElementSetting( props.id, props.bind ), {
			initialProps: { bind: 'prop', id: 'element-id-1' },
		} );

		// Assert.
		expect( result.current ).toEqual( 'value' );

		// Act.
		rerender( { bind: 'prop', id: 'element-id-2' } );

		// Assert.
		expect( result.current ).toEqual( 'value-2' );
	} );

	it( 'should get new snapshot for different binds', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( { settings: { prop: 'value', 'prop-2': 'value-2' } } )
		);

		// Act.
		const { rerender, result } = renderHook( ( props ) => useElementSetting( props.id, props.bind ), {
			initialProps: { bind: 'prop', id: 'element-id' },
		} );

		expect( result.current ).toEqual( 'value' );

		// Act.
		rerender( { bind: 'prop-2', id: 'element-id' } );

		// Assert.
		expect( result.current ).toEqual( 'value-2' );
	} );
} );
