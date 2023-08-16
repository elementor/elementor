import { useState, useRef, useEffect } from 'react';
import { Box, Divider, Button, Pagination } from '@elementor/ui';
import PromptErrorMessage from '../../components/prompt-error-message';
import UnsavedChangesAlert from './components/unsaved-changes-alert';
import LayoutDialog from './components/layout-dialog';
import PromptForm from './components/prompt-form';
import RefreshIcon from '../../icons/refresh-icon';
import Screenshot from './components/screenshot';
import useScreenshots from './hooks/use-screenshots';
import useSlider from './hooks/use-slider';

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

const FormLayout = ( { onClose, onInsert, onGeneration, onSelect, onRegenerate, DialogHeaderProps = {}, DialogContentProps = {} } ) => {
	const { screenshots, generate, regenerate, isLoading, error, abort } = useScreenshots( { onGeneration } );

	const screenshotOutlineOffset = '2px';

	const {
		currentPage,
		setCurrentPage,
		pagesCount,
		sliderStyle,
		trackStyle,
		slideStyle,
		slidesPerPage,
	} = useSlider( {
		slidesCount: screenshots.length,
		translateXFilter: ( value ) => `calc(${ value } - ${ screenshotOutlineOffset })`,
	} );

	const [ selectedScreenshotIndex, setSelectedScreenshotIndex ] = useState( -1 );

	const [ showUnsavedChangesAlert, setShowUnsavedChangesAlert ] = useState( false );

	const [ isPromptEditable, setIsPromptEditable ] = useState( true );

	const lastRun = useRef( () => {} );

	const promptInputRef = useRef( null );

	const selectedTemplate = screenshots[ selectedScreenshotIndex ]?.template;

	const { children: dialogContentChildren, ...dialogContentProps } = DialogContentProps;

	const isPromptFormActive = !! ( isPromptEditable || error );

	const abortAndClose = () => {
		abort();
		onClose();
	};

	const onCloseIntent = () => {
		const hasUnsavedChanges = promptInputRef.current.value.trim() !== '' || screenshots.length > 0;

		if ( hasUnsavedChanges ) {
			return setShowUnsavedChangesAlert( true );
		}

		abortAndClose();
	};

	const handleSubmit = ( event, prompt ) => {
		event.preventDefault();

		if ( '' === prompt.trim() ) {
			return;
		}

		lastRun.current = () => {
			setSelectedScreenshotIndex( -1 );
			generate( prompt );
		};

		lastRun.current();

		setIsPromptEditable( false );
		setCurrentPage( 1 );
	};

	const handleRegenerate = () => {
		setCurrentPage( pagesCount + 1 );
		regenerate( promptInputRef.current.value );
		onRegenerate();
	};

	const handleEnhance = () => {
		enhance( prompt ).then( ( { result } ) => setPrompt( result ) );
	};

	const applyTemplate = () => {
		onInsert( selectedTemplate );

		abortAndClose();
	};

	const handleScreenshotClick = ( index, template ) => {
		return () => {
			if ( isPromptFormActive ) {
				return;
			}

			setSelectedScreenshotIndex( index );
			onSelect( template );
		};
	};

	useEffect( () => {
		const isFirstTemplateExist = screenshots[ 0 ]?.template;

		if ( isFirstTemplateExist ) {
			onSelect( screenshots[ 0 ].template );
			setSelectedScreenshotIndex( 0 );
		}
	}, [ screenshots[ 0 ]?.template ] );

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
						onClose={ abortAndClose }
						onCancel={ () => setShowUnsavedChangesAlert( false ) }
					/>
				) }

				<PromptForm
					ref={ promptInputRef }
					isActive={ isPromptFormActive }
					isLoading={ isLoading }
					showActions={ screenshots.length > 0 || isLoading }
					onSubmit={ handleSubmit }
					onBack={ () => setIsPromptEditable( false ) }
					onEdit={ () => setIsPromptEditable( true ) }
				/>

				{
					( screenshots.length > 0 || isLoading ) && (
						<>
							<Divider />

							<Box sx={ { p: 5, ...sliderStyle } }>
								<Box sx={ trackStyle }>
									{
										screenshots.map( ( { screenshot, template, isPlaceholder }, index ) => (
											<Screenshot
												key={ index }
												url={ screenshot }
												disabled={ isPromptFormActive }
												isPlaceholder={ isPlaceholder }
												isSelected={ selectedScreenshotIndex === index }
												onClick={ handleScreenshotClick( index, template ) }
												outlineOffset={ screenshotOutlineOffset }
												sx={ slideStyle }
											/>
										) )
									}
								</Box>
							</Box>

							{
								screenshots.length > 0 && (
									<Box sx={ { pt: 0, px: 5, pb: 5 } } display="flex" justifyContent="space-between">
										<RegenerateButton onClick={ handleRegenerate } disabled={ isLoading || isPromptFormActive } />

										{
											screenshots.length > slidesPerPage && (
												<Pagination
													page={ currentPage }
													count={ pagesCount }
													onChange={ ( _, page ) => setCurrentPage( page ) }
												/>
											)
										}

										<UseLayoutButton onClick={ applyTemplate } disabled={ isPromptFormActive || -1 === selectedScreenshotIndex } />
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
	onGeneration: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onRegenerate: PropTypes.func.isRequired,
};

export default FormLayout;
