import { useEffect, useRef } from 'react';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

export const THUMBNAIL_SIZE = 64;

export const Thumbnail = ( props ) => {
	const previewRef = useRef( null );

	useEffect( () => {
		if ( previewRef.current ) {
			const previewRoot = previewRef.current.firstElementChild;

			const isImage = 'IMG' === previewRoot?.tagName;

			if ( ! isImage ) {
				const dataWidth = props.html.match( 'data-width="(?<width>\\d+)"' )?.groups?.width;
				const dataHeight = props.html.match( 'data-height="(?<height>\\d+)"' )?.groups?.height;

				const width = dataWidth ? parseInt( dataWidth ) : THUMBNAIL_SIZE;
				const height = dataHeight ? parseInt( dataHeight ) : THUMBNAIL_SIZE;

				// Keep the aspect ratio
				previewRoot.style.width = `${ width }px`;
				previewRoot.style.height = `${ height }px`;

				const scaleFactor = Math.min( height, width );
				const scale = THUMBNAIL_SIZE / scaleFactor;

				previewRef.current.style.transform = `scale(${ scale })`;

				// Center the preview
				const top = height > width ? ( ( THUMBNAIL_SIZE - ( THUMBNAIL_SIZE * ( height / width ) ) ) / 2 ) : 0;
				const left = width > height ? ( ( THUMBNAIL_SIZE - ( THUMBNAIL_SIZE * ( width / height ) ) ) / 2 ) : 0;

				previewRef.current.style.transformOrigin = `${ left }px ${ top }px`;
			}
		}
	}, [ props.html ] );

	return (
		<Box
			dir="ltr"
			sx={ {
				position: 'relative',
				cursor: 'default',
				overflow: 'hidden',
				border: '1px solid',
				borderColor: 'grey.300',
				borderRadius: 1,
				boxSizing: 'border-box',
				width: THUMBNAIL_SIZE,
				height: THUMBNAIL_SIZE,
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
			>
				<iframe
					title={ __( 'Preview', 'elementor' ) }
					sandbox=""
					srcDoc={
						'<style>html,body{margin:0;padding:0;overflow:hidden;}</style>' +
						props.html
					}
					style={ {
						border: 'none',
						overflow: 'hidden',
					} }
				/>
			</Box>
		</Box>
	);
};

Thumbnail.propTypes = {
	html: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
};
