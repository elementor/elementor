import { useState } from 'react';
import { Autocomplete, TextField, styled } from '@elementor/ui';

const StyledTextField = styled( TextField )( ( { theme } ) => ( {
	'& .MuiOutlinedInput-notchedOutline': { border: 0 },
	'& .MuiInputBase-root.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 0 },
	'& .MuiInputBase-root.MuiOutlinedInput-root, & .MuiInputBase-root.MuiOutlinedInput-root:focus': {
		paddingBlock: 0,
		paddingInline: theme.spacing( 4 ),
	},
} ) );

const TextInput = ( props ) => (
	<StyledTextField
		// eslint-disable-next-line jsx-a11y/no-autofocus
		autoFocus
		multiline
		size="small"
		maxRows={ 3 }
		{ ...props }
		InputProps={ {
			...props.InputProps,
			type: 'search',
		} }
	/>
);

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
