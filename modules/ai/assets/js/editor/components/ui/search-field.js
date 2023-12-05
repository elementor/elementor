import { forwardRef } from 'react';
import { TextField, InputAdornment, styled } from '@elementor/ui';
import PropTypes from 'prop-types';
import { SearchIcon } from '@elementor/icons';

// Customization for the WP admin global CSS.
const StyledTextField = styled( TextField )( () => ( {
	'.wp-admin & .MuiInputBase-input, & .MuiInputBase-input:focus': {
		backgroundColor: 'initial',
		boxShadow: 'none',
		border: 0,
		color: 'inherit',
		outline: 0,
		/**
		 * TODO:
		 * Find a better solution to get the component padding value dynamically or fix the global CSS override.
		 * These values are taken from Material UI's source code (the left padding reset was added to match the component style).
		 */
		padding: '16.5px 14px 16.5px 0',
		'&.MuiInputBase-inputSizeSmall': {
			padding: '8.5px 14px 8.5px 0',
		},
	},
} ) );

const SearchField = forwardRef( ( props, ref ) => {
	return (
		<StyledTextField
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus
			fullWidth
			required
			size="small"
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
			inputRef={ ref }
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
