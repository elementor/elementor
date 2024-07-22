import { Thumbnail } from './thumbnail';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@elementor/ui';
import { TrashIcon } from '@elementor/icons';
import { AttachmentPropType } from '../../../../types/attachment';

export const ThumbnailUrl = ( props ) => {
	const attachment = props.attachments?.find( ( item ) => 'url' === item.type );

	if ( ! attachment ) {
		return null;
	}

	return (
		<Box
			sx={ {
				position: 'relative',
				'&:hover::before': {
					content: '""',
					position: 'absolute',
					userSelect: 'none',
					inset: 0,
					backgroundColor: 'rgba(0,0,0,0.6)',
					borderRadius: 1,
					zIndex: 1,
				},
				'&:hover .remove-attachment': {
					display: 'flex',
				},
			} }
		>
			<IconButton
				className="remove-attachment"
				size="small"
				aria-label={ __( 'Remove', 'elementor' ) }
				disabled={ props.disabled }
				onClick={ ( event ) => {
					event.stopPropagation();
					props.onDetach();
				} }
				sx={ {
					display: 'none',
					position: 'absolute',
					insetInlineEnd: 4,
					insetBlockStart: 4,
					backgroundColor: 'secondary.main',
					zIndex: 1,
					borderRadius: 1,
					p: '3px',

					'&:hover': {
						backgroundColor: 'secondary.dark',
					},
				} }
			>
				<TrashIcon
					sx={ {
						fontSize: '1.125rem',
						color: 'common.white',
					} }
				/>
			</IconButton>
			<Thumbnail
				disabled={ props.disabled }
				html={ attachment.previewHTML }
			/>
		</Box>
	);
};

ThumbnailUrl.propTypes = {
	attachments: PropTypes.arrayOf( AttachmentPropType ).isRequired,
	disabled: PropTypes.bool,
	onDetach: PropTypes.func,
};

export default ThumbnailUrl;
