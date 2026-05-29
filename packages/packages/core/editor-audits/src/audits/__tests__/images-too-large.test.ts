import { descriptor, evaluator } from '../images-too-large';
import { makeContext, makeWidget } from './fixtures';

const ONE_MB = 1024 * 1024;
const SMALL_KB = 100 * 1024;

describe( descriptor.id, () => {
	it( 'passes when all images are under the threshold', async () => {
		const tree = [ makeWidget( 'i1', 'image', { image: { id: 1 } } ) ];
		const pageContext = {
			image_sizes: { 1: { width: 1, height: 1, filesize_bytes: SMALL_KB, mime: 'image/jpeg', src: '' } },
		};

		expect( await evaluator( makeContext( { tree, pageContext } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when an image exceeds the threshold', async () => {
		const tree = [ makeWidget( 'i1', 'image', { image: { id: 1 } } ) ];
		const pageContext = {
			image_sizes: { 1: { width: 1, height: 1, filesize_bytes: ONE_MB, mime: 'image/jpeg', src: '' } },
		};
		const result = await evaluator( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );
	} );
} );
