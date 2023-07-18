import { useEffect, useState } from 'react';
import { Box } from '@elementor/ui';
import useImagePrompt from '../../hooks/use-image-prompt';
import useImageUpload from '../../hooks/use-image-upload';
import useImagePromptSettings from '../../hooks/use-image-prompt-settings';
import useImageScreenPanel from '../../hooks/use-image-screen-panel';
import { SCREENS, PANELS, IMAGE_PROMPT_SETTINGS, IMAGE_PROMPT_CATEGORIES, IMAGE_ASPECT_RATIO_DIMENSIONS } from './consts/consts';
import { Screen } from './screens/screen';
import { PanelContent } from './panel-content/panel-content';
import Panel from '../../components/ui/panel';
import { getAspectRatioSizes } from './utils';

const FormMedia = (
	{
		onClose,
		getControlValue,
		additionalOptions,
		controlView,
		credits,
		setHasUnsavedChanges,
	},
) => {
	const initialValue = getControlValue() === additionalOptions?.defaultValue ? { id: '', url: '' } : getControlValue();
	const [ editImage, setEditImage ] = useState( initialValue );
	const { screen, setScreen, panel, setPanel } = useImageScreenPanel(
		initialValue?.id !== '' ? SCREENS.IMAGE_EDITOR : SCREENS.GALLERY,
		'' === initialValue.id && '' === editImage.id ? PANELS.TEXT_TO_IMAGE : PANELS.TOOLS,
	);
	const [ prompt, setPrompt ] = useState( '' );
	const [ maskImage, setMaskImage ] = useState( '' );
	const { promptSettings, updatePromptSettings, resetPromptSettings } = useImagePromptSettings( {
		style: '' === initialValue.id ? ( additionalOptions?.defaultImageType || IMAGE_PROMPT_CATEGORIES[ 1 ].key ) : '',
	} );
	const [ images, setImages ] = useState( [] );
	const [ insertToControl, setInsertToControl ] = useState( false );
	const { data, isLoading, error, send, sendUsageData, reset } = useImagePrompt( {
		result: initialValue,
		credits,
		responseId: false,
	} );
	const { attachmentData, isUploading, uploadError, upload, resetUpload } = useImageUpload();

	const [ shouldWaitForInitialImage, setShouldWaitForInitialImage ] = useState( () => !! editImage?.url );

	const panelActive = ! isLoading && ! isUploading && ! shouldWaitForInitialImage;

	const currentAspectRatio = promptSettings[ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ];

	const viewData = {
		width: IMAGE_ASPECT_RATIO_DIMENSIONS[ currentAspectRatio ].width,
		height: IMAGE_ASPECT_RATIO_DIMENSIONS[ currentAspectRatio ].height,
		ratio: currentAspectRatio,
	};

	const setTool = ( tool ) => {
		const newPanel = tool || PANELS.TOOLS;
		let newScreen = SCREENS.IMAGE_EDITOR;
		switch ( tool ) {
			case PANELS.IMAGE_TO_IMAGE:
				newScreen = SCREENS.VARIATIONS;
				break;
			case PANELS.IN_PAINTING:
				newScreen = SCREENS.IN_PAINTING;
				break;
			case PANELS.OUT_PAINTING:
				newScreen = SCREENS.OUT_PAINTING;
				break;
			case PANELS.UPSCALE:
				newScreen = SCREENS.IMAGE_EDITOR;
				break;
		}
		setPanel( newPanel );
		setScreen( newScreen );
	};

	const setAttachment = () => {
		setHasUnsavedChanges( false );
		sendUsageData();
		controlView.setSettingsModel( attachmentData.image );
		controlView.applySavedValue();
		onClose();
	};

	// Get ratio from image
	useEffect( () => {
		if ( ! editImage?.url ) {
			return;
		}

		setShouldWaitForInitialImage( true );

		const img = new Image();

		img.src = editImage.url;

		img.onload = () => {
			const { ratio } = getAspectRatioSizes( img.width, img.height );

			updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ]: ratio } );
			setShouldWaitForInitialImage( false );
		};
	}, [ editImage ] );

	// Image Generation
	useEffect( () => {
		if ( ! isLoading && data?.result && Array.isArray( data?.result ) ) {
			setImages( data?.result );
			setScreen( SCREENS.GENERATE_RESULTS );
		}
	}, [ isLoading ] );

	// Image Upload and set attachment
	useEffect( () => {
		if ( ! isUploading && attachmentData?.image?.id ) {
			if ( insertToControl ) {
				setAttachment( attachmentData.image );
			} else {
				setEditImage( attachmentData.image );
				setPanel( PANELS.TOOLS );
				setScreen( SCREENS.IMAGE_EDITOR );
			}
		}
	}, [ isUploading ] );

	const maybeUploadImage = ( imageToUpload, setAsAttachment = false ) => {
		if ( ! imageToUpload ) {
			return;
		}

		if ( setAsAttachment ) {
			setInsertToControl( true );
		}

		// Image already uploaded
		if ( editImage?.image?.seed && editImage?.image?.seed === imageToUpload?.seed ) {
			if ( setAsAttachment ) {
				// Remove inner image property used to avoid duplicate uploads
				const { image, ...attachment } = editImage;
				return setAttachment( attachment );
			}
			setPanel( PANELS.TOOLS );
			updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ]: '1:1' } );
		}

		// Normalize object to match the upload function
		if ( imageToUpload?.imageUrl ) {
			imageToUpload = {
				...imageToUpload,
				image_url: imageToUpload.imageUrl,
				use_gallery_image: true,
			};
		}

		upload( { image: { ...imageToUpload }, prompt: prompt || imageToUpload.prompt } );
	};

	const submitPrompt = ( promptType, userPrompt, mask = null ) => {
		reset();
		resetUpload();
		setHasUnsavedChanges( true );

		if ( PANELS.TEXT_TO_IMAGE === promptType ) {
			return send( userPrompt, promptSettings );
		}

		if ( PANELS.IN_PAINTING === promptType ) {
			return send( userPrompt, promptSettings, editImage, PANELS.IN_PAINTING, mask );
		}

		if ( PANELS.OUT_PAINTING === promptType ) {
			return send( userPrompt, promptSettings, true, PANELS.OUT_PAINTING, maskImage );
		}

		if ( PANELS.UPSCALE === promptType ) {
			return send( null, promptSettings, editImage, PANELS.UPSCALE );
		}

		return send( prompt, promptSettings, editImage );
	};

	const generateNewPrompt = () => {
		setPrompt( '' );
		setImages( [] );
		setMaskImage( null );
		setEditImage( { id: '', url: '' } );
		resetPromptSettings();
		setScreen( SCREENS.GALLERY );
		setPanel( PANELS.TEXT_TO_IMAGE );
		setHasUnsavedChanges( false );
		reset();
		resetUpload();
	};

	return (
		<Box display="flex" sx={ { overflowY: 'auto' } } height="100%">
			<Box position="relative">
				<Panel>
					<PanelContent { ...{
						error: error || uploadError,
						prompt,
						setPrompt,
						panelActive,
						generateNewPrompt,
						promptSettings,
						updatePromptSettings,
						submitPrompt,
						panel,
						editImage,
						images,
						setTool,
						maskImage,
						reset,
						viewData,
					} } />
				</Panel>
			</Box>

			<Screen { ...{
				isUploading,
				isLoading,
				screen,
				images,
				promptSettings,
				updatePromptSettings,
				generateNewPrompt,
				maybeUploadImage,
				setPrompt,
				editImage,
				setMaskImage,
				viewData,
				shouldWaitForInitialImage,
			} } />
		</Box>
	);
};

FormMedia.propTypes = {
	getControlValue: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	additionalOptions: PropTypes.object,
	controlView: PropTypes.object,
	credits: PropTypes.number,
	setHasUnsavedChanges: PropTypes.func.isRequired,
};

export default FormMedia;
