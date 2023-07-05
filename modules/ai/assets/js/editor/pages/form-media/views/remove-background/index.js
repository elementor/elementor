import { Box } from '@elementor/ui';
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

const RemoveBackground = () => {
	const { editImage } = useEditImage();

	const { use, edit, isLoading: isUploading } = useImageActions();

	const { data, send, isLoading: isGenerating, error } = useRemoveBackground();

	const { navigate } = useLocation();

	const isLoading = isGenerating || isUploading;

	const handleSubmit = ( event ) => {
		event.preventDefault();
		send( editImage );
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
						<NewPromptButton disabled={ isLoading } onClick={ () => navigate( LOCATIONS.GENERATE ) } />
					) : (
						<GenerateSubmit disabled={ isLoading } >
							{ __( 'Remove Background', 'elementor' ) }
						</GenerateSubmit>
					) }
				</ImageForm>
			</View.Panel>

			<View.Content isGenerating={ isLoading }>
				{
					data?.result ? (
						<Box sx={ {
							backgroundImage: 'linear-gradient(45deg, #bbb 25%, transparent 25%), linear-gradient(-45deg, #bbb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #bbb 75%), linear-gradient(-45deg, transparent 75%, #bbb 75%)',
							backgroundSize: '20px 20px',
							backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
						} }>
							<ImagesDisplay
								onUseImage={ use }
								onEditImage={ edit }
								images={ data.result }
								aspectRatio={ editImage.aspectRatio }
							/>
						</Box>
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

export default RemoveBackground;
