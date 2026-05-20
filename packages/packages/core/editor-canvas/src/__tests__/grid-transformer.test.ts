import { getMultiPropsValue, isMultiProps } from '../renderers/multi-props';
import { gridTransformer } from '../transformers/styles/grid-transformer';

describe( 'gridTransformer', () => {
	it( 'should expand counts to repeat() track lists', () => {
		const result = gridTransformer(
			{ columnsCount: 4, rowsCount: 3, autoFlow: 'row' },
			{ key: 'grid' }
		);

		expect( isMultiProps( result ) ).toBe( true );
		expect( getMultiPropsValue( result ) ).toEqual( {
			'grid-template-columns': 'repeat(4, 1fr)',
			'grid-template-rows': 'repeat(3, 1fr)',
			'grid-auto-flow': 'row',
		} );
	} );

	it( 'should prefer custom templates over counts', () => {
		const result = gridTransformer(
			{
				columnsCount: 1,
				rowsCount: 1,
				columnsTemplate: '1fr 2fr',
				rowsTemplate: 'minmax(40px, auto)',
				autoFlow: 'column dense',
			},
			{ key: 'grid' }
		);

		expect( getMultiPropsValue( result ) ).toMatchObject( {
			'grid-template-columns': '1fr 2fr',
			'grid-template-rows': 'minmax(40px, auto)',
			'grid-auto-flow': 'column dense',
		} );
	} );

	it( 'should include gaps when set', () => {
		const result = gridTransformer(
			{
				columnsCount: 2,
				rowsCount: 2,
				columnGap: '12px',
				rowGap: '8px',
			},
			{ key: 'grid' }
		);

		expect( getMultiPropsValue( result ) ).toMatchObject( {
			'column-gap': '12px',
			'row-gap': '8px',
		} );
	} );

	it( 'should fall back to safe defaults for invalid flow', () => {
		const result = gridTransformer(
			{ columnsCount: 2, rowsCount: 2, autoFlow: 'invalid' },
			{ key: 'grid' }
		);

		expect( getMultiPropsValue( result )[ 'grid-auto-flow' ] ).toBe( 'row' );
	} );
} );
