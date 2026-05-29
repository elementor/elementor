import { descriptor, evaluator } from '../heading-structure';
import { makeContext, makeWidget } from './fixtures';

describe( descriptor.id, () => {
	it( 'passes with one H1 and consecutive levels', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { header_size: 'h1' } ),
			makeWidget( 'h2', 'heading', { header_size: 'h2' } ),
			makeWidget( 'h3', 'heading', { header_size: 'h3' } ),
		];

		expect( await evaluator( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when no H1 is present', async () => {
		const tree = [ makeWidget( 'h2', 'heading', { header_size: 'h2' } ) ];
		const result = await evaluator( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );
	} );

	it( 'flags a skipped heading level', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { header_size: 'h1' } ),
			makeWidget( 'h4', 'heading', { header_size: 'h4' } ),
		];
		const result = await evaluator( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations.some( ( v ) => v.label.includes( 'skipped' ) ) ).toBe( true );
		}
	} );
} );
