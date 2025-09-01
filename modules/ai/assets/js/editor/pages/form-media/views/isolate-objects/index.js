import { Box, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import GenerateSubmit from '../../components/generate-submit';
import ImageForm from '../../components/image-form';
import ImagesDisplay from '../../components/images-display';
import SingleImagePreview from '../../components/single-image-preview';
import { useEditImage } from '../../context/edit-image-context';
import useImageActions from '../../hooks/use-image-actions';
import useIsolateObject from './hooks/use-isolate-objects';
import useImageSize from '../../hooks/use-image-size';
import { useRequestIds } from '../../../../context/requests-ids';
import usePromptSettings, { IMAGE_BACKGROUND_COLOR, IMAGE_RATIO } from '../../hooks/use-prompt-settings';
import ColorInput from '../../components/color-picker';
import { useMemo } from 'react';
import { FEATURE_IDENTIFIER } from '../../constants';

const IsolateObject = () => {
	const { editImage } = useEditImage();
	const { setGenerate } = useRequestIds();
	const { use, edit, isLoading: isUploading } = useImageActions();
	const { settings, updateSettings } = usePromptSettings();

	const { data, send, isLoading: isGenerating, error } = useIsolateObject();

	const isLoading = isGenerating || isUploading;

	const { width, height } = useImageSize( editImage.aspectRatio );

	const generatedAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ settings ] );
	const generatedBgColor = useMemo( () => settings[ IMAGE_BACKGROUND_COLOR ], [ settings ] );

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();

		send( {
			image: editImage,
			settings: {
				[ IMAGE_RATIO ]: generatedAspectRatio,
				[ IMAGE_BACKGROUND_COLOR ]: generatedBgColor,
			},
			featureIdentifier: FEATURE_IDENTIFIER.ISOLATE_OBJECT,
		} );
	};

	return (
		<View>
			<View.Panel>
				<View.BackButton />

				<View.PanelHeading
					primary={ __( 'Isolate Object', 'elementor' ) }
					secondary={ __( 'Remove the background, center your object, and add a drop shadow for a clean look.', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>
					<Stack gap={ 2 } sx={ { my: 2.5 } }>
						<ColorInput
							label={ __( 'Background Color', 'elementor' ) }
							color={ generatedBgColor }
							onChange={ ( color ) => updateSettings( { [ IMAGE_BACKGROUND_COLOR ]: color } ) }
							disabled={ isLoading }
						/>
						<GenerateSubmit disabled={ isLoading } loading={ isLoading }>
							{ __( 'Isolate Object', 'elementor' ) }
						</GenerateSubmit>
					</Stack>
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
								/>
							</SingleImagePreview>
						</Box>
					)
				}
			</View.Content>
		</View>
	);
};

export default IsolateObject;
