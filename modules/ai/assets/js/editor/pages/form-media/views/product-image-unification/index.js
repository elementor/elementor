import { useMemo, useState } from 'react';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import ImageForm from '../../components/image-form';
import ImagesDisplay from '../../components/images-display';
import useImageActions from '../../hooks/use-image-actions';
import { useEditImage } from '../../context/edit-image-context';
import usePromptSettings, { IMAGE_RATIO } from '../../hooks/use-prompt-settings';
import { useRequestIds } from '../../../../context/requests-ids';
import ImagesPlaceholder from '../variations/components/images-placeholder';
import useProductImageUnification from './hooks/use-produc-image-unification';
import ImageRatioSelect from '../../components/image-ratio-select';
import ColorInput from '../../components/color-picker';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import GenerateSubmit from '../../components/generate-submit';

const ProductImageUnification = () => {
	const [ prompt ] = useState( '' );
	const { setGenerate } = useRequestIds();
	const { editImage, aspectRatio: initialAspectRatio } = useEditImage();
	const { settings, updateSettings } = usePromptSettings( { aspectRatio: initialAspectRatio } );
	const { data, send, isLoading: isGenerating, error } = useProductImageUnification( );
	const { use, edit, isLoading: isUploading } = useImageActions();
	const isLoading = isGenerating || isUploading;
	const generatedAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ data?.result ] );
	const [ backgroundColor, setBackgroundColor ] = useState( '#FFFFFF' );

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();
		send( { prompt, settings: { ...settings, backgroundColor, imageRatio: settings.imageRatio }, image: editImage } );
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
							color={ backgroundColor }
							onChange={ ( c ) => setBackgroundColor( c ) }
						/>
						<ImageRatioSelect
							disabled={ isLoading }
							value={ settings[ IMAGE_RATIO ] }
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

export default ProductImageUnification;
