import { useState, useMemo } from 'react';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import Gallery from '../../components/gallery';
import ImageForm from '../../components/image-form';
import PromptField from '../../components/prompt-field';
import ImageTypeSelect from '../../components/image-type-select';
import ImageStyleSelect from '../../components/image-style-select';
import ImageRatioSelect from '../../components/image-ratio-select';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import NewPromptButton from '../../components/new-prompt-button';
import GenerateImagesSubmit from '../../components/generate-images-submit';
import ImagesDisplay from '../../components/images-display';
import ImageActions from '../../components/image-actions';
import usePromptSettings, { IMAGE_TYPE, IMAGE_STYLE, IMAGE_RATIO } from '../../hooks/use-prompt-settings';
import useSuggestedImages from './hooks/use-suggested-images';
import useImageActions from '../../hooks/use-image-actions';
import { useGlobalSettings } from '../../context/global-settings-context';
import {
	ACTION_TYPES,
	useSubscribeOnPromptHistoryAction,
} from '../../../../components/prompt-history/context/prompt-history-action-context';
import PromptLibraryLink from '../../../../components/prompt-library-link';
import { useRequestIds } from '../../../../context/requests-ids';
import PropTypes from 'prop-types';
import ImagesPlaceholder from '../variations/components/images-placeholder';

const getPromptPlaceholder = ( images ) => {
	if ( ! images?.length ) {
		return __( 'describe your image', 'elementor' );
	}

	const randomImage = images[ Math.floor( Math.random() * images.length ) ];

	return randomImage.prompt;
};

const Generate = ( { textToImageHook, predefinedPrompt = '', initialSettings = {} } ) => {
	const [ prompt, setPrompt ] = useState( predefinedPrompt );
	const { setGenerate } = useRequestIds();
	const { initialImageType } = useGlobalSettings();

	const { settings, updateSettings, resetSettings } = usePromptSettings( { type: initialImageType, ...initialSettings } );

	const {
		imagesData: suggestedImages,
		isLoading: isPreloading,
	} = useSuggestedImages( { selectedType: settings[ IMAGE_TYPE ] } );

	const promptPlaceholder = getPromptPlaceholder( suggestedImages );

	const { data: generatedImages, setResult, send, isLoading: isGenerating, error, reset } = textToImageHook( {} );

	const { use, edit, isLoading: isUploading } = useImageActions();

	const isLoading = isPreloading || isGenerating || isUploading;

	// The aspect ratio in the content view should only be updated when the generated images are updated.
	const generateAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ generatedImages?.result ] );

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();
		if ( ! settings[ IMAGE_STYLE ] ) {
			settings[ IMAGE_STYLE ] = 'general';
		}
		send( { prompt, settings } );
	};

	const handleCopyPrompt = ( { prompt: selectedPrompt, imageType } ) => {
		setPrompt( selectedPrompt );

		const [ type, style ] = imageType.split( '/' );

		updateSettings( { [ IMAGE_TYPE ]: type, [ IMAGE_STYLE ]: style } );
	};

	useSubscribeOnPromptHistoryAction( [
		{
			type: ACTION_TYPES.RESTORE,
			handler( action ) {
				handleCopyPrompt( {
					prompt: action.data?.prompt,
					imageType: action.data?.imageType || '',
				} );

				updateSettings( { [ IMAGE_RATIO ]: action.data?.ratio } );

				setResult( action.data?.images, action.id );
			},
		},
	] );

	return (
		<View>
			<View.Panel>
				<View.PanelHeading
					primary={ __( 'Imagine anything create everything', 'elementor' ) }
					secondary={ __( 'Generate images by selecting the desired type and style, and entering a prompt.', 'elementor' ) }
				/>

				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }

				<ImageForm onSubmit={ handleSubmit }>

					<PromptField
						data-testid="e-image-prompt"
						value={ prompt }
						disabled={ isLoading }
						placeholder={ promptPlaceholder }
						onChange={ setPrompt }
					/>

					<ImageTypeSelect
						disabled={ isLoading }
						value={ settings[ IMAGE_TYPE ] }
						onChange={ ( event ) => updateSettings( { [ IMAGE_TYPE ]: event.target.value } ) }
					/>

					<ImageStyleSelect
						type={ settings[ IMAGE_TYPE ] }
						value={ settings[ IMAGE_STYLE ] }
						disabled={ isLoading || ( ! settings[ IMAGE_TYPE ] || false ) }
						onChange={ ( event ) => updateSettings( { [ IMAGE_STYLE ]: event.target.value } ) }
					/>

					<ImageRatioSelect
						disabled={ isLoading }
						value={ settings[ IMAGE_RATIO ] }
						onChange={ ( event ) => updateSettings( { [ IMAGE_RATIO ]: event.target.value } ) }
					/>

					{
						generatedImages?.result
							? (
								<Stack gap={ 2 } sx={ { my: 2.5 } }>
									<GenerateAgainSubmit disabled={ isLoading || '' === prompt } />

									<NewPromptButton disabled={ isLoading } onClick={ () => {
										resetSettings();
										setPrompt( '' );
										reset();
									} } />
								</Stack>
							)
							: <GenerateImagesSubmit disabled={ isLoading || '' === prompt } />
					}
				</ImageForm>
			</View.Panel>

			<View.Content isLoading={ isPreloading || isUploading } isGenerating={ isGenerating }>
				{
					generatedImages?.result ? (
						<ImagesDisplay
							images={ generatedImages?.result }
							aspectRatio={ generateAspectRatio }
							onUseImage={ use }
							onEditImage={ edit }
						/>
					)
						: (
							<>
								{ predefinedPrompt ? <ImagesPlaceholder />
									: ( <>
										<View.ContentHeading
											primary={ __( 'Spark your imagination with images generated by our community', 'elementor' ) }
										/>
										<Stack sx={ { mb: 3 } }>
											<PromptLibraryLink libraryLink="https://go.elementor.com/ai-prompt-library-image/" />
										</Stack>

										<Gallery cols={ 3 }>
											{
												suggestedImages?.map( ( suggestedPrompt ) => (
													<Gallery.Image
														variant="thumbnail"
														key={ suggestedPrompt.prompt }
														alt={ suggestedPrompt.prompt }
														text={ suggestedPrompt.prompt }
														src={ suggestedPrompt.thumbnailUrl }
													>
														<ImageActions>
															<ImageActions.UseImage onClick={ () => use( suggestedPrompt ) } fullWidth />
															<ImageActions.CopyIcon
																onClick={ () => handleCopyPrompt( suggestedPrompt ) } />
															<ImageActions.EditIcon onClick={ () => edit( suggestedPrompt ) } />
														</ImageActions>
													</Gallery.Image>
												) )
											}
										</Gallery>
									</> ) }
							</>
						)
				}
			</View.Content>
		</View>
	);
};

Generate.propTypes = {
	predefinedPrompt: PropTypes.string,
	textToImageHook: PropTypes.func,
	initialSettings: PropTypes.object,
};

export default Generate;
