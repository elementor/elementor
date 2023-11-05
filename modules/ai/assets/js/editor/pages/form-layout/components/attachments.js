import { Menu } from './attachments/menu';
import ThumbnailJson from './attachments/thumbnail-json';
import ThumbnailUrl from './attachments/thumbnail-url';
import WebsiteIcon from '../../../icons/website-icon';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { AttachmentPropType } from '../../../types/attachment';

const ATTACHMENT_TYPE_JSON = 'json';
const ATTACHMENT_TYPE_URL = 'url';

const Attachments = ( props ) => {
	const type = props.attachments[ 0 ]?.type;

	switch ( type ) {
		case ATTACHMENT_TYPE_JSON:
			return <ThumbnailJson { ...props } />;
		case ATTACHMENT_TYPE_URL:
			return <ThumbnailUrl { ...props } />;
	}

	return (
		<Menu
			disabled={ props.disabled }
			onAttach={ props.onAttach }
			items={ [ {
				title: __( 'URL as a reference', 'elementor' ),
				icon: WebsiteIcon,
				type: ATTACHMENT_TYPE_URL,
			} ] }
		/>
	);
};

Attachments.propTypes = {
	attachments: PropTypes.arrayOf( AttachmentPropType ).isRequired,
	disabled: PropTypes.bool,
	onAttach: PropTypes.func,
};

export default Attachments;
