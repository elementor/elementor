import { useEffect, useRef } from 'react';
import { Box } from '@elementor/ui';
import PropTypes from 'prop-types';

const THUMBNAIL_SIZE = 64;

export const Thumbnail = ( props ) => {
	const previewRef = useRef( null );

	useEffect( () => {
		if ( previewRef.current ) {
			const previewRoot = previewRef.current.querySelector( '*' );
			const width = previewRoot?.offsetWidth || THUMBNAIL_SIZE;
			const height = previewRoot?.offsetHeight || THUMBNAIL_SIZE;

			const scaleFactor = width > height ? width : height;
			const scale = THUMBNAIL_SIZE / scaleFactor;

			previewRef.current.style.transform = `scale(${ scale })`;
			previewRef.current.style.transformOrigin = 'center';
		}
	}, [] );

	return (
		<Box sx={ {
			width: THUMBNAIL_SIZE,
			height: THUMBNAIL_SIZE,
			minWidth: THUMBNAIL_SIZE,
			minHeight: THUMBNAIL_SIZE,
			maxWidth: THUMBNAIL_SIZE,
			maxHeight: THUMBNAIL_SIZE,
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
			<Box>
				<Box
					ref={ previewRef }
					sx={ {
						pointerEvents: 'none',
						transformOrigin: 'center',
						width: THUMBNAIL_SIZE,
						height: THUMBNAIL_SIZE,
					} }
					dangerouslySetInnerHTML={ {
						__html: props.html,
					} }
				/>
			</Box>
		</Box>
	);
};

Thumbnail.propTypes = {
	disabled: PropTypes.bool,
	onClick: PropTypes.func.isRequired,
	html: PropTypes.string.isRequired,
};
