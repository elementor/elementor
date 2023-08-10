import { useState, useRef } from 'react';
import { Box, Stack, InputAdornment, IconButton } from '@elementor/ui';
import PromptAutocomplete from './prompt-autocomplete';
import EnhanceButton from '../../form-media/components/enhance-button';
import GenerateSubmit from '../../form-media/components/generate-submit';
import ArrowLeftIcon from '../../../icons/arrow-left-icon';
import EditIcon from '../../../icons/edit-icon';
import usePromptEnhancer from '../../form-media/hooks/use-image-prompt-enhancer';

const PROMPT_SUGGESTIONS = Object.freeze( [
	{ text: __( 'Create a hero section with', 'elementor' ), group: __( 'Layout Type', 'elementor' ) },
	{ text: __( 'I need a services section divided into three columns', 'elementor' ), group: __( 'Layout Type', 'elementor' ) },
	{ text: __( 'Create a contact us section in one line that also includes a title and', 'elementor' ), group: __( 'Layout Type', 'elementor' ) },
	{ text: __( 'Two columns divided into third and two-thirds', 'elementor' ), group: __( 'Layout Structure', 'elementor' ) },
	// eslint-disable-next-line @wordpress/i18n-translator-comments
	{ text: __( 'Three columns 20% 20% 60%', 'elementor' ), group: __( 'Layout Structure', 'elementor' ) },
] );

const BackButton = ( props ) => (
	<IconButton size="small" color="secondary" { ...props }>
		<ArrowLeftIcon />
	</IconButton>
);

const EditButton = ( props ) => (
	<IconButton size="small" color="primary" { ...props }>
		<EditIcon />
	</IconButton>
);

const GenerateButton = ( props ) => (
	<GenerateSubmit
		size="small"
		fullWidth={ false }
		sx={ {
			minWidth: '100px',
			// TODO: remove once exist in the UI library.
			borderRadius: ( { border } ) => border.size.md,
		} }
		{ ...props }
	>
		{ __( 'Generate', 'elementor' ) }
	</GenerateSubmit>
);

const PromptForm = ( { isActive, isLoading, showActions = false, onSubmit, onBack, onEdit } ) => {
	const [ prompt, setPrompt ] = useState( '' );
	const { isEnhancing, enhance } = usePromptEnhancer();
	const previousPrompt = useRef( '' );

	return (
		<Box component="form" onSubmit={ ( e ) => onSubmit( e, prompt ) } sx={ { p: 5 } }>
			<Stack direction="row" alignItems="flex-start" gap={ 3 }>
				<PromptAutocomplete
					size="small"
					value={ prompt }
					disabled={ isLoading || ! isActive }
					onSubmit={ ( e ) => onSubmit( e, prompt ) }
					options={ PROMPT_SUGGESTIONS }
					groupBy={ ( option ) => option.group }
					getOptionLabel={ ( option ) => option.text ? option.text + '...' : prompt }
					onChange={ ( _, selectedValue ) => setPrompt( selectedValue.text + ' ' ) }
					renderInput={ ( params ) => (
						<PromptAutocomplete.TextInput
							{ ...params }
							onChange={ ( e ) => setPrompt( e.target.value ) }
							placeholder={ __( "Press '/' for suggested prompts or describe the layout you want to create", 'elementor' ) }
							InputProps={ {
								...params.InputProps,
								startAdornment: showActions && (
									<InputAdornment position="start">
										{
											isActive ? (
												<BackButton
													disabled={ isLoading }
													onClick={ () => {
														setPrompt( previousPrompt.current );
														onBack();
													} }
												/>
											) : (
												<EditButton
													disabled={ isLoading }
													onClick={ () => {
														previousPrompt.current = prompt;
														onEdit();
													} }
												/>
											)
										}
									</InputAdornment>
								),
							} }
						/>
					) }
				/>

				<EnhanceButton
					size="small"
					disabled={ isLoading || ! isActive || '' === prompt }
					isLoading={ isEnhancing }
					onClick={ enhance }
				/>

				<GenerateButton disabled={ isLoading || ! isActive || '' === prompt } />
			</Stack>
		</Box>
	);
};

PromptForm.propTypes = {
	isActive: PropTypes.bool,
	isLoading: PropTypes.bool,
	showActions: PropTypes.bool,
	onSubmit: PropTypes.func.isRequired,
	onBack: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
};

export default PromptForm;
