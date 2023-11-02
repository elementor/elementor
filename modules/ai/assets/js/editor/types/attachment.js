import PropTypes from 'prop-types';

export const AttachmentPropType = PropTypes.shape( {
	type: PropTypes.string,
	previewHTML: PropTypes.string,
	content: PropTypes.string,
	label: PropTypes.string,
} );
