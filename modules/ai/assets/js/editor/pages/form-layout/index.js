import { useState, useRef, useEffect } from 'react';
import {
	Box,
	Divider,
	Button,
	Pagination,
	IconButton,
	Collapse,
	Tooltip,
	withDirection,
	CircularProgress,
} from '@elementor/ui';
import PromptErrorMessage from '../../components/prompt-error-message';
import UnsavedChangesAlert from './components/unsaved-changes-alert';
import LayoutDialog from './components/layout-dialog';
import PromptForm from './components/prompt-form';
import RefreshIcon from '../../icons/refresh-icon';
import Screenshot from './components/screenshot';
import useScreenshots from './hooks/use-screenshots';
import useSlider from './hooks/use-slider';
import MinimizeDiagonalIcon from '../../icons/minimize-diagonal-icon';
import ExpandDiagonalIcon from '../../icons/expand-diagonal-icon';

const DirectionalMinimizeDiagonalIcon = withDirection( MinimizeDiagonalIcon );
const DirectionalExpandDiagonalIcon = withDirection( ExpandDiagonalIcon );

const RegenerateButton = ( props ) => (
	<Button
		size="small"
		color="secondary"
		startIcon={ <RefreshIcon /> }
		{ ...props }
	>
		{ __( 'Regenerate', 'elementor' ) }
	</Button>
);

const UseLayoutButton = ( { isLoading, disabled, ...props } ) => (
	<Button
		size="small"
		variant="contained"
		disabled={ disabled || isLoading }
		{ ...props }
	>
		{ isLoading
			? <CircularProgress />
			: __( 'Use Layout', 'elementor' )
		}
	</Button>
);

UseLayoutButton.propTypes = {
	sx: PropTypes.object,
	isLoading: PropTypes.bool,
	disabled: PropTypes.bool,
};

const FormLayout = ( { onClose, onInsert, onData, onSelect, onGenerate, DialogHeaderProps = {}, DialogContentProps = {} } ) => {
	const { screenshots, generate, regenerate, isLoading, error, abort } = useScreenshots( { onData } );

	const [ isInserting, setIsInserting ] = useState( false );

	const screenshotOutlineOffset = '2px';

	const {
		currentPage,
		setCurrentPage,
		pagesCount,
		gapPercentage,
		slidesPerPage,
		offsetXPercentage,
		slideWidthPercentage,
	} = useSlider( { slidesCount: screenshots.length } );

	const [ selectedScreenshotIndex, setSelectedScreenshotIndex ] = useState( -1 );

	const [ showUnsavedChangesAlert, setShowUnsavedChangesAlert ] = useState( false );

	const [ isPromptEditable, setIsPromptEditable ] = useState( true );

	const [ isMinimized, setIsMinimized ] = useState( false );

	const lastRun = useRef( () => {} );

	const promptInputRef = useRef( null );

	const selectedTemplate = screenshots[ selectedScreenshotIndex ]?.template;

	const { children: dialogContentChildren, ...dialogContentProps } = DialogContentProps;

	// When there are no screenshots the prompt field should be editable.
	const shouldFallbackToEditPrompt = !! ( error && 0 === screenshots.length );

	const isPromptFormActive = isPromptEditable || shouldFallbackToEditPrompt;

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

	const handleGenerate = ( event, prompt ) => {
		event.preventDefault();

		if ( '' === prompt.trim() ) {
			return;
		}

		onGenerate();

		lastRun.current = () => {
			setSelectedScreenshotIndex( -1 );
			generate( prompt );
		};

		lastRun.current();

		setIsPromptEditable( false );
		setCurrentPage( 1 );
	};

	const handleRegenerate = () => {
		lastRun.current = () => {
			regenerate( promptInputRef.current.value );
			// Changing the current page to the next page number.
			setCurrentPage( pagesCount + 1 );
		};

		lastRun.current();
	};

	const applyTemplate = async () => {
		screenshots[ selectedScreenshotIndex ].sendUsageData();

		setIsInserting( true );

		await onInsert( selectedTemplate );

		setIsInserting( false );

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
			<LayoutDialog.Header onClose={ onCloseIntent } { ...DialogHeaderProps }>
				{ DialogHeaderProps.children }

				<Tooltip title={ isMinimized ? __( 'Expand', 'elementor' ) : __( 'Minimize', 'elementor' ) }>
					<IconButton
						size="small"
						aria-label="minimize"
						onClick={ () => setIsMinimized( ( prev ) => ! prev ) }
					>
						{ isMinimized ? <DirectionalExpandDiagonalIcon /> : <DirectionalMinimizeDiagonalIcon /> }
					</IconButton>
				</Tooltip>
			</LayoutDialog.Header>

			<LayoutDialog.Content dividers { ...dialogContentProps }>
				<Collapse in={ ! isMinimized }>
					{ dialogContentChildren && (
						<Box sx={ { pt: 2, px: 2, pb: 0 } }>
							{ dialogContentChildren }
						</Box>
					) }

					{ error && (
						<Box sx={ { pt: 2, px: 2, pb: 0 } }>
							<PromptErrorMessage error={ error } onRetry={ lastRun.current } />
						</Box>
					) }

					{ showUnsavedChangesAlert && (
						<UnsavedChangesAlert
							open={ showUnsavedChangesAlert }
							title={ __( 'Leave Elementor AI?', 'elementor' ) }
							text={ __( "Your progress will be deleted, and can't be recovered.", 'elementor' ) }
							onClose={ abortAndClose }
							onCancel={ () => setShowUnsavedChangesAlert( false ) }
						/>
					) }

					<PromptForm
						ref={ promptInputRef }
						isActive={ isPromptFormActive }
						isLoading={ isLoading }
						showActions={ screenshots.length > 0 || isLoading }
						onSubmit={ handleGenerate }
						onBack={ () => setIsPromptEditable( false ) }
						onEdit={ () => setIsPromptEditable( true ) }
					/>

					{
						( screenshots.length > 0 || isLoading ) && (
							<>
								<Divider />

								<Box sx={ { p: 1.5 } }>
									<Box sx={ { overflow: 'hidden', p: 0.5 } }>
										<Box
											sx={ {
												display: 'flex',
												transition: 'all 0.4s ease',
												gap: `${ gapPercentage }%`,
												transform: `translateX(${ offsetXPercentage }%)`,
											} }
										>
											{
												screenshots.map( ( { screenshot, template, isError, isPending }, index ) => (
													<Screenshot
														key={ index }
														url={ screenshot }
														disabled={ isPromptFormActive || isInserting }
														isPlaceholder={ isError }
														isLoading={ isPending }
														isSelected={ selectedScreenshotIndex === index }
														onClick={ handleScreenshotClick( index, template ) }
														outlineOffset={ screenshotOutlineOffset }
														sx={ { flex: `0 0 ${ slideWidthPercentage }%` } }
													/>
												) )
											}
										</Box>
									</Box>
								</Box>

								{
									screenshots.length > 0 && (
										<Box sx={ { pt: 0, px: 2, pb: 2 } } display="grid" gridTemplateColumns="repeat(3, 1fr)" justifyItems="center">
											<RegenerateButton
												onClick={ handleRegenerate }
												disabled={ isLoading || isPromptFormActive || isInserting }
												sx={ { justifySelf: 'start' } }
											/>

											{
												screenshots.length > slidesPerPage && (
													<Pagination
														page={ currentPage }
														count={ pagesCount }
														disabled={ isPromptFormActive || isInserting }
														onChange={ ( _, page ) => setCurrentPage( page ) }
													/>
												)
											}

											<UseLayoutButton
												onClick={ applyTemplate }
												disabled={ isPromptFormActive || -1 === selectedScreenshotIndex }
												isLoading={ isInserting }
												sx={ { justifySelf: 'end', gridColumn: 3 } }
											/>
										</Box>
									)
								}
							</>
						)
					}
				</Collapse>
			</LayoutDialog.Content>
		</LayoutDialog>
	);
};

FormLayout.propTypes = {
	DialogHeaderProps: PropTypes.object,
	DialogContentProps: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onData: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onGenerate: PropTypes.func.isRequired,
};

export default FormLayout;
