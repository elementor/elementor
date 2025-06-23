import { renderHook } from '@testing-library/react';

import { useFilteredVariables } from '../hooks/use-prop-variables';
import { service } from '../service';

jest.mock( '../service' );

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
	} );

	it( 'should not include deleted variables in the list', () => {
		const { result: colorResult } = renderHook( () => useFilteredVariables( '', 'global-color-variable' ) );

		expect( colorResult.current.list ).toEqual( [
			{
				key: 'a-02',
				label: 'B',
				value: '#cccccc',
			},
		] );

		const { result: fontResult } = renderHook( () => useFilteredVariables( '', 'global-font-variable' ) );

		expect( fontResult.current.list ).toEqual( [
			{
				key: 'a-04',
				label: 'D',
				value: 'Roboto',
			},
		] );
	} );
} );
