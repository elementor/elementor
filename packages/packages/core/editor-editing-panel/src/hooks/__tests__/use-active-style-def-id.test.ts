import { act } from 'react';
import { getElementStyles, useElementSetting } from '@elementor/editor-elements';
import { renderHook } from '@testing-library/react';

import { useElement } from '../../contexts/element-context';
import { useActiveStyleDefId } from '../use-active-style-def-id';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../contexts/element-context' );

describe( 'useActiveStyleDefId', () => {
	beforeEach( () => {
		jest.mocked( useElement ).mockReturnValue( {
			element: {
				id: 'test-element-id',
			},
		} as unknown as ReturnType< typeof useElement > );
	} );

	it( 'should return null when no classes are applied', () => {
		// Arrange
		jest.mocked( useElementSetting ).mockReturnValue( {
			value: [],
		} );

		jest.mocked( getElementStyles ).mockReturnValue( {} );

		// Act
		const { result } = renderHook( () => useActiveStyleDefId( 'style-1' ) );

		// Assert
		expect( result.current[ 0 ] ).toBeNull();
	} );

	it( 'should return active style id when it exists and is applied', () => {
		// Arrange
		const activeStyleId = 'style-1';

		jest.mocked( useElementSetting ).mockReturnValue( {
			value: [ activeStyleId, 'style-2' ],
		} );

		jest.mocked( getElementStyles ).mockReturnValue( {
			[ activeStyleId ]: {
				id: activeStyleId,
				label: 'Style 1',
				type: 'class',
				variants: [],
			},
		} );

		// Act
		const { result } = renderHook( () => useActiveStyleDefId( 'test-classes' ) );

		act( () => {
			result.current[ 1 ]( activeStyleId );
		} );

		// Assert
		expect( result.current[ 0 ] ).toBe( activeStyleId );
	} );

	it( 'should fall back to first element style when active style is not applied', () => {
		// Arrange
		const nonAppliedStyleId = 'non-applied-style';
		const fallbackStyleId = 'fallback-style-id';

		jest.mocked( useElementSetting ).mockReturnValue( {
			value: [ fallbackStyleId ],
		} );

		jest.mocked( getElementStyles ).mockReturnValue( {
			[ fallbackStyleId ]: {
				id: fallbackStyleId,
				label: 'Fallback Style',
				type: 'class',
				variants: [],
			},
		} );

		// Act
		const { result } = renderHook( () => useActiveStyleDefId( 'test-classes' ) );

		act( () => {
			result.current[ 1 ]( nonAppliedStyleId );
		} );

		// Assert
		expect( result.current[ 0 ] ).toBe( fallbackStyleId );
	} );

	it( 'should handle multiple style definitions and find the first one in classes array', () => {
		// Arrange
		const firstStyleId = 'first-style-id';
		const secondStyleId = 'second-style-id';

		jest.mocked( useElementSetting ).mockReturnValue( {
			value: [ secondStyleId, firstStyleId ],
		} );

		jest.mocked( getElementStyles ).mockReturnValue( {
			[ firstStyleId ]: {
				id: firstStyleId,
				label: 'First Style',
				type: 'class',
				variants: [],
			},
			[ secondStyleId ]: {
				id: secondStyleId,
				label: 'Second Style',
				type: 'class',
				variants: [],
			},
		} );

		// Act
		const { result } = renderHook( () => useActiveStyleDefId( 'test-classes' ) );

		// Assert
		expect( result.current[ 0 ] ).toBe( firstStyleId );
	} );

	it( 'should handle case when useElementSetting returns null', () => {
		// Arrange
		jest.mocked( useElementSetting ).mockReturnValue( null );

		jest.mocked( getElementStyles ).mockReturnValue( {
			'test-style-id': {
				id: 'test-style-id',
				label: 'Test Style',
				type: 'class',
				variants: [],
			},
		} );

		// Act
		const { result } = renderHook( () => useActiveStyleDefId( 'test-classes' ) );

		// Assert
		expect( result.current[ 0 ] ).toBeNull();
	} );
} );
