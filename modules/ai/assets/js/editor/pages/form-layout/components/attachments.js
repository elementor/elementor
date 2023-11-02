import AttachmentJson from './attachments/attachment-json';
import PropTypes from 'prop-types';
import { AttachmentPropType } from '../../../types/attachment';

const ATTACHMENT_TYPE_JSON = 'json';

const Attachments = ( props ) => {
	const type = props.attachments[ 0 ]?.type;

	switch ( type ) {
		case ATTACHMENT_TYPE_JSON:
			return <AttachmentJson { ...props } />;
	}

	return null;
};

Attachments.propTypes = {
	attachments: PropTypes.arrayOf( AttachmentPropType ).isRequired,
	disabled: PropTypes.bool,
};

export default Attachments;
