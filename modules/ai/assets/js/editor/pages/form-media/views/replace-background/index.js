import View from '../../components/view';
import GenerateSubmit from '../../components/generate-submit';
import ImageForm from '../../components/image-form';
import ImagesDisplay from '../../components/images-display';
import SingleImagePreview from '../../components/single-image-preview';
import { useEditImage } from '../../context/edit-image-context';
import useImageActions from '../../hooks/use-image-actions';
import useReplaceBackground from './hooks/use-replace-background';
import { useState } from 'react';
import PromptField from '../../components/prompt-field';

const RemoveBackground = () => {
	const [ prompt, setPrompt ] = useState( '' );

	const { editImage } = useEditImage();

	const { use, edit, isLoading: isUploading } = useImageActions();

	const { data, send, isLoading: isGenerating, error } = useReplaceBackground();

	const isLoading = isGenerating || isUploading;

	const handleSubmit = ( event ) => {
		event.preventDefault();

		send( prompt, editImage );
	};

	return (
		<View>
			<View.Panel>
				<View.BackButton />

				<View.PanelHeading
					primary={ __( 'Replace Background', 'elementor' ) }
					secondary={ __( 'Generate a new background with a prompt.', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>
					<PromptField
						value={ prompt }
						disabled={ isLoading }
						onChange={ setPrompt }
						placeholder={ __( 'Describe what you want to generate in the background (English only)', 'elementor' ) }
					/>

					<GenerateSubmit disabled={ isLoading || '' === prompt } >
						{ __( 'Replace Background', 'elementor' ) }
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

export default RemoveBackground;
