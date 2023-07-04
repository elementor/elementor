import { useState, useMemo } from 'react';
import { FormControl, Slider, Typography, Stack } from '@elementor/ui';
import View from '../../components/view';
import ImageForm from '../../components/image-form';
import ImageRatioSelect from '../../components/image-ratio-select';
import GenerateSubmit from '../../components/generate-submit';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import NewPromptButton from '../../components/new-prompt-button';
import PromptField from '../../components/prompt-field';
import OutPaintingContent from './out-painting-content';
import ImagesDisplay from '../../components/images-display';
import { useEditImage } from '../../context/edit-image-context';
import useImageActions from '../../hooks/use-image-actions';
import usePromptSettings, { IMAGE_RATIO, IMAGE_ZOOM } from '../../hooks/use-prompt-settings';
import useOutPainting from './hooks/use-out-painting';

const OutPainting = () => {
	const [ prompt, setPrompt ] = useState( '' );

	const { editImage, aspectRatio: initialAspectRatio } = useEditImage();

	const [ mask, setMask ] = useState( '' );

	const { settings, updateSettings, resetSettings } = usePromptSettings( { aspectRatio: initialAspectRatio } );

	const { use, edit, isLoading: isUploading } = useImageActions();

	const { data, send, isLoading: isGenerating, error, reset } = useOutPainting();

	const isLoading = isGenerating || isUploading;

	const generatedAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ data?.result ] );

	const hasGeneratedResult = !! data?.result;

	const handleSubmit = ( event ) => {
		event.preventDefault();

		// The fallback instruction should be hidden for the user.
		const finalPrompt = prompt || 'Fill based on the surroundings';

		send( finalPrompt, settings, editImage, mask );
	};

	return (
		<View>
			<View.Panel>
				<View.BackButton />

				<View.PanelHeading
					primary={ __( 'Expand Image', 'elementor' ) }
					secondary={ __( 'Position image in it’s new size to generate content around the edges.', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>
					<ImageRatioSelect
						disabled={ isLoading || hasGeneratedResult }
						value={ settings[ IMAGE_RATIO ] }
						onChange={ ( event ) => updateSettings( { [ IMAGE_RATIO ]: event.target.value } ) }
					/>

					<FormControl sx={ { width: '100%', mb: 6 } }>
						<Slider
							marks
							id="zoom"
							name="zoom"
							max={ 2 }
							min={ 0.1 }
							step={ 0.1 }
							color="secondary"
							defaultValue={ 1 }
							disabled={ isLoading || hasGeneratedResult }
							valueLabelDisplay="auto"
							aria-labelledby="image-size-slider"
							aria-label={ __( 'Reference strength', 'elementor' ) }
							onChange={ ( _, value ) => updateSettings( { [ IMAGE_ZOOM ]: value } ) }
						/>

						<Typography id="image-size-slider" variant="caption" gutterBottom>
							{ __( 'Original image size', 'elementor' ) }
						</Typography>
					</FormControl>

					<PromptField
						value={ prompt }
						disabled={ isLoading }
						onChange={ setPrompt }
						placeholder={ __( 'Describe what you want to generate in the expended area (English only)', 'elementor' ) }
					/>

					{
						data?.result ? (
							<Stack gap={ 5 } sx={ { my: 6 } }>
								<GenerateAgainSubmit disabled={ isLoading } />

								<NewPromptButton disabled={ isLoading } onClick={ () => {
									resetSettings();
									setPrompt( '' );
									reset();
								} } />
							</Stack>
						) : (
							<GenerateSubmit disabled={ isLoading } />
						)
					}
				</ImageForm>
			</View.Panel>

			<View.Content isGenerating={ isLoading }>
				{
					hasGeneratedResult ? (
						<ImagesDisplay
							onUseImage={ use }
							onEditImage={ edit }
							images={ data.result }
							aspectRatio={ generatedAspectRatio }
						/>
					) : (
						<OutPaintingContent
							setMask={ setMask }
							editImage={ editImage }
							scale={ settings[ IMAGE_ZOOM ] }
							aspectRatio={ settings[ IMAGE_RATIO ] }
						/>
					)
				}
			</View.Content>
		</View>
	);
};

export default OutPainting;
