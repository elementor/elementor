import { useEffect, useRef } from 'react';
import { Box, IconButton } from '@elementor/ui';
import { TrashIcon } from '@elementor/icons';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

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
			cursor: props.allowRemove ? 'pointer' : 'default',
			overflow: 'hidden',
			borderRadius: '5px',
			opacity: props.disabled ? 0.5 : 1,
			'& img': {
				width: '100%',
				height: '100%',
				objectFit: 'cover',
			},
			'&:hover::before': props.allowRemove ? {
				content: '""',
				position: 'absolute',
				inset: 0,
				backgroundColor: 'rgba(0,0,0,0.6)',
			} : {},
			'&:hover .remove-attachment': {
				display: 'block',
			},
		} } onClick={ props.onClick }
		>
			{ props.allowRemove &&
				<IconButton
					className="remove-attachment"
					size="small"
					aria-label={ __( 'Remove' ) }
					disabled={ props.disabled }
					onClick={ props.onRemove }
					sx={ {
						display: 'none',
						position: 'absolute',
						insetInlineEnd: 0,
						backgroundColor: 'secondary.main',
						zIndex: 1,
						borderRadius: '5px',
						'&:hover': {
							backgroundColor: 'secondary.dark',
						},
					} }
				>
					<TrashIcon sx={ {
						color: 'common.white',
					} } />
				</IconButton>
			}

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
	allowRemove: PropTypes.bool,
	onRemove: PropTypes.func.isRequired,
	html: PropTypes.string.isRequired,
};
