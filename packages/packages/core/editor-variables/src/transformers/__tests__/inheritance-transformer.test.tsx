import { render, screen } from '@testing-library/react';

import { service } from '../../service';
import { type TVariable } from '../../storage';
import { inheritanceTransformer } from '../inheritance-transformer';

// Mock dependencies
jest.mock( '../../service' );

describe( 'inheritanceTransformer', () => {
	const mockService = service as jest.Mocked< typeof service >;

	it( 'should render transformed color variable', () => {
		// Arrange.
		const variable: TVariable = {
			type: 'global-color-variable',
			label: 'Primary',
			value: '#ff0000',
		};

		mockService.variables.mockReturnValue( { 'e-gv-1234567': variable } );

		// Act.
		const result = inheritanceTransformer( 'e-gv-1234567', { key: '' } );
		render( result as React.ReactElement );

		expect( mockService.variables ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByText( 'var(--Primary, #ff0000)' ) ).toBeInTheDocument();
	} );

	it( 'should render transformed deleted color variable', () => {
		// Arrange.
		const variable: TVariable = {
			type: 'global-color-variable',
			label: 'main',
			value: '#f87544',
			deleted: true,
			deleted_at: '2023-01-01T00:00:00.000Z',
		};

		mockService.variables.mockReturnValue( { 'e-gv-2233': variable } );

		// Act.
		const result = inheritanceTransformer( 'e-gv-2233', { key: '' } );
		render( result as React.ReactElement );

		expect( mockService.variables ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByText( 'var(--e-gv-2233, #f87544)' ) ).toBeInTheDocument();
	} );

	it( 'should render missing variable message', () => {
		mockService.variables.mockReturnValue( {} );

		const result = inheritanceTransformer( 'non-existent-variable', { key: '' } );
		render( result as React.ReactElement );

		expect( screen.getByText( 'Missing variable' ) ).toBeInTheDocument();
	} );
} );
