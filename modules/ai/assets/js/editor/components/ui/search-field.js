import { forwardRef } from 'react';
import { TextField, InputAdornment } from '@elementor/ui';
import { SearchIcon } from '@elementor/icons';

const SearchField = forwardRef( ( props, ref ) => {
	return (
		<TextField
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
