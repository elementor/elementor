import { Menu } from './attachments/menu';
import ThumbnailJson from './attachments/thumbnail-json';
import ThumbnailUrl from './attachments/thumbnail-url';
import WebsiteIcon from '../../../icons/website-icon';
import CopyPageIcon from '../../../icons/copy-page-icon';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { AttachmentPropType } from '../../../types/attachment';
import { Stack } from '@elementor/ui';

export const ATTACHMENT_TYPE_JSON = 'json';
export const ATTACHMENT_TYPE_URL = 'url';
export const MENU_TYPE_LIBRARY = 'library';

export const USER_VARIATION_SOURCE = 'user-variation';
export const ELEMENTOR_LIBRARY_SOURCE = 'elementor-library';
export const USER_URL_SOURCE = 'user-url';

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
				},
				{
					title: __( 'Create variations from Template Library', 'elementor' ),
					icon: CopyPageIcon,
					type: MENU_TYPE_LIBRARY,
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
