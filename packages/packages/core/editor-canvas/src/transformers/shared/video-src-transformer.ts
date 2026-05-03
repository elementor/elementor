import { getMediaAttachment } from '@elementor/wp-media';

import { createTransformer } from '../create-transformer';

type VideoSrc = {
	id: number | null;
	url: string | null;
};

export const videoSrcTransformer = createTransformer( async ( value: VideoSrc ) => {
	const { id, url } = value;

	if ( ! id ) {
		return { id: null, url };
	}

	const attachment = await getMediaAttachment( { id } );

	return {
		id,
		url: attachment?.url ?? url,
	};
} );
