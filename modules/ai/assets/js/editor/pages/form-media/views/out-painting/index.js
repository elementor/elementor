import { useState, useMemo } from 'react';
import { FormControl, Slider, Typography, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import ImageForm from '../../components/image-form';
import ImageRatioSelect from '../../components/image-ratio-select';
import GenerateSubmit from '../../components/generate-submit';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import OutPaintingContent from './out-painting-content';
import ImagesDisplay from '../../components/images-display';
import { useEditImage } from '../../context/edit-image-context';
import useImageActions from '../../hooks/use-image-actions';
import usePromptSettings, { IMAGE_RATIO, IMAGE_ZOOM } from '../../hooks/use-prompt-settings';
import useOutPainting from './hooks/use-out-painting';
import { useRequestIds } from '../../../../context/requests-ids';
import { fetchImageAsBase64 } from '../../utils';

const OutPainting = () => {
	const [ imageSize, setImageSize ] = useState( { width: 0, height: 0 } );
	const [ position, setPosition ] = useState( { x: 0.5, y: 0.5 } );
	const [ mask, setMask ] = useState( '' );

	const { setGenerate } = useRequestIds();
	const { editImage, aspectRatio: initialAspectRatio } = useEditImage();
	const { settings, updateSettings } = usePromptSettings( { aspectRatio: initialAspectRatio } );
	const { use, edit, isLoading: isUploading } = useImageActions();
	const { data, send, isLoading: isGenerating, error } = useOutPainting();
	const isLoading = isGenerating || isUploading;
	const generatedAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ data?.result ] );
	const hasGeneratedResult = !! data?.result;

	const handleSubmit = async ( event ) => {
		event.preventDefault();
		setGenerate();
		const imageBase64 = await fetchImageAsBase64( editImage.url );
		send( { settings, image: editImage, mask, size: imageSize, position, image_base64: imageBase64 } );
	};

	return (
		<View>
			<View.Panel>
				<View.BackButton />

				<View.PanelHeading
					primary={ __( 'Expand Image', 'elementor' ) }
					secondary={ __( 'Position image in it’s new size to generate content around the edges.', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>
					<ImageRatioSelect
						disabled={ isLoading || hasGeneratedResult }
						value={ settings[ IMAGE_RATIO ] }
						onChange={ ( event ) => updateSettings( { [ IMAGE_RATIO ]: event.target.value } ) }
					/>

					<FormControl sx={ { width: '100%', mb: 2.5 } }>
						<Slider
							marks
							id="zoom"
							name="zoom"
							max={ 1 }
							min={ 0.1 }
							step={ 0.1 }
							color="secondary"
							defaultValue={ 1 }
							disabled={ isLoading || hasGeneratedResult }
							valueLabelDisplay="auto"
							aria-labelledby="image-size-slider"
							aria-label={ __( 'Reference strength', 'elementor' ) }
							onChange={ ( _, value ) => updateSettings( { [ IMAGE_ZOOM ]: value } ) }
						/>

						<Typography id="image-size-slider" variant="caption" gutterBottom>
							{ __( 'Original image size', 'elementor' ) }
						</Typography>
					</FormControl>

					{
						data?.result ? (
							<Stack gap={ 2 } sx={ { my: 2.5 } }>
								<GenerateAgainSubmit disabled={ isLoading } />
							</Stack>
						) : (
							<GenerateSubmit disabled={ isLoading } />
						)
					}
				</ImageForm>
			</View.Panel>

			<View.Content isGenerating={ isLoading }>
				{
					hasGeneratedResult ? (
						<ImagesDisplay
							onUseImage={ use }
							onEditImage={ edit }
							images={ data.result }
							aspectRatio={ generatedAspectRatio }
						/>
					) : (
						<OutPaintingContent
							setMask={ setMask }
							editImage={ editImage }
							scale={ settings[ IMAGE_ZOOM ] }
							aspectRatio={ settings[ IMAGE_RATIO ] }
							setImageSize={ setImageSize }
							setPosition={ setPosition }
						/>
					)
				}
			</View.Content>
		</View>
	);
};

export default OutPainting;
