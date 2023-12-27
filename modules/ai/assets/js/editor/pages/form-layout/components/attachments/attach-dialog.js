import { UrlDialog } from './url-dialog';
import PropTypes from 'prop-types';

export const ATTACHMENT_TYPE_URL = 'url';

export const AttachDialog = ( props ) => {
	const type = props.type;
	const url = props.url;

	switch ( type ) {
		case ATTACHMENT_TYPE_URL:
			return <UrlDialog
				url={ url }
				onAttach={ props.onAttach }
				onClose={ props.onClose }
			/>;
	}

	return null;
};

AttachDialog.propTypes = {
	type: PropTypes.string,
	onAttach: PropTypes.func,
	onClose: PropTypes.func,
	url: PropTypes.string,
};

export default AttachDialog;
