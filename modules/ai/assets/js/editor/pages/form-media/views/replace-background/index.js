import View from '../../components/view';
import { __ } from '@wordpress/i18n';
import GenerateSubmit from '../../components/generate-submit';
import ImageForm from '../../components/image-form';
import ImagesDisplay from '../../components/images-display';
import SingleImagePreview from '../../components/single-image-preview';
import { useEditImage } from '../../context/edit-image-context';
import useImageActions from '../../hooks/use-image-actions';
import useReplaceBackground from './hooks/use-replace-background';
import { useState } from 'react';
import PromptField from '../../components/prompt-field';
import { LOCATIONS } from '../../constants';
import NewPromptButton from '../../components/new-prompt-button';
import { useLocation } from '../../context/location-context';
import { useRequestIds } from '../../../../context/requests-ids';

const ReplaceBackground = () => {
	const [ prompt, setPrompt ] = useState( '' );
	const { setGenerate } = useRequestIds();
	const { editImage } = useEditImage();

	const { use, edit, isLoading: isUploading } = useImageActions();

	const { data, send, isLoading: isGenerating, error } = useReplaceBackground();

	const { navigate } = useLocation();

	const isLoading = isGenerating || isUploading;

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();
		send( { prompt, image: editImage } );
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

					<GenerateSubmit
						disabled={ isLoading || '' === prompt }
						color={ data?.result ? 'secondary' : 'primary' }
					>
						{ data?.result ? __( 'Generate Again', 'elementor' ) : __( 'Replace Background', 'elementor' ) }
					</GenerateSubmit>

					{ data?.result &&
						<NewPromptButton disabled={ isLoading } onClick={ () => navigate( LOCATIONS.GENERATE ) } /> }
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

export default ReplaceBackground;
