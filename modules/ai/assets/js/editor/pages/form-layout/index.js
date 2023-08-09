import { useState, useRef, useEffect } from 'react';
import { Box, Stack, Divider, Button } from '@elementor/ui';
import GenerateSubmit from '../form-media/components/generate-submit';
import EnhanceButton from '../form-media/components/enhance-button';
import PromptErrorMessage from '../../components/prompt-error-message';
import useLayoutPrompt from './hooks/use-layout-prompt';
import usePromptEnhancer from '../form-media/hooks/use-image-prompt-enhancer';
import SkeletonPlaceholders from './components/skeleton-placeholders';
import ScreenshotContainer from './components/screenshot-container';
import PromptAutocomplete from './components/prompt-autocomplete';
import UnsavedChangesAlert from './components/unsaved-changes-alert';
import LayoutDialog from './components/layout-dialog';

const SCREENSHOT_HEIGHT = '138px';

const PROMPT_SUGGESTIONS = Object.freeze( [
	{ text: __( 'Create a hero section with', 'elementor' ), group: __( 'Layout Type', 'elementor' ) },
	{ text: __( 'I need a services section divided into three columns', 'elementor' ), group: __( 'Layout Type', 'elementor' ) },
	{ text: __( 'Create a contact us section in one line that also includes a title and', 'elementor' ), group: __( 'Layout Type', 'elementor' ) },
	{ text: __( 'Two columns divided into third and two-thirds', 'elementor' ), group: __( 'Layout Structure', 'elementor' ) },
	// eslint-disable-next-line @wordpress/i18n-translator-comments
	{ text: __( 'Three columns 20% 20% 60%', 'elementor' ), group: __( 'Layout Structure', 'elementor' ) },
] );

const FormLayout = ( { onClose, onInsert, onGenerationStart, onGenerationEnd, onSelect, DialogHeaderProps = {}, DialogContentProps = {} } ) => {
	const { data: templatesData, isLoading: isGeneratingTemplates, error, send, sendUsageData } = useLayoutPrompt();

	const [ prompt, setPrompt ] = useState( '' );

	const { isEnhancing, enhance } = usePromptEnhancer();

	const [ screenshotsData, setScreenshotsData ] = useState( [] );

	const [ selectedScreenshotIndex, setSelectedScreenshotIndex ] = useState( -1 );

	const [ isTakingScreenshots, setIsTakingScreenshots ] = useState( false );

	const [ showUnsavedChangesAlert, setShowUnsavedChangesAlert ] = useState( false );

	const lastRun = useRef( () => {} );

	const isLoading = isGeneratingTemplates || isTakingScreenshots;

	const selectedTemplate = screenshotsData[ selectedScreenshotIndex ]?.template;

	const hasUnsavedChanges = prompt !== '' || templatesData?.length > 0;

	const { children: dialogContentChildren, ...dialogContentProps } = DialogContentProps;

	const onCloseIntent = () => {
		if ( hasUnsavedChanges ) {
			return setShowUnsavedChangesAlert( true );
		}

		onClose();
	};

	const handleSubmit = ( event ) => {
		event.preventDefault();

		if ( '' === prompt.trim() ) {
			return;
		}

		onGenerationStart();

		lastRun.current = () => send( prompt );

		lastRun.current();
	};

	const handleEnhance = () => {
		enhance( prompt ).then( ( { result } ) => setPrompt( result ) );
	};

	const applyTemplate = () => {
		sendUsageData();

		onInsert( selectedTemplate );

		onClose();
	};

	useEffect( () => {
		if ( templatesData?.result ) {
			setIsTakingScreenshots( true );
			setSelectedScreenshotIndex( -1 );

			const templates = templatesData?.result.elements;

			onGenerationEnd( templates ).then( ( generatedData ) => {
				setScreenshotsData( generatedData );
				setIsTakingScreenshots( false );
				setSelectedScreenshotIndex( 0 );
			} );
		}
	}, [ templatesData ] );

	useEffect( () => {
		if ( -1 === selectedScreenshotIndex ) {
			return;
		}

		onSelect( selectedTemplate );
	}, [ selectedScreenshotIndex ] );

	return (
		<LayoutDialog onClose={ onCloseIntent }>
			<LayoutDialog.Header onClose={ onCloseIntent } { ...DialogHeaderProps } />

			<LayoutDialog.Content dividers { ...dialogContentProps }>
				{ dialogContentChildren && (
					<Box sx={ { pt: 5, px: 5, pb: 0 } }>
						{ dialogContentChildren }
					</Box>
				) }

				{ error && (
					<Box sx={ { pt: 5, px: 5, pb: 0 } }>
						<PromptErrorMessage error={ error } onRetry={ lastRun.current } />
					</Box>
				) }

				{ showUnsavedChangesAlert && (
					<UnsavedChangesAlert
						open={ showUnsavedChangesAlert }
						title={ __( 'Leave Layout Generator?', 'elementor' ) }
						text={ __( "The results will be deleted forever and we won't be able to recover them. ", 'elementor' ) }
						onClose={ onClose }
						onCancel={ () => setShowUnsavedChangesAlert( false ) }
					/>
				) }

				<Box component="form" onSubmit={ handleSubmit } sx={ { p: 5 } }>
					<Stack direction="row" alignItems="flex-start" gap={ 3 }>
						<PromptAutocomplete
							value={ prompt }
							disabled={ isLoading }
							onSubmit={ handleSubmit }
							options={ PROMPT_SUGGESTIONS }
							groupBy={ ( option ) => option.group }
							getOptionLabel={ ( option ) => option.text ? option.text + '...' : prompt }
							onChange={ ( _, selectedValue ) => setPrompt( selectedValue.text + ' ' ) }
							renderInput={ ( params ) => (
								<PromptAutocomplete.TextInput
									{ ...params }
									onChange={ ( e ) => setPrompt( e.target.value ) }
									placeholder={ __( "Press '/' for suggested prompts or describe the layout you want to create", 'elementor' ) }
								/>
							) }
						/>

						<EnhanceButton
							size="small"
							disabled={ isLoading || '' === prompt }
							isLoading={ isEnhancing }
							onClick={ enhance }
						/>

						<GenerateSubmit
							fullWidth={ false }
							size="small"
							disabled={ isLoading || '' === prompt }
							sx={ {
								minWidth: '100px',
								// TODO: remove once exist in the UI library.
								borderRadius: ( { border } ) => border.size.md,
							} }
						>
							{ __( 'Generate', 'elementor' ) }
						</GenerateSubmit>
					</Stack>
				</Box>

				{
					( screenshotsData.length > 0 || isLoading ) && (
						<>
							<Divider />

							<Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, p: 5 } }>
								{
									isLoading ? (
										<SkeletonPlaceholders height={ SCREENSHOT_HEIGHT } />
									) : (
										screenshotsData.map( ( { screenshot }, index ) => (
											<ScreenshotContainer
												key={ index }
												height={ SCREENSHOT_HEIGHT }
												selected={ selectedScreenshotIndex === index }
												sx={ { backgroundImage: `url('${ screenshot }')` } }
												onClick={ () => setSelectedScreenshotIndex( index ) }
											/>
										) )
									)
								}
							</Box>

							{
								screenshotsData.length > 0 && (
									<Box sx={ { pt: 0, px: 5, pb: 5 } } display="flex" justifyContent="flex-end">
										<Button
											size="small"
											variant="contained"
											disabled={ isLoading }
											onClick={ applyTemplate }
											sx={ {
											// TODO: remove once exist in the UI library.
												borderRadius: ( { border } ) => border.size.md,
											} }
										>
											{ __( 'Use Layout', 'elementor' ) }
										</Button>
									</Box>
								)
							}
						</>
					)
				}
			</LayoutDialog.Content>
		</LayoutDialog>
	);
};

FormLayout.propTypes = {
	DialogHeaderProps: PropTypes.object,
	DialogContentProps: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onGenerationStart: PropTypes.func.isRequired,
	onGenerationEnd: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
};

export default FormLayout;
