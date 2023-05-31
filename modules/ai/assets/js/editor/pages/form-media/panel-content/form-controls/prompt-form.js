import { IMAGE_PROMPT_SETTINGS, IMAGE_PROMPT_CATEGORIES, IMAGE_ASPECT_RATIOS } from '../../consts/consts';
import PromptActionSelection from '../../../../components/prompt-action-selection';
import { FormControl, Slider, Stack, Box, Typography } from '@elementor/ui';
import useSessionStorage from '../../../../hooks/use-session-storage';
import Textarea from '../../../../components/textarea';

const getPromptPlaceholder = ( data ) => {
	if ( ! data?.images?.length ) {
		return __( 'describe your image', 'elementor' );
	}

	const { images } = data;

	const randomImage = images[ Math.floor( Math.random() * images.length ) ];

	return randomImage.prompt;
};

const PromptForm = ( {
	promptSettings,
	updatePromptSettings,
	prompt = '',
	setPrompt,
	panelActive,
	hasImage = false,
	disableAspectRatio = false,
} ) => {
	const selectedCategory = IMAGE_PROMPT_CATEGORIES.find( ( category ) => category.key === promptSettings[ IMAGE_PROMPT_SETTINGS.IMAGE_TYPE ] ) || { subCategories: {} };

	const { data } = useSessionStorage( 'ai-image-gallery' );

	const placeholderInitialValue = getPromptPlaceholder( data );

	const imageType = promptSettings[ IMAGE_PROMPT_SETTINGS.IMAGE_TYPE ];

	const stylePreset = promptSettings[ IMAGE_PROMPT_SETTINGS.STYLE_PRESET ];

	const aspectRatio = promptSettings[ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ];

	return <>
		{
			hasImage && (
				<FormControl sx={ { width: '100%', mb: 6 } }>
					<Slider
						onChange={ ( _, value ) => updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.IMAGE_STRENGTH ]: value } ) }
						id={ 'image_strength' }
						name={ 'image_strength' }
						aria-label={ __( 'Reference strength', 'elementor' ) }
						defaultValue={ 45 }
						getAriaValueText={ ( value ) => `${ value }%` }
						valueLabelDisplay="auto"
						step={ 10 }
						marks
						min={ 0 }
						max={ 100 }
						color="secondary"
					/>

					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Typography variant="caption">{ __( 'Prompt', 'elementor' ) }</Typography>

						<Typography variant="caption">{ __( 'Reference image', 'elementor' ) }</Typography>
					</Box>
				</FormControl>
			)
		}

		<Stack gap={ 6 }>
			<Textarea
				minRows={ 3 }
				maxRows={ 6 }
				disabled={ ! panelActive }
				placeholder={ placeholderInitialValue }
				onChange={ ( event ) => setPrompt( event.target.value ) }
				value={ prompt }
			/>

			<PromptActionSelection
				wrapperStyle={ { width: '100%' } }
				label={ __( 'Image type', 'elementor' ) }
				options={ IMAGE_PROMPT_CATEGORIES.map( ( category ) => ( { label: category.label, value: category.key } ) ) }
				onChange={ ( event ) => updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.IMAGE_TYPE ]: event.target.value } ) }
				value={ imageType }
				disabled={ ! panelActive }
			/>

			<PromptActionSelection
				wrapperStyle={ { width: '100%' } }
				label={ __( 'Style', 'elementor' ) }
				options={ Object.entries( selectedCategory.subCategories ).map( ( [ value, label ] ) => ( { label, value } ) ) }
				onChange={ ( event ) => updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.STYLE_PRESET ]: event.target.value } ) }
				value={ stylePreset }
				disabled={ ! panelActive || ( ! imageType || false ) }
			/>

			<PromptActionSelection
				wrapperStyle={ { width: '100%' } }
				label={ __( 'Aspect ratio', 'elementor' ) }
				options={ Object.entries( IMAGE_ASPECT_RATIOS ).map( ( [ value, label ] ) => ( { label, value } ) ) }
				onChange={ ( event ) => updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ]: event.target.value } ) }
				value={ aspectRatio }
				disabled={ ! panelActive || disableAspectRatio }
			/>
		</Stack>
	</>;
};

PromptForm.propTypes = {
	panelActive: PropTypes.bool,
	prompt: PropTypes.string,
	setPrompt: PropTypes.func,
	promptSettings: PropTypes.object,
	updatePromptSettings: PropTypes.func,
	hasImage: PropTypes.bool,
	disableAspectRatio: PropTypes.bool,
};

export default PromptForm;
