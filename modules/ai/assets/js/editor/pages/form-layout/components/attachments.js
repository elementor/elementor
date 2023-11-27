import { Menu } from './attachments/menu';
import ThumbnailJson from './attachments/thumbnail-json';
import ThumbnailUrl from './attachments/thumbnail-url';
import WebsiteIcon from '../../../icons/website-icon';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { AttachmentPropType } from '../../../types/attachment';
import { Stack } from '@elementor/ui';

const ATTACHMENT_TYPE_JSON = 'json';
const ATTACHMENT_TYPE_URL = 'url';

const Attachments = ( props ) => {
	if ( ! props.attachments.length ) {
		return (
			<Menu
				disabled={ props.disabled }
				onAttach={ props.onAttach }
				items={ [ {
					title: __( 'Reference a website', 'elementor' ),
					icon: WebsiteIcon,
					type: ATTACHMENT_TYPE_URL,
				} ] }
			/>
		);
	}

	return (
		<Stack direction="row" spacing={ 1 }>
			{
				props.attachments.map( ( attachment, index ) => {
					switch ( attachment.type ) {
						case ATTACHMENT_TYPE_JSON:
							return <ThumbnailJson key={ index } { ...props } />;
						case ATTACHMENT_TYPE_URL:
							return <ThumbnailUrl key={ index } { ...props } />;
						default:
							return null;
					}
				} )
			}
		</Stack>
	);
};

Attachments.propTypes = {
	attachments: PropTypes.arrayOf( AttachmentPropType ).isRequired,
	onAttach: PropTypes.func.isRequired,
	onDetach: PropTypes.func,
	disabled: PropTypes.bool,
};

export default Attachments;
