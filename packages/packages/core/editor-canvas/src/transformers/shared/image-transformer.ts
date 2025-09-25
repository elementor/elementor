import { getMediaAttachment } from '@elementor/wp-media';

import { createTransformer } from '../create-transformer';

type Image = {
	src?: {
		id: number | null;
		url: string | null;
	};
	size?: string;
};

export const imageTransformer = createTransformer( async ( value: Image | null | undefined ) => {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}

	const { src, size } = value;

	if ( ! src?.id ) {
		return src?.url ? { src: src.url } : null;
	}

	const attachment = await getMediaAttachment( { id: src.id } );

	const sizedAttachment = attachment?.sizes?.[ size ?? '' ];

	if ( sizedAttachment ) {
		return {
			src: sizedAttachment.url,
			height: sizedAttachment.height ?? 0,
			width: sizedAttachment.width ?? 0,
		};
	}

	if ( attachment ) {
		return {
			src: attachment.url,
			height: attachment.height ?? 0,
			width: attachment.width ?? 0,
		};
	}

	return null;
} );
