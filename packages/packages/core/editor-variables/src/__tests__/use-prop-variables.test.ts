import { useBoundProp } from '@elementor/editor-controls';
import { renderHook } from '@testing-library/react';

import { useVariableType } from '../context/variable-type-context';
import { useFilteredVariables } from '../hooks/use-prop-variables';
import { service } from '../service';
import { getVariableType, getVariableTypes } from '../variables-registry/variable-type-registry';

jest.mock( '../service' );

jest.mock( '@elementor/editor-controls', () => ( {
	useBoundProp: jest.fn(),
} ) );

jest.mock( '../variables-registry/variable-type-registry', () => ( {
	getVariableType: jest.fn(),
	getVariableTypes: jest.fn(),
} ) );

jest.mock( '../context/variable-type-context', () => ( {
	useVariableType: jest.fn(),
} ) );

const variablesMockData = {
	'a-01': {
		id: 'a-01',
		type: 'global-color-variable',
		label: 'A',
		value: '#000000',
		deleted: true,
		deleted_at: '2025-06-18T12:00:00.000Z',
	},
	'a-02': {
		id: 'a-02',
		type: 'global-color-variable',
		label: 'B',
		value: '#cccccc',
		deleted: false,
	},
	'a-03': {
		id: 'a-03',
		type: 'global-font-variable',
		label: 'C',
		value: 'Arial',
		deleted: true,
		deleted_at: '2025-06-18T12:00:00.000Z',
	},
	'a-04': {
		id: 'a-04',
		type: 'global-font-variable',
		label: 'D',
		value: 'Roboto',
	},
};

describe( 'useFilteredVariables', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( service.variables ).mockReturnValue( variablesMockData );

		jest.mocked( useBoundProp ).mockReturnValue( {
			propType: { kind: 'plain' },
			path: [ 'test' ],
		} as never );

		jest.mocked( useVariableType ).mockReturnValue( {
			selectionFilter: undefined,
		} as never );

		jest.mocked( getVariableTypes ).mockReturnValue( {
			'global-color-variable': { variableType: 'color' },
			'global-font-variable': { variableType: 'font' },
		} as never );

		jest.mocked( getVariableType ).mockImplementation( ( propKey: string ): any => {
			if ( propKey === 'global-color-variable' ) {
				return { variableType: 'color' };
			}
			if ( propKey === 'global-font-variable' ) {
				return { variableType: 'font' };
			}
			return { variableType: propKey };
		} );
	} );

	it( 'should not include deleted variables in the list', () => {
		const { result: colorResult } = renderHook( () => useFilteredVariables( '', 'global-color-variable' ) );

		expect( colorResult.current.list ).toEqual( [
			{
				key: 'a-02',
				label: 'B',
				value: '#cccccc',
				order: undefined,
			},
		] );

		const { result: fontResult } = renderHook( () => useFilteredVariables( '', 'global-font-variable' ) );

		expect( fontResult.current.list ).toEqual( [
			{
				key: 'a-04',
				label: 'D',
				value: 'Roboto',
				order: undefined,
			},
		] );
	} );
} );
