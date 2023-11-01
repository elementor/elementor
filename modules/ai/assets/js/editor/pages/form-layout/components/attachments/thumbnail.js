import { useEffect, useRef } from 'react';
import { Box } from '@elementor/ui';
import PropTypes from 'prop-types';

const THUMBNAIL_SIZE = 60;

export const Thumbnail = ( props ) => {
	const previewRef = useRef( null );

	useEffect( () => {
		if ( previewRef.current ) {
			const previewRoot = previewRef.current.querySelector( '*' );
			const attachmentWidth = previewRoot?.offsetWidth || THUMBNAIL_SIZE;

			previewRef.current.style.transform = 'scale(' + ( THUMBNAIL_SIZE / attachmentWidth ) + ')';
		}
	}, [] );

	return (
		<Box sx={ {
			width: THUMBNAIL_SIZE,
			height: THUMBNAIL_SIZE,
			border: '1px solid grey',
			position: 'relative',
			cursor: 'default',
			overflow: 'hidden',
			borderRadius: '5px',
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
						transform: 'scale(0.10)',
						transformOrigin: 'top left',
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
