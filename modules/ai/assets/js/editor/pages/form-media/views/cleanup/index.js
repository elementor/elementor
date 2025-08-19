import { __ } from '@wordpress/i18n';
import View from '../../components/view';

import { useState } from 'react';
import { Stack } from '@elementor/ui';
import ImageForm from '../../components/image-form';
import CleanupContent from './cleanup-content';
import GenerateSubmit from '../../components/generate-submit';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import NewPromptButton from '../../components/new-prompt-button';
import ImagesDisplay from '../../components/images-display';
import usePromptSettings from '../../hooks/use-prompt-settings';
import useCleanup from './hooks/use-cleanup';
import { useEditImage } from '../../context/edit-image-context';
import useImageActions from '../../hooks/use-image-actions';
import { useRequestIds } from '../../../../context/requests-ids';

const Cleanup = () => {
	const { setGenerate } = useRequestIds();
	const [ mask, setMask ] = useState( '' );
	const [ isCanvasChanged, setIsCanvasChanged ] = useState( false );
	const { settings, resetSettings } = usePromptSettings();
	const { editImage, width, height } = useEditImage();
	const { use, edit, isLoading: isUploading } = useImageActions();
	const { data, send, isLoading: isGenerating, error, reset } = useCleanup();
	const isLoading = isGenerating || isUploading;

	const handleSubmit = async ( event ) => {
		event.preventDefault();
		setGenerate();
		send( { settings, image: editImage, mask } );
	};
	return (
		<View>
			<View.Panel>
				<View.BackButton />

				<View.PanelHeading
					primary={ __( 'Cleanup', 'elementor' ) }
					secondary={ __( 'Remove unwanted area from your image.', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>
					{
						data?.result ? (
							<Stack gap={ 2 } sx={ { my: 2.5 } }>
								<GenerateAgainSubmit disabled={ isLoading } />

								<NewPromptButton disabled={ isLoading } onClick={ () => {
									resetSettings();
									reset();
								} } />
							</Stack>
						) : (
							<GenerateSubmit disabled={ isLoading || ! isCanvasChanged } />
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
						<CleanupContent
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

export default Cleanup;
