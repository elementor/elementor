import { useState } from 'react';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import ImageForm from '../../components/image-form';
import PromptField from '../../components/prompt-field';
import InPaintingContent from './in-painting-content';
import GenerateSubmit from '../../components/generate-submit';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import NewPromptButton from '../../components/new-prompt-button';
import ImagesDisplay from '../../components/images-display';
import usePromptSettings from '../../hooks/use-prompt-settings';
import useInPainting from './hooks/use-in-painting';
import { useEditImage } from '../../context/edit-image-context';
import useImageActions from '../../hooks/use-image-actions';
import { useRequestIds } from '../../../../context/requests-ids';

const InPainting = () => {
	const [ prompt, setPrompt ] = useState( '' );
	const { setGenerate } = useRequestIds();
	const [ mask, setMask ] = useState( '' );
	const [ isCanvasChanged, setIsCanvasChanged ] = useState( false );
	const { settings, resetSettings } = usePromptSettings();
	const { editImage, width, height } = useEditImage();
	const { use, edit, isLoading: isUploading } = useImageActions();
	const { data, send, isLoading: isGenerating, error, reset } = useInPainting();
	const isLoading = isGenerating || isUploading;

	const handleSubmit = async ( event ) => {
		event.preventDefault();

		// The fallback instruction should be hidden for the user.
		const finalPrompt = prompt || 'Remove object and fill based on the surroundings';
		setGenerate();
		send( { prompt: finalPrompt, settings, image: editImage, mask } );
	};

	return (
		<View>
			<View.Panel>
				<View.BackButton />

				<View.PanelHeading
					primary={ __( 'Generative Fill', 'elementor' ) }
					secondary={ __( 'Mark an area and edit it with a prompt.', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>
					<PromptField
						value={ prompt }
						disabled={ isLoading }
						onChange={ setPrompt }
						placeholder={ __( 'Describe what you want to generate in the marked area (English only)', 'elementor' ) }
					/>

					{
						data?.result ? (
							<Stack gap={ 2 } sx={ { my: 2.5 } }>
								<GenerateAgainSubmit disabled={ isLoading } />

								<NewPromptButton disabled={ isLoading } onClick={ () => {
									resetSettings();
									setPrompt( '' );
									reset();
								} } />
							</Stack>
						) : (
							<GenerateSubmit disabled={ isLoading || ! prompt || ! isCanvasChanged } />
						)
					}
				</ImageForm>
			</View.Panel>

			<View.Content isGenerating={ isLoading }>
				{
					data?.result ? (
						<ImagesDisplay
							images={ data.result }
							aspectRatio={ editImage.aspectRatio }
							onUseImage={ use }
							onEditImage={ edit }
						/>
					) : (
						<InPaintingContent
							editImage={ editImage }
							width={ width }
							height={ height }
							setMask={ setMask }
							setIsCanvasChanged={ setIsCanvasChanged }
						/>
					)
				}
			</View.Content>
		</View>
	);
};

export default InPainting;
