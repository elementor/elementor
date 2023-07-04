import View from '../../components/view';
import GenerateSubmit from '../../components/generate-submit';
import ImageForm from '../../components/image-form';
import ImagesDisplay from '../../components/images-display';
import SingleImagePreview from '../../components/single-image-preview';
import { useEditImage } from '../../context/edit-image-context';
import useImageActions from '../../hooks/use-image-actions';
import useRemoveText from './hooks/use-remove-text';

const RemoveText = () => {
	const { editImage, width: initialEditImageWidth } = useEditImage();

	const { use, edit, isLoading: isUploading } = useImageActions();

	const { data, send, isLoading: isGenerating, error } = useRemoveText();

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
					primary={ __( 'Remove Text', 'elementor' ) }
					secondary={ __( 'Remove Text from image', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>
					<GenerateSubmit disabled={ isLoading } >
						{ __( 'Remove Text', 'elementor' ) }
					</GenerateSubmit>
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

export default RemoveText;
