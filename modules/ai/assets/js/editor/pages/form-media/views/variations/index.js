import { useState, useMemo } from 'react';
import { Stack, Box } from '@elementor/ui';
import View from '../../components/view';
import ImageForm from '../../components/image-form';
import ImageStrengthSlider from '../../components/image-strength-slider';
import PromptField from '../../components/prompt-field';
import ImageTypeSelect from '../../components/image-type-select';
import ImageStyleSelect from '../../components/image-style-select';
import ImageRatioSelect from '../../components/image-ratio-select';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import GenerateImagesSubmit from '../../components/generate-images-submit';
import ImagesDisplay from '../../components/images-display';
import VariationsPlaceholder from './components/variations-placeholder';
import useImageToImage from './hooks/use-image-to-image';
import useImageActions from '../../hooks/use-image-actions';
import { useEditImage } from '../../context/edit-image-context';
import usePromptSettings, { IMAGE_STRENGTH, IMAGE_TYPE, IMAGE_STYLE, IMAGE_RATIO } from '../../hooks/use-prompt-settings';

const IMAGE_WEIGHT_DEFAULT = 45;

const Variations = () => {
	const [ prompt, setPrompt ] = useState( '' );

	const { editImage, aspectRatio: initialAspectRatio } = useEditImage();

	const { settings, updateSettings } = usePromptSettings( { aspectRatio: initialAspectRatio, imageWeight: IMAGE_WEIGHT_DEFAULT } );

	const { data, send, isLoading: isGenerating, error } = useImageToImage();

	const { use, edit, isLoading: isUploading } = useImageActions();

	const isLoading = isGenerating || isUploading;

	const generatedAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ data?.result ] );

	const handleSubmit = ( event ) => {
		event.preventDefault();

		send( prompt, settings, editImage );
	};

	return (
		<View>
			<View.Panel>
				<View.BackButton />

				<View.PanelHeading
					primary={ __( 'Variations', 'elementor' ) }
					secondary={ __( 'Create new versions of the original image.', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>
					<Box sx={ {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						bgcolor: 'secondary.background',
					} }>
						<img src={ editImage?.image_url || editImage?.url } alt={ prompt } style={ {
							width: 'auto',
							height: 'auto',
							maxWidth: '100%',
							maxHeight: 166,
							objectFit: 'contained',
						} } />
					</Box>

					<ImageStrengthSlider
						disabled={ isLoading }
						defaultValue={ IMAGE_WEIGHT_DEFAULT }
						onChange={ ( event ) => updateSettings( { [ IMAGE_STRENGTH ]: event.target.value } ) }
					/>

					<PromptField
						value={ prompt }
						disabled={ isLoading }
						placeholder={ __( 'describe your image', 'elementor' ) }
						onChange={ setPrompt }
					/>

					<ImageTypeSelect
						disabled={ isLoading }
						value={ settings[ IMAGE_TYPE ] }
						onChange={ ( event ) => updateSettings( { [ IMAGE_TYPE ]: event.target.value } ) }
					/>

					<ImageStyleSelect
						type={ settings[ IMAGE_TYPE ] }
						value={ settings[ IMAGE_STYLE ] }
						disabled={ isLoading || ( ! settings[ IMAGE_TYPE ] || false ) }
						onChange={ ( event ) => updateSettings( { [ IMAGE_STYLE ]: event.target.value } ) }
					/>

					<ImageRatioSelect
						disabled={ isLoading }
						value={ settings[ IMAGE_RATIO ] }
						onChange={ ( event ) => updateSettings( { [ IMAGE_RATIO ]: event.target.value } ) }
					/>

					<Stack gap={ 5 } sx={ { my: 6 } }>
						{
							data?.result?.length > 0
								? <GenerateAgainSubmit disabled={ isLoading || '' === prompt } />
								: <GenerateImagesSubmit disabled={ isLoading || '' === prompt } />
						}
					</Stack>
				</ImageForm>
			</View.Panel>

			<View.Content isGenerating={ isLoading }>
				{
					data?.result ? (
						<ImagesDisplay
							images={ data.result }
							aspectRatio={ generatedAspectRatio }
							onUseImage={ use }
							onEditImage={ edit }
						/>
					) : (
						<VariationsPlaceholder />
					)
				}
			</View.Content>
		</View>
	);
};

Variations.propTypes = {

};

export default Variations;
