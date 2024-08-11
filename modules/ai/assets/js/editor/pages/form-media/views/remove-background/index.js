import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import GenerateSubmit from '../../components/generate-submit';
import ImageForm from '../../components/image-form';
import ImagesDisplay from '../../components/images-display';
import SingleImagePreview from '../../components/single-image-preview';
import { useEditImage } from '../../context/edit-image-context';
import useImageActions from '../../hooks/use-image-actions';
import useRemoveBackground from './hooks/use-remove-background';
import NewPromptButton from '../../components/new-prompt-button';
import { LOCATIONS } from '../../constants';
import { useLocation } from '../../context/location-context';
import useImageSize from '../../hooks/use-image-size';
import { useRequestIds } from '../../../../context/requests-ids';

const RemoveBackground = () => {
	const { editImage } = useEditImage();
	const { setGenerate } = useRequestIds();
	const { use, edit, isLoading: isUploading } = useImageActions();

	const { data, send, isLoading: isGenerating, error } = useRemoveBackground();

	const { navigate } = useLocation();

	const isLoading = isGenerating || isUploading;

	const { width, height } = useImageSize( editImage.aspectRatio );

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();
		send( { image: editImage } );
	};

	return (
		<View>
			<View.Panel>
				<View.BackButton />

				<View.PanelHeading
					primary={ __( 'Remove Background', 'elementor' ) }
					secondary={ __( 'Create an image of the subject with a transparent background', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>
					{ data?.result ? (
						<NewPromptButton
							variant="contained"
							disabled={ isLoading }
							onClick={ () => navigate( LOCATIONS.GENERATE ) } />
					) : (
						<GenerateSubmit disabled={ isLoading }>
							{ __( 'Remove Background', 'elementor' ) }
						</GenerateSubmit>
					) }
				</ImageForm>
			</View.Panel>

			<View.Content isGenerating={ isLoading }>
				{
					data?.result ? (
						<Box>
							<ImagesDisplay
								transparentContainer={ true }
								onUseImage={ use }
								onEditImage={ edit }
								images={ data.result }
								aspectRatio={ editImage.aspectRatio }
							/>
						</Box>
					) : (
						<Box>
							<SingleImagePreview>
								<SingleImagePreview.Image
									src={ editImage.url }
									alt={ editImage.alt }
									style={ { width, height } }
								>
								</SingleImagePreview.Image>
							</SingleImagePreview>
						</Box>
					)
				}
			</View.Content>
		</View>
	);
};

export default RemoveBackground;
