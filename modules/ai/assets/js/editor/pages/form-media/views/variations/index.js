import { useState, useMemo } from 'react';
import { Stack, Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import ImageForm from '../../components/image-form';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import GenerateImagesSubmit from '../../components/generate-images-submit';
import ImagesDisplay from '../../components/images-display';
import ImagesPlaceholder from './components/images-placeholder';
import useImageToImage from './hooks/use-image-to-image';
import useImageActions from '../../hooks/use-image-actions';
import { useEditImage } from '../../context/edit-image-context';
import usePromptSettings, { IMAGE_RATIO } from '../../hooks/use-prompt-settings';
import { useRequestIds } from '../../../../context/requests-ids';

const IMAGE_WEIGHT_DEFAULT = 45;

const Variations = () => {
	const [ prompt ] = useState( '' );
	const { setGenerate } = useRequestIds();
	const { editImage, aspectRatio: initialAspectRatio } = useEditImage();

	const { settings } = usePromptSettings( {
		aspectRatio: initialAspectRatio,
		imageWeight: IMAGE_WEIGHT_DEFAULT,
	} );

	const { data, send, isLoading: isGenerating, error } = useImageToImage();

	const { use, edit, isLoading: isUploading } = useImageActions();

	const isLoading = isGenerating || isUploading;

	const generatedAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ data?.result ] );

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();
		send( { prompt, settings, image: editImage } );
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
						bgcolor: 'action.selected',
					} }>
						<img src={ editImage?.image_url || editImage?.url } alt={ prompt } style={ {
							width: 'auto',
							height: 'auto',
							maxWidth: '100%',
							maxHeight: 166,
							objectFit: 'contained',
						} } />
					</Box>

					<Stack gap={ 2 } sx={ { my: 2.5 } }>
						{
							data?.result?.length > 0
								? <GenerateAgainSubmit disabled={ isLoading } />
								: <GenerateImagesSubmit disabled={ isLoading } />
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
						<ImagesPlaceholder />
					)
				}
			</View.Content>
		</View>
	);
};

Variations.propTypes = {};

export default Variations;
