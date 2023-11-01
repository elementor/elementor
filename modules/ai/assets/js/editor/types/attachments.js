import PropTypes from 'prop-types';

export const attachmentShape = PropTypes.shape( {
	type: PropTypes.string,
	previewHTML: PropTypes.string,
	content: PropTypes.string,
	label: PropTypes.string,
} );

export const attachmentsShape = PropTypes.arrayOf( attachmentShape );
