import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { AxiosError, type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';

import { uploadMediaToolPrompt } from './prompt';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

const MAX_IMAGES = 5;

const getErrorMessage = ( error: unknown ): string => {
	if ( error instanceof AxiosError ) {
		const data = error.response?.data as { message?: string; code?: string } | undefined;

		if ( data?.message ) {
			return data.code ? `${ data.code }: ${ data.message }` : data.message;
		}
	}

	return error instanceof Error ? error.message : 'upload-media failed with an unknown error.';
};

// NOTE: shape defined by Upload_Media_Ability::execute() in modules/mcp/abilities/upload-media-ability.php
type UploadMediaResponse = Record< string, unknown >;

export const initUploadMediaTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	const imageSchema = z.object( {
		source_url: z.string().describe( 'Public HTTPS URL of the image.' ),
		title: z.string().optional(),
		alt: z.string().optional(),
	} );

	addTool( {
		name: 'upload-media',
		description: uploadMediaToolPrompt.prompt(),
		schema: {
			source_url: z
				.string()
				.optional()
				.describe( 'Public HTTPS URL of a single image. Use either source_url or images.' ),
			title: z.string().optional().describe( 'Optional attachment title for source_url.' ),
			alt: z.string().optional().describe( 'Optional alt text for source_url.' ),
			images: z
				.array( imageSchema )
				.min( 1 )
				.max( MAX_IMAGES )
				.optional()
				.describe( `Several images (1 to ${ MAX_IMAGES }). Use either source_url or images.` ),
			consent: z.boolean().describe( 'Must be true when the user has approved importing the image or images.' ),
		},
		outputSchema: {
			attachment_id: z.number().optional(),
			url: z.string().optional(),
			mime: z.string().optional(),
			width: z.number().nullable().optional(),
			height: z.number().nullable().optional(),
			alt: z.string().optional(),
			total: z.number().optional(),
			succeeded: z.number().optional(),
			failed: z.number().optional(),
			uploads: z.array( z.record( z.string(), z.unknown() ) ).optional(),
		},
		handler: async ( { source_url: sourceUrl, title, alt, images, consent } ) => {
			try {
				const { data } = await httpService().post< HttpResponse< UploadMediaResponse > >( MCP_PROXY_URL, {
					tool: 'upload-media',
					input: {
						consent,
						...( sourceUrl ? { source_url: sourceUrl } : {} ),
						...( title ? { title } : {} ),
						...( alt ? { alt } : {} ),
						...( images ? { images } : {} ),
					},
				} );

				return data.data;
			} catch ( error ) {
				throw new Error( getErrorMessage( error ) );
			}
		},
	} );
};
