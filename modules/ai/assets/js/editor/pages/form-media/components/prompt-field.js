import { InputAdornment } from '@elementor/ui';
import Textarea from '../../../components/textarea';
import EnhanceButton from './enhance-button';
import usePromptEnhancer from '../hooks/use-image-prompt-enhancer';

const PromptField = ( { disabled, onChange, ...props } ) => {
	const { enhance, isEnhancing } = usePromptEnhancer( props.value );

	return (
		<Textarea
			minRows={ 3 }
			maxRows={ 6 }
			InputProps={ {
				endAdornment: (
					<InputAdornment
						position="end"
						sx={ {
							position: 'absolute',
							bottom: '24px',
							right: '8px',
						} }
					>
						<EnhanceButton
							isLoading={ isEnhancing }
							disabled={ disabled || isEnhancing || ! props.value }
							onClick={ () => {
								enhance( prompt )
									.then( ( { result } ) => onChange( result ) );
							} }
						/>
					</InputAdornment>
				),
			} }
			sx={ {
				'& .MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline': {
					pb: 9,
					width: '89%',
				},
			} }
			onKeyDown={ ( event ) => {
				if ( 'Tab' === event.key ) {
					event.preventDefault();
					onChange( props.placeholder );
				}
			} }
			{ ...props }
			onChange={ ( event ) => onChange( event.target.value ) }
			disabled={ disabled || isEnhancing }
		/>
	);
};

PromptField.propTypes = {
	value: PropTypes.string,
	disabled: PropTypes.bool,
	placeholder: PropTypes.string,
	onChange: PropTypes.func.isRequired,
};

export default PromptField;
