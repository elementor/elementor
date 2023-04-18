import { forwardRef } from 'react';
import { TextField, InputAdornment, styled } from '@elementor/ui';
import { SearchIcon } from '@elementor/icons';

const StyledTextField = styled( TextField )( ( { theme } ) => ( {
	// Overwriting the admin global CSS.
	'& .MuiInputBase-input, & .MuiInputBase-input:focus': {
		backgroundColor: theme.palette.background.default,
		border: 'none',
		boxShadow: 'none',
		color: theme.palette.text.primary,
		padding: theme.spacing( 0, 3 ),
		outline: 'none',
	},
	'& .MuiInputAdornment-root': {
		color: theme.palette.text.tertiary,
	},
} ) );

const SearchField = forwardRef( ( props, ref ) => {
	return (
		<StyledTextField
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus
			fullWidth
			required
			color="secondary"
			InputProps={ {
				autoComplete: 'off',
				startAdornment: (
					<InputAdornment position="start">
						<SearchIcon />
					</InputAdornment>
				),
			} }
			placeholder={ props.placeholder }
			name={ props.name }
			value={ props.value }
			onChange={ props.onChange }
			{ ...props }
			ref={ ref }
		/>
	);
} );

SearchField.propTypes = {
	placeholder: PropTypes.string,
	name: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func,
};

export default SearchField;
