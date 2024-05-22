import { UrlDialog } from './url-dialog';
import PropTypes from 'prop-types';
import { LibraryDialog } from './library-dialog';
import { MENU_TYPE_LIBRARY, ATTACHMENT_TYPE_URL } from '../attachments';

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
		case MENU_TYPE_LIBRARY:
			return <LibraryDialog
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
