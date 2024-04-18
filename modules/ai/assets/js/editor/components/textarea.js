import { forwardRef } from 'react';
import { TextField } from '@elementor/ui';
import PropTypes from 'prop-types';

const Textarea = forwardRef( ( props, ref ) => {
	return (
		<TextField
			inputRef={ ref }
			multiline
			minRows={ 4 }
			maxRows={ 20 }
			color="secondary"
			{ ...props }
		/>
	);
} );

Textarea.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
	helperText: PropTypes.string,
};

export default Textarea;
