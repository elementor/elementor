import { useMemo } from 'react';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import ImageForm from '../../components/image-form';
import useImageActions from '../../hooks/use-image-actions';
import { useEditImage } from '../../context/edit-image-context';
import usePromptSettings, { IMAGE_BACKGROUND_COLOR, IMAGE_RATIO } from '../../hooks/use-prompt-settings';
import { useRequestIds } from '../../../../context/requests-ids';
import useProductImageUnification from './hooks/use-produc-image-unification';
import ImageRatioSelect from '../../components/image-ratio-select';
import ColorInput from '../../components/color-picker';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import GenerateSubmit from '../../components/generate-submit';
import ImagesDisplay from '../../components/images-display';

const ProductImageUnification = () => {
	const { setGenerate } = useRequestIds();
	const { editImage } = useEditImage();
	const { settings, updateSettings } = usePromptSettings( );
	const { data, send, isLoading: isGenerating, error } = useProductImageUnification( );
	const { use, edit, isLoading: isUploading } = useImageActions();
	const isLoading = isGenerating || isUploading;
	const generatedAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ settings ] );
	const generatedBgColor = useMemo( () => settings[ IMAGE_BACKGROUND_COLOR ], [ settings ] );

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();
		send( { settings: { [ IMAGE_RATIO ]: settings[ IMAGE_RATIO ], [ IMAGE_BACKGROUND_COLOR ]: settings[ IMAGE_BACKGROUND_COLOR ] }, urls: editImage.urls } );
	};

	const getCols = ( dataLength = 1 ) => {
		return Math.min( Math.ceil( Math.sqrt( dataLength ?? 1 ) ), 4 );
	};

	return (
		<View>
			<View.Panel>
				<View.PanelHeading
					primary={ __( 'Unify images', 'elementor' ) }
					secondary={ __( 'Select a set of parameters and AI will automate your adjustments:', 'elementor' ) }
				/>
				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }
				<ImageForm onSubmit={ handleSubmit }>
					<Stack gap={ 2 } sx={ { my: 2.5 } }>
						<ColorInput
							label={ __( 'Background Color', 'elementor' ) }
							color={ generatedBgColor }
							onChange={ ( color ) => updateSettings( { [ IMAGE_BACKGROUND_COLOR ]: color } ) }
						/>
						<ImageRatioSelect
							disabled={ isLoading }
							value={ generatedAspectRatio }
							onChange={ ( event ) => updateSettings( { [ IMAGE_RATIO ]: event.target.value } ) }
						/>
						<Stack gap={ 2 } sx={ { my: 2.5 } }>
							{
								data?.result ? (
									<GenerateAgainSubmit disabled={ isLoading } />
								) : (
									<GenerateSubmit disabled={ isLoading } />
								)
							}
						</Stack>
					</Stack>

				</ImageForm>
			</View.Panel>
			<View.Content isGenerating={ isLoading }>
				{
					data?.result ? (
						<ImagesDisplay
							images={ data.result }
							onUseImage={ use }
							onEditImage={ edit }
							cols={ getCols( data.result?.length ) }
						/>
					) : (
						<ImagesDisplay
							images={ editImage.urls }
							cols={ getCols( editImage.urls?.length ?? 1 ) }
						/>
					)
				}
			</View.Content>
		</View>
	);
};

export default ProductImageUnification;
