import { MenuItem, Select, FormControl, InputLabel } from '@elementor/ui';
import PropTypes from 'prop-types';

const labelToDashCash = ( str ) => str.toLowerCase().replace( / /g, '-' );

const PromptActionSelection = ( props ) => {
	const actionId = labelToDashCash( props.label );
	const { wrapperStyle = { maxWidth: 138 } } = props;

	return (
		<FormControl size="small" color="secondary" fullWidth sx={ wrapperStyle }>
			<InputLabel id={ actionId }>{ props.label }</InputLabel>

			<Select
				id={ actionId }
				labelId={ actionId }
				label={ props.label }
				value={ props.value || '' }
				onChange={ props.onChange }
				disabled={ props.disabled }
				sx={ {
					// Fixing global CSS of the editor that targets input[disabled] globally.
					'&.Mui-disabled .MuiSelect-nativeInput': {
						backgroundColor: 'initial',
						opacity: 0,
					},
				} }
			>
				{ props.options.map( ( option ) => (
					<MenuItem
						dense
						key={ option.label }
						value={ option.value ?? option.label }
					>
						{ option.label }
					</MenuItem>
				) ) }
			</Select>
		</FormControl>
	);
};

PromptActionSelection.propTypes = {
	label: PropTypes.string.isRequired,
	options: PropTypes.arrayOf( PropTypes.shape( {
		label: PropTypes.string.isRequired,
		value: PropTypes.string,
	} ) ).isRequired,
	onChange: PropTypes.func.isRequired,
	value: PropTypes.string,
	wrapperStyle: PropTypes.object,
	disabled: PropTypes.bool,
};

export default PromptActionSelection;
