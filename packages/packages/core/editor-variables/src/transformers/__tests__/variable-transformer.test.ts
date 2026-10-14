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

	it( 'returns var(--name, value) for a size variable on non-grid size CSS properties', () => {
		setupVariable( 'e-gv-1', {
			type: 'global-size-variable',
			label: 'spacing',
			value: '10px',
		} );

		expect( variableTransformer( 'e-gv-1', { key: 'gap' } ) ).toBe( 'var(--spacing, 10px)' );
		expect( variableTransformer( 'e-gv-1', { key: 'padding' } ) ).toBe( 'var(--spacing, 10px)' );
		expect( variableTransformer( 'e-gv-1', { key: 'font-size' } ) ).toBe( 'var(--spacing, 10px)' );
	} );

	it( 'returns var(--name, value) for a color variable on color CSS properties', () => {
		setupVariable( 'e-gv-color', {
			type: 'global-color-variable',
			label: 'primary',
			value: '#ff0000',
		} );

		expect( variableTransformer( 'e-gv-color', { key: 'color' } ) ).toBe( 'var(--primary, #ff0000)' );
		expect( variableTransformer( 'e-gv-color', { key: 'background-color' } ) ).toBe( 'var(--primary, #ff0000)' );
		expect( variableTransformer( 'e-gv-color', { key: 'border-color' } ) ).toBe( 'var(--primary, #ff0000)' );
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

	it( 'returns null when the variable does not exist', () => {
		mockService.variables.mockReturnValue( {} );
		mockService.findVariableByLabel.mockReturnValue( null );

		expect( variableTransformer( 'missing', { key: 'gap' } ) ).toBeNull();
	} );
} );
