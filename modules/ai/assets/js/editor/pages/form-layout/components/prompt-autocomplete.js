import { useState, forwardRef } from 'react';
import { Autocomplete, Box, Divider, Paper, TextField, Typography, useTheme } from '@elementor/ui';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

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

const PaperComponent = function( props ) {
	return (
		<Paper { ...props }
			sx={ {
				borderRadius: 2,
			} }
		>
			<Typography
				component={ Box }
				color={ ( theme ) => theme.palette.text.tertiary }
				variant="caption"
				paddingX={ 2 }
				paddingY={ 1 }
			>
				{ __( 'Suggested Prompts', 'elementor' ) }
			</Typography>
			<Divider />
			{ props.children }
		</Paper>
	);
};

PaperComponent.propTypes = {
	children: PropTypes.node,
};

const PromptAutocomplete = ( { onSubmit, ...props } ) => {
	const [ showSuggestions, setShowSuggestions ] = useState( false );
	const theme = useTheme();
	const itemHeight = parseInt( theme.spacing( 4 ) );
	const maxItems = 5;

	return (
		<Autocomplete
			PaperComponent={ PaperComponent }
			ListboxProps={ { sx: { maxHeight: maxItems * itemHeight } } }
			renderOption={ ( optionProps, option ) => (
				<Typography
					{ ...optionProps }
					title={ option.text }
					noWrap
					variant="body2"
					component={ Box }
					sx={ {
						'&.MuiAutocomplete-option': {
							display: 'block',
							minHeight: itemHeight,
						} } }
				>
					{ option.text }
				</Typography>
			) }
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
