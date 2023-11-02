import { Thumbnail } from './thumbnail';
import PropTypes from 'prop-types';
import { Skeleton } from '@elementor/ui';
import { AttachmentPropType } from '../../../../types/attachment';

export const AttachmentJson = ( props ) => {
	const attachment = props.attachments?.find( ( item ) => 'json' === item.type );

	if ( ! attachment ) {
		return null;
	}

	if ( ! attachment.previewHTML ) {
		return (
			<Skeleton
				animation="wave"
				variant="rounded"
				width={ 60 }
				height={ 60 }
			/>
		);
	}

	return (
		<Thumbnail
			html={ attachment.previewHTML }
			disabled={ props.disabled }
		/>
	);
};

AttachmentJson.propTypes = {
	attachments: PropTypes.arrayOf( AttachmentPropType ).isRequired,
	disabled: PropTypes.bool,
};

export default AttachmentJson;
