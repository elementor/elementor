import { useEffect, useRef } from 'react';
import { Box } from '@elementor/ui';
import PropTypes from 'prop-types';

export const THUMBNAIL_SIZE = 64;

export const Thumbnail = ( props ) => {
	const previewRef = useRef( null );

	useEffect( () => {
		if ( previewRef.current ) {
			const previewRoot = previewRef.current.firstElementChild;

			const width = previewRoot?.offsetWidth || THUMBNAIL_SIZE;
			const height = previewRoot?.offsetHeight || THUMBNAIL_SIZE;

			// Keep the aspect ratio
			previewRoot.style.width = `${ width }px`;
			previewRoot.style.height = `${ height }px`;

			previewRef.current.style.width = `${ THUMBNAIL_SIZE }px`;
			previewRef.current.style.height = `${ THUMBNAIL_SIZE }px`;

			const scaleFactor = Math.min( height, width );
			const scale = THUMBNAIL_SIZE / scaleFactor;

			previewRef.current.style.transform = `scale(${ scale })`;

			const isImage = 'IMG' === previewRoot?.tagName;

			if ( ! isImage ) {
				// Center the preview
				const top = height > width ? ( ( THUMBNAIL_SIZE - ( THUMBNAIL_SIZE * ( height / width ) ) ) / 2 ) : 0;
				const left = width > height ? ( ( THUMBNAIL_SIZE - ( THUMBNAIL_SIZE * ( width / height ) ) ) / 2 ) : 0;

				previewRef.current.style.transformOrigin = `${ left }px ${ top }px`;
			}
		}
	}, [] );

	return (
		<Box sx={ {
			border: '1px solid',
			borderColor: 'grey.300',
			position: 'relative',
			cursor: 'default',
			overflow: 'hidden',
			borderRadius: 1,
			opacity: props.disabled ? 0.5 : 1,
			'& img': {
				width: '100%',
				height: '100%',
				objectFit: 'cover',
			},
		} }
		>
			<Box
				ref={ previewRef }
				sx={ {
					pointerEvents: 'none',
					transformOrigin: 'center',
				} }
				dangerouslySetInnerHTML={ {
					__html: props.html,
				} }
			/>
		</Box>
	);
};

Thumbnail.propTypes = {
	html: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
};
