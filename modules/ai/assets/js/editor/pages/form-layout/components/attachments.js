import { useState } from 'react';
import AttachmentJson from './attachments/attachment-json';
import PropTypes from 'prop-types';

const ATTACHMENT_TYPE_JSON = 'json';

const Attachments = ( { attachments, disabled } ) => {
	const initialAttachmentType = attachments.length ? attachments[ 0 ].type : null;
	const [ currentAttachmentType, setCurrentAttachmentType ] = useState( initialAttachmentType );

	// On external change, e.g. thumbnail generated
	if ( initialAttachmentType && initialAttachmentType !== currentAttachmentType ) {
		setCurrentAttachmentType( initialAttachmentType );
	}

	return (
		<>
			{
				ATTACHMENT_TYPE_JSON === currentAttachmentType &&
				<AttachmentJson
					disabled={ disabled }
					attachments={ attachments }
				/>
			}
		</>
	);
};

Attachments.propTypes = {
	attachments: PropTypes.array,
	disabled: PropTypes.bool,
};

export default Attachments;
