import { service } from '../../service';
import { type TVariable } from '../../storage';
import { variableTransformer } from '../variable-transformer';

jest.mock( '../../service' );

describe( 'variableTransformer', () => {
	const mockService = service as jest.Mocked< typeof service >;

	const setupVariable = ( id: string, variable: TVariable ) => {
		mockService.variables.mockReturnValue( { [ id ]: variable } );
		mockService.findIdByLabel.mockReturnValue( id );
		mockService.findVariableByLabel.mockReturnValue( null );
	};

	it( 'returns var(--name, value) for non-grid CSS properties regardless of stored value', () => {
		setupVariable( 'e-gv-1', {
			type: 'global-size-variable',
			label: 'spacing',
			value: '10px',
		} );

		expect( variableTransformer( 'e-gv-1', { key: 'gap' } ) ).toBe( 'var(--spacing, 10px)' );
		expect( variableTransformer( 'e-gv-1', { key: 'padding' } ) ).toBe( 'var(--spacing, 10px)' );
		expect( variableTransformer( 'e-gv-1', { key: 'color' } ) ).toBe( 'var(--spacing, 10px)' );
	} );

	it( 'returns repeat(N, 1fr) for grid-template-columns when stored value is "Nfr"', () => {
		setupVariable( 'e-gv-2', {
			type: 'global-size-variable',
			label: '2-column',
			value: '2fr',
		} );

		expect( variableTransformer( 'e-gv-2', { key: 'grid-template-columns' } ) ).toBe( 'repeat(2, 1fr)' );
	} );

	it( 'returns repeat(N, 1fr) for grid-template-columns when stored value is unitless integer', () => {
		setupVariable( 'e-gv-3', {
			type: 'global-size-variable',
			label: 'cols',
			value: '3',
		} );

		expect( variableTransformer( 'e-gv-3', { key: 'grid-template-columns' } ) ).toBe( 'repeat(3, 1fr)' );
	} );

	it( 'returns repeat(N, 1fr) for grid-template-rows', () => {
		setupVariable( 'e-gv-4', {
			type: 'global-size-variable',
			label: 'rows',
			value: '5fr',
		} );

		expect( variableTransformer( 'e-gv-4', { key: 'grid-template-rows' } ) ).toBe( 'repeat(5, 1fr)' );
	} );

	it( 'falls back to var() for grid-template-columns when stored value has a non-integer fr', () => {
		setupVariable( 'e-gv-5', {
			type: 'global-size-variable',
			label: 'decimal',
			value: '1.5fr',
		} );

		expect( variableTransformer( 'e-gv-5', { key: 'grid-template-columns' } ) ).toBe( 'var(--decimal, 1.5fr)' );
	} );

	it( 'falls back to var() for grid-template-columns when stored value is a length', () => {
		setupVariable( 'e-gv-6', {
			type: 'global-size-variable',
			label: 'px-value',
			value: '10px',
		} );

		expect( variableTransformer( 'e-gv-6', { key: 'grid-template-columns' } ) ).toBe( 'var(--px-value, 10px)' );
	} );

	it( 'rejects "0fr" — the repeat count must be at least 1', () => {
		setupVariable( 'e-gv-7', {
			type: 'global-size-variable',
			label: 'zero',
			value: '0fr',
		} );

		expect( variableTransformer( 'e-gv-7', { key: 'grid-template-columns' } ) ).toBe( 'var(--zero, 0fr)' );
	} );

	it( 'rejects multi-token strings (e.g. "1fr 2fr")', () => {
		setupVariable( 'e-gv-8', {
			type: 'global-size-variable',
			label: 'multi',
			value: '1fr 2fr',
		} );

		expect( variableTransformer( 'e-gv-8', { key: 'grid-template-columns' } ) ).toBe( 'var(--multi, 1fr 2fr)' );
	} );

	it( 'returns null when the variable does not exist', () => {
		mockService.variables.mockReturnValue( {} );
		mockService.findVariableByLabel.mockReturnValue( null );

		expect( variableTransformer( 'missing', { key: 'gap' } ) ).toBeNull();
	} );
} );
