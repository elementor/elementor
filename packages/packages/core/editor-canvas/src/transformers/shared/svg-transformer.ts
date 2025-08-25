import { getMediaAttachment } from '@elementor/wp-media';

import { createTransformer } from '../create-transformer';

type Svg = {
	id?: number;
	url?: string;
};

export const svgTransformer = createTransformer( async ( value: Svg ) => {
	const { id, url } = value;

	if ( ! id ) {
		return null;
	}

	const attachment = await getMediaAttachment( { id } );

	if ( attachment ) {
		return {
			src: attachment.url,
			height: attachment.height,
			width: attachment.width,
		};
	}

	return null;
} );
