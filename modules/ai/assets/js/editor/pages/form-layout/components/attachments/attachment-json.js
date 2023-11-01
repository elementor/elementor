import { Thumbnail } from './thumbnail';
import PropTypes from 'prop-types';
import { Skeleton } from '@elementor/ui';

export const AttachmentJson = ( props ) => {
	const attachment = props.attachments?.find( ( item ) => 'json' === item.type );

	if ( ! attachment ) {
		return null;
	}

	if ( ! attachment.previewHTML ) {
		return <Skeleton
			animation="wave"
			variant="rounded"
			width={ 60 }
			height={ 60 }
		/>;
	}

	return (
		<Thumbnail
			disabled={ props.disabled }
			html={ attachment.previewHTML }
			onClick={ () => {} }
			allowRemove={ false }
			onRemove={ () => {} }
		/>
	);
};

AttachmentJson.propTypes = {
	attachments: PropTypes.array,
	disabled: PropTypes.bool,
};

export default AttachmentJson;
