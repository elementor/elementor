import { AxiosError, httpService } from '@elementor/http-client';

import { initUploadMediaTool } from '../tool';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
	AxiosError: class AxiosError extends Error {
		response?: unknown;
	},
} ) );

const mockedHttpService = httpService as jest.MockedFunction< typeof httpService >;

type ToolConfig = {
	name: string;
	handler: ( input: Record< string, unknown > ) => Promise< Record< string, unknown > >;
};

const captureTool = (): ToolConfig => {
	const addTool = jest.fn();
	initUploadMediaTool( { addTool } as never );
	return addTool.mock.calls[ 0 ][ 0 ] as ToolConfig;
};

describe( 'upload-media tool', () => {
	it( 'should post to the mcp proxy and return the attachment data', async () => {
		// Arrange.
		const post = jest.fn().mockResolvedValue( { data: { data: { attachment_id: 7, url: 'https://x/a.png' } } } );
		mockedHttpService.mockReturnValue( { post } as never );
		const tool = captureTool();

		// Act.
		const result = await tool.handler( { source_url: 'https://x/a.png', consent: true } );

		// Assert.
		expect( tool.name ).toBe( 'upload-media' );
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			tool: 'upload-media',
			input: { consent: true, source_url: 'https://x/a.png' },
		} );
		expect( result ).toEqual( { attachment_id: 7, url: 'https://x/a.png' } );
	} );

	it( 'should surface a clear permission error', async () => {
		// Arrange.
		const error = new AxiosError( 'Forbidden' );
		error.response = { data: { code: 'rest_forbidden', message: 'Only administrators can upload media.' } } as never;
		mockedHttpService.mockReturnValue( { post: jest.fn().mockRejectedValue( error ) } as never );

		// Act & Assert.
		await expect( captureTool().handler( { source_url: 'https://x/a.png', consent: true } ) ).rejects.toThrow(
			'rest_forbidden: Only administrators can upload media.'
		);
	} );
} );
