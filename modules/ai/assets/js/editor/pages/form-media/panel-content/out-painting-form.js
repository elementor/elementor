import { useEffect, useMemo } from 'react';
import { Stack, Box, Button, Typography, Slider, FormControl, CircularProgress, InputAdornment, IconButton, Tooltip, withDirection } from '@elementor/ui';
import PromptErrorMessage from '../../../components/prompt-error-message';
import { IMAGE_ASPECT_RATIOS, IMAGE_PROMPT_SETTINGS, PANELS } from '../consts/consts';
import PromptActionSelection from '../../../components/prompt-action-selection';
import Textarea from '../../../components/textarea';
import WandIcon from '../../../icons/wand-icon';
import useImagePromptEnhancer from '../../../hooks/use-image-prompt-enhancer';
import ChevronLeftIcon from '../../../icons/chevron-left-icon';

const StyledChevronLeftIcon = withDirection( ChevronLeftIcon );

const OutPaintingForm = ( {
	panelActive,
	prompt = '',
	setPrompt,
	updatePromptSettings,
	submitPrompt,
	error,
	maskImage,
	backToTools,
	viewData,
} ) => {
	const initialAspectRatio = useMemo( () => viewData.ratio, [] );

	const {
		data: imagePromptData,
		isLoading: imagePromptIsLoading,
		send: imagePromptEnhancer,
	} = useImagePromptEnhancer( prompt );

	// Image Prompt Enhancer
	useEffect( () => {
		if ( ! imagePromptIsLoading && imagePromptData?.result ) {
			setPrompt( imagePromptData?.result );
		}
	}, [ imagePromptIsLoading ] );

	const handleSubmit = ( event ) => {
		event.preventDefault();

		const finalPrompt = prompt || 'Fill based on the surroundings';

		submitPrompt( PANELS.OUT_PAINTING, finalPrompt, maskImage );
	};

	return (
		<Box component="form" onSubmit={ handleSubmit }>
			<Box sx={ { mb: 3 } }>
				<Button
					size="small"
					variant="text"
					color="secondary"
					startIcon={ <StyledChevronLeftIcon /> }
					onClick={ ( e ) => {
						e.preventDefault();
						backToTools();

						// Restoring the initial aspect ratio for not affecting other views when the new aspect ratio is not saved.
						if ( initialAspectRatio !== viewData.ratio ) {
							updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ]: initialAspectRatio } );
						}
					} }
				>
					{ __( 'Back', 'elementor' ) }
				</Button>
			</Box>
			<Typography variant="h3" sx={ { mb: 3 } }>
				{ __( 'Expand Image', 'elementor' ) }
			</Typography>
			<Typography variant="body1" color="secondary" sx={ { mb: 8 } }>
				{ __( 'Position image in it’s new size to generate content around the edges.', 'elementor' ) }
			</Typography>

			{ error && <PromptErrorMessage error={ error } sx={ { mb: 6 } } actionPosition="bottom" onRetry={ handleSubmit } /> }

			<Stack gap={ 6 }>
				<PromptActionSelection
					wrapperStyle={ { width: '100%' } }
					label={ __( 'Aspect ratio', 'elementor' ) }
					options={ Object.entries( IMAGE_ASPECT_RATIOS ).map( ( [ value, label ] ) => ( { label, value } ) ) }
					onChange={ ( event ) => {
						updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ]: event.target.value } );
					} }
					value={ viewData.ratio }
					disabled={ ! panelActive }
				/>

				<FormControl sx={ { width: '100%', mb: 6 } }>
					<Slider
						onChange={ ( _, value ) => updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.ZOOM ]: value } ) }
						id={ 'zoom' }
						name={ 'zoom' }
						aria-label={ __( 'Reference strength', 'elementor' ) }
						defaultValue={ 1 }
						valueLabelDisplay="auto"
						step={ 0.1 }
						marks
						min={ 0.1 }
						max={ 2 }
						color="secondary"
						aria-labelledby="image-size-slider"
					/>

					<Typography id="image-size-slider" variant="caption" gutterBottom>
						{ __( 'Original image size', 'elementor' ) }
					</Typography>
				</FormControl>

				<Textarea
					minRows={ 3 }
					maxRows={ 6 }
					disabled={ ! panelActive || imagePromptIsLoading }
					placeholder={ __( 'Describe what you want to generate in the expended area (English only)', 'elementor' ) }
					onChange={ ( event ) => setPrompt( event.target.value ) }
					value={ prompt }
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
								{
									imagePromptIsLoading
										? <CircularProgress color="secondary" size={ 20 } sx={ { mr: 2 } } />
										: <Tooltip title={ __( 'Enhance prompt', 'elementor' ) }>
											<Box component="span" sx={ { cursor: 'pointer' } }>
												<IconButton
													size="small"
													color="secondary"
													onClick={ () => imagePromptEnhancer( prompt ) }
													disabled={ ! panelActive || imagePromptIsLoading || ! prompt }
												>
													<WandIcon />
												</IconButton>
											</Box>
										</Tooltip>
								}
							</InputAdornment>
						),
					} }
					sx={ {
						'& .MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline': {
							pb: 9,
							width: '89%',
						},
					} }
				/>
			</Stack>

			<Stack gap={ 5 } sx={ { my: 6 } }>
				<Button type="submit" variant="contained" disabled={ ! panelActive }>
					{ __( 'Generate', 'elementor' ) }
				</Button>
			</Stack>
		</Box>
	);
};

OutPaintingForm.propTypes = {
	panelActive: PropTypes.bool,
	prompt: PropTypes.string,
	setPrompt: PropTypes.func,
	promptSettings: PropTypes.object,
	updatePromptSettings: PropTypes.func,
	submitPrompt: PropTypes.func,
	error: PropTypes.string,
	maskImage: PropTypes.string,
	backToTools: PropTypes.func,
	viewData: PropTypes.object,
};

export default OutPaintingForm;
