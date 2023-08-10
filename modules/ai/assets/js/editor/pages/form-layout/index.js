import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Divider, Button } from '@elementor/ui';
import PromptErrorMessage from '../../components/prompt-error-message';
import useLayoutPrompt from './hooks/use-layout-prompt';
import UnsavedChangesAlert from './components/unsaved-changes-alert';
import LayoutDialog from './components/layout-dialog';
import ScreenshotsDisplay from './components/screenshots-display';
import PromptForm from './components/prompt-form';
import RefreshIcon from '../../icons/refresh-icon';

const RegenerateButton = ( props ) => (
	<Button
		size="small"
		color="secondary"
		startIcon={ <RefreshIcon /> }
		sx={ {
			// TODO: remove once exist in the UI library.
			borderRadius: ( { border } ) => border.size.md,
		} }
		{ ...props }
	>
		{ __( 'Regenerate', 'elementor' ) }
	</Button>
);

const UseLayoutButton = ( props ) => (
	<Button
		size="small"
		variant="contained"
		sx={ {
			// TODO: remove once exist in the UI library.
			borderRadius: ( { border } ) => border.size.md,
		} }
		{ ...props }
	>
		{ __( 'Use Layout', 'elementor' ) }
	</Button>
);

const FormLayout = ( { onClose, onInsert, onGenerationStart, onGenerationEnd, onSelect, DialogHeaderProps = {}, DialogContentProps = {} } ) => {
	const { data: templatesData, isLoading: isGeneratingTemplates, error, send, sendUsageData } = useLayoutPrompt();

	const [ screenshotsData, setScreenshotsData ] = useState( [] );

	const [ selectedScreenshotIndex, setSelectedScreenshotIndex ] = useState( -1 );

	const [ isTakingScreenshots, setIsTakingScreenshots ] = useState( false );

	const [ showUnsavedChangesAlert, setShowUnsavedChangesAlert ] = useState( false );

	const [ isPromptEditable, setIsPromptEditable ] = useState( true );

	const lastRun = useRef( () => {} );

	const promptInputRef = useRef( null );

	const isLoading = isGeneratingTemplates || isTakingScreenshots;

	const selectedTemplate = screenshotsData[ selectedScreenshotIndex ]?.template;

	const { children: dialogContentChildren, ...dialogContentProps } = DialogContentProps;

	const isPromptFormActive = !! ( isPromptEditable || error );

	const onCloseIntent = () => {
		const hasUnsavedChanges = promptInputRef.current.value !== '' || templatesData?.result.elements.length > 0;

		if ( hasUnsavedChanges ) {
			return setShowUnsavedChangesAlert( true );
		}

		onClose();
	};

	const handleSubmit = ( event, prompt ) => {
		event.preventDefault();

		if ( '' === prompt.trim() ) {
			return;
		}

		onGenerationStart();

		lastRun.current = () => send( prompt );

		lastRun.current();

		setIsPromptEditable( false );
	};

	const handleEnhance = () => {
		enhance( prompt ).then( ( { result } ) => setPrompt( result ) );
	};

	const applyTemplate = () => {
		sendUsageData();

		onInsert( selectedTemplate );

		onClose();
	};

	const handleScreenshotClick = useCallback( ( index ) => {
		if ( isPromptFormActive ) {
			return;
		}

		setSelectedScreenshotIndex( index );
	}, [ isPromptFormActive ] );

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

				<PromptForm
					ref={ promptInputRef }
					isActive={ isPromptFormActive }
					isLoading={ isLoading }
					showActions={ screenshotsData.length > 0 || isLoading }
					onSubmit={ handleSubmit }
					onBack={ () => setIsPromptEditable( false ) }
					onEdit={ () => setIsPromptEditable( true ) }
				/>

				{
					( screenshotsData.length > 0 || isLoading ) && (
						<>
							<Divider />

							<ScreenshotsDisplay
								isLoading={ isLoading }
								screenshotsData={ screenshotsData }
								disabled={ isPromptFormActive }
								selectedIndex={ selectedScreenshotIndex }
								onClick={ handleScreenshotClick }
							/>

							{
								screenshotsData.length > 0 && (
									<Box sx={ { pt: 0, px: 5, pb: 5 } } display="flex" justifyContent="space-between">
										<RegenerateButton onClick={ lastRun.current } disabled={ isLoading || isPromptFormActive } />

										<UseLayoutButton onClick={ applyTemplate } disabled={ isLoading || isPromptFormActive } />
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
