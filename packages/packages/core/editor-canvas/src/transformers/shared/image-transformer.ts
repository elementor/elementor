import { getMediaAttachment } from '@elementor/wp-media';

import { createTransformer } from '../create-transformer';

type Image = {
	src?: {
		id: number | null;
		url: string | null;
	};
	size?: string;
};

export const imageTransformer = createTransformer( async ( value: Image ) => {
	const { src, size } = value;

	if ( ! src?.id ) {
		return src?.url ? { src: src.url } : null;
	}

	const attachment = await getMediaAttachment( { id: src.id } );

	const sizedAttachment = attachment?.sizes?.[ size ?? '' ];

	if ( sizedAttachment ) {
		return {
			src: sizedAttachment.url,
			height: sizedAttachment.height,
			width: sizedAttachment.width,
		};
	}

	if ( attachment ) {
		return {
			src: attachment.url,
			height: attachment.height,
			width: attachment.width,
		};
	}

	return null;
} );
