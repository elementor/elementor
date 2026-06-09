import { httpService } from '@elementor/http-client';

import { convertCssToAtomic, convertStyleBlocksToAtomic } from '../convert-css-to-atomic';

jest.mock( '@elementor/http-client' );

const mockedHttpService = jest.mocked( httpService );

const mockPost = ( responseData: unknown ) => {
	const post = jest.fn().mockResolvedValue( { data: { data: responseData, meta: {} } } );
	mockedHttpService.mockReturnValue( { post } as never );
	return post;
};

describe( 'convertCssToAtomic', () => {
	it( 'posts a single named block as a declaration map and unwraps its result', async () => {
		// Arrange.
		const post = mockPost( {
			default: { props: { color: { $$type: 'color', value: 'red' } }, customCss: 'gap: 4px;' },
		} );

		// Act.
		const result = await convertCssToAtomic( { color: 'red', gap: '4px' } );

		// Assert.
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/css-to-atomic', {
			blocks: { default: { color: 'red', gap: '4px' } },
		} );
		expect( result ).toEqual( {
			props: { color: { $$type: 'color', value: 'red' } },
			customCss: 'gap: 4px;',
		} );
	} );

	it( 'forwards null declarations untouched so the server can emit reset props', async () => {
		// Arrange.
		const post = mockPost( {
			default: { props: { color: null }, customCss: '' },
		} );

		// Act.
		const result = await convertCssToAtomic( { color: null } );

		// Assert.
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/css-to-atomic', {
			blocks: { default: { color: null } },
		} );
		expect( result ).toEqual( { props: { color: null }, customCss: '' } );
	} );
} );

describe( 'convertStyleBlocksToAtomic', () => {
	it( 'posts every named declaration map and returns the named results map', async () => {
		// Arrange.
		const post = mockPost( {
			'el-1': { props: {}, customCss: 'color: red;' },
			'el-2': { props: {}, customCss: 'gap: 4px;' },
		} );

		// Act.
		const results = await convertStyleBlocksToAtomic( {
			'el-1': { color: 'red' },
			'el-2': { gap: '4px' },
		} );

		// Assert.
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/css-to-atomic', {
			blocks: { 'el-1': { color: 'red' }, 'el-2': { gap: '4px' } },
		} );
		expect( results ).toEqual( {
			'el-1': { props: {}, customCss: 'color: red;' },
			'el-2': { props: {}, customCss: 'gap: 4px;' },
		} );
	} );

	it( 'posts plaintext css text blocks and returns the named results map', async () => {
		// Arrange.
		const post = mockPost( {
			default: { props: { display: { $$type: 'string', value: 'flex' } }, customCss: '' },
			hover: { props: { opacity: { $$type: 'string', value: '0.85' } }, customCss: '' },
		} );

		// Act.
		const results = await convertStyleBlocksToAtomic( {
			default: 'display: flex;',
			hover: 'opacity: 0.85;',
		} );

		// Assert.
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/css-to-atomic', {
			blocks: { default: 'display: flex;', hover: 'opacity: 0.85;' },
		} );
		expect( results ).toEqual( {
			default: { props: { display: { $$type: 'string', value: 'flex' } }, customCss: '' },
			hover: { props: { opacity: { $$type: 'string', value: '0.85' } }, customCss: '' },
		} );
	} );

	it( 'posts an empty blocks map when given no style blocks', async () => {
		// Arrange.
		const post = mockPost( {} );

		// Act.
		await convertStyleBlocksToAtomic( {} );

		// Assert.
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/css-to-atomic', { blocks: {} } );
	} );
} );
