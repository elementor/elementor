import { Box, Typography, Slider, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import GenerateSubmit from '../../components/generate-submit';
import ImageForm from '../../components/image-form';
import ImagesDisplay from '../../components/images-display';
import SingleImagePreview from '../../components/single-image-preview';
import { useEditImage } from '../../context/edit-image-context';
import useResize from './hooks/use-resize';
import useImageActions from '../../hooks/use-image-actions';
import usePromptSettings, { IMAGE_UPSCALE } from '../../hooks/use-prompt-settings';
import { useRequestIds } from '../../../../context/requests-ids';

const Resize = () => {
	const { editImage, width: initialEditImageWidth } = useEditImage();
	const { setGenerate } = useRequestIds();
	const { use, edit, isLoading: isUploading } = useImageActions();

	const { settings, updateSettings } = usePromptSettings();

	const { data, send, isLoading: isGenerating, error } = useResize();

	const isLoading = isGenerating || isUploading;

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();
		send( { promptSettings: settings, image: editImage } );
	};

	return (
		<View>
			<View.Panel>
				<View.BackButton />

				<View.PanelHeading
					primary={ __( 'Resize', 'elementor' ) }
					secondary={ __( 'Make an image larger and improve it’s resolution.', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>
					<Stack spacing={ 0.2 }>
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography variant="caption">512px</Typography>

							<Typography variant="caption">2048px</Typography>
						</Box>

						<Slider
							marks
							step={ 64 }
							min={ 512 }
							max={ 2048 }
							id="upscale_to"
							color="secondary"
							name="upscale_to"
							disabled={ isLoading }
							defaultValue={ initialEditImageWidth }
							valueLabelDisplay="auto"
							aria-label={ __( 'Upscale to', 'elementor' ) }
							onChange={ ( _, value ) => updateSettings( { [ IMAGE_UPSCALE ]: value } ) }
						/>

						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography variant="caption">{ __( 'Current', 'elementor' ) }</Typography>

							<Typography variant="caption">{ __( 'Output', 'elementor' ) }</Typography>
						</Box>
					</Stack>

					<GenerateSubmit disabled={ isLoading } />
				</ImageForm>
			</View.Panel>

			<View.Content isGenerating={ isLoading }>
				{
					data?.result ? (
						<ImagesDisplay
							onUseImage={ use }
							onEditImage={ edit }
							images={ data.result }
							aspectRatio={ editImage.aspectRatio }
						/>
					) : (
						<SingleImagePreview>
							<SingleImagePreview.Image
								src={ editImage.url }
								alt={ editImage.alt }
								style={ { width: editImage.width, height: editImage.height } }
							/>
						</SingleImagePreview>
					)
				}
			</View.Content>
		</View>
	);
};

export default Resize;
