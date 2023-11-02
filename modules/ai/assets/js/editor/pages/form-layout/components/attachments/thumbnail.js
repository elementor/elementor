import { useEffect, useRef } from 'react';
import { Box, IconButton } from '@elementor/ui';
import PropTypes from 'prop-types';
import { TrashIcon } from '@elementor/icons';

const THUMBNAIL_SIZE = 64;

export const Thumbnail = ( props ) => {
	const previewRef = useRef( null );

	useEffect( () => {
		if ( previewRef.current ) {
			const previewRoot = previewRef.current.firstElementChild;
			const width = previewRoot?.offsetWidth || THUMBNAIL_SIZE;
			const height = previewRoot?.offsetHeight || THUMBNAIL_SIZE;

			const scaleFactor = Math.max( height, width );
			const scale = THUMBNAIL_SIZE / scaleFactor;

			previewRef.current.style.transform = `scale(${ scale })`;
			previewRef.current.style.transformOrigin = 'center';
		}
	}, [] );

	return (
		<Box
			sx={ {
				width: THUMBNAIL_SIZE,
				height: THUMBNAIL_SIZE,
				minWidth: THUMBNAIL_SIZE,
				minHeight: THUMBNAIL_SIZE,
				maxWidth: THUMBNAIL_SIZE,
				maxHeight: THUMBNAIL_SIZE,
				border: '1px solid',
				borderColor: 'grey.300',
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
			} }
			onClick={ props.onClick }
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
					<TrashIcon
						sx={ {
							color: 'common.white',
						} }
					/>
				</IconButton>
			}

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
	allowRemove: PropTypes.bool,
	onRemove: PropTypes.func.isRequired,
	html: PropTypes.string.isRequired,
};
