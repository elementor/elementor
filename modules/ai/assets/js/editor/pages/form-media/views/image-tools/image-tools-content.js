import SingleImagePreview from '../../components/single-image-preview';
import ImageActions from '../../components/image-actions';
import { useEditImage } from '../../context/edit-image-context';
import useImageActions from '../../hooks/use-image-actions';

const ImageToolsContent = () => {
	const { editImage, width, height } = useEditImage();
	const { use } = useImageActions();

	return (
		<SingleImagePreview>
			<SingleImagePreview.Image
				src={ editImage.url }
				style={ { width, height } }
				alt={ editImage.alt || __( 'Image preview', 'elementor' ) }
			>
				<SingleImagePreview.Actions>
					<ImageActions.UseImage onClick={ () => use( editImage ) } />
				</SingleImagePreview.Actions>
			</SingleImagePreview.Image>
		</SingleImagePreview>
	);
};

export default ImageToolsContent;
