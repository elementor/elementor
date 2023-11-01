import { useState } from 'react';
import { Menu } from './attachments/menu';
import AttachmentJson from './attachments/attachment-json';
import AttachmentUrl from './attachments/attachment-url';
import WebsiteIcon from '../../../icons/website-icon';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const ATTACHMENT_TYPE_URL = 'url';
const ATTACHMENT_TYPE_JSON = 'json';

const Attachments = ( { attachments, onAttach, onDetach, disabled } ) => {
	const initialAttachmentType = attachments.length ? attachments[ 0 ].type : null;
	const [ currentAttachmentType, setCurrentAttachmentType ] = useState( initialAttachmentType );
	const showMenu = ! currentAttachmentType;

	// On external change, e.g. thumbnail generated
	if ( initialAttachmentType && initialAttachmentType !== currentAttachmentType ) {
		setCurrentAttachmentType( initialAttachmentType );
	}

	return (
		<>
			{
				showMenu && <Menu
					disabled={ disabled }
					items={ [ {
						title: __( 'URL as a reference', 'elementor' ),
						icon: WebsiteIcon,
						type: 'url',
					} ] }
					onSelect={ ( type ) => {
						setCurrentAttachmentType( type );
					} }
				/>
			}

			{
				ATTACHMENT_TYPE_URL === currentAttachmentType &&
				<AttachmentUrl
					disabled={ disabled }
					attachments={ attachments }
					onAttach={ onAttach }
					onDetach={ () => {
						setCurrentAttachmentType( null );
						onDetach();
					} }
				/>
			}

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
	allowAddAttachment: PropTypes.bool,
	onAttach: PropTypes.func,
	onDetach: PropTypes.func,
	disabled: PropTypes.bool,
};

export default Attachments;
