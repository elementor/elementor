import { useState, forwardRef } from 'react';
import { Autocomplete, TextField } from '@elementor/ui';
import PropTypes from 'prop-types';

const TextInput = forwardRef( ( props, ref ) => (
	<TextField
		// eslint-disable-next-line jsx-a11y/no-autofocus
		autoFocus
		multiline
		size="small"
		maxRows={ 3 }
		color="secondary"
		variant="standard"
		{ ...props }
		inputRef={ ref }
		InputProps={ {
			...props.InputProps,
			type: 'search',
		} }
	/>
) );

TextInput.propTypes = {
	InputProps: PropTypes.object,
};

const PromptAutocomplete = ( { onSubmit, ...props } ) => {
	const [ showSuggestions, setShowSuggestions ] = useState( false );

	return (
		<Autocomplete
			freeSolo
			fullWidth
			disableClearable
			open={ showSuggestions }
			onClose={ () => setShowSuggestions( false ) }
			onKeyDown={ ( e ) => {
				if ( 'Enter' === e.key && ! e.shiftKey && ! showSuggestions ) {
					onSubmit( e );
				} else if ( '/' === e.key && '' === e.target.value ) {
					e.preventDefault();
					setShowSuggestions( true );
				}
			} }
			{ ...props }
		/>
	);
};

PromptAutocomplete.propTypes = {
	onSubmit: PropTypes.func.isRequired,
};

PromptAutocomplete.TextInput = TextInput;

export default PromptAutocomplete;
