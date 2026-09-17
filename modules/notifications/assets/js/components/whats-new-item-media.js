/* eslint-disable react/prop-types */
import { Box } from '@elementor/ui';
import { WhatsNewItemThumbnail } from './whats-new-item-thumbnail';

export const WhatsNewItemMedia = ( { item } ) => {
	if ( item.youtubeEmbedId ) {
		const videoId = item.youtubeEmbedId.split( '?' )[ 0 ];
		const src = `https://www.youtube.com/embed/${ videoId }${ item.youtubeAutoplay ? '?autoplay=1&mute=1' : '' }`;
		const allow = `encrypted-media; picture-in-picture${ item.youtubeAutoplay ? '; autoplay' : '' }`;

		return (
			<Box sx={ { pb: 2 } }>
				<Box
					component="iframe"
					src={ src }
					title={ item.title || 'Video' }
					allow={ allow }
					allowFullScreen={ true }
					sx={ { aspectRatio: '16/9', width: '100%', display: 'block', border: 'none' } }
				/>
			</Box>
		);
	}

	const mediaSrc = item.gifSrc || item.imageSrc;

	if ( ! mediaSrc ) {
		return null;
	}

	return (
		<WhatsNewItemThumbnail
			imageSrc={ mediaSrc }
			link={ item.link }
			title={ item.title }
		/>
	);
};
