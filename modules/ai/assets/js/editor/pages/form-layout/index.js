import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { Box, Button, Collapse, Divider, IconButton, Pagination, Tooltip, withDirection } from '@elementor/ui';
import PromptErrorMessage from '../../components/prompt-error-message';
import UnsavedChangesAlert from './components/unsaved-changes-alert';
import LayoutDialog from './components/layout-dialog';
import PromptForm from './components/prompt-form';
import RefreshIcon from '../../icons/refresh-icon';
import Screenshot from './components/screenshot';
import useScreenshots from './hooks/use-screenshots';
import useSlider, { MAX_PAGES, SCREENSHOTS_PER_PAGE } from './hooks/use-slider';
import MinimizeDiagonalIcon from '../../icons/minimize-diagonal-icon';
import ExpandDiagonalIcon from '../../icons/expand-diagonal-icon';
import { useConfig } from './context/config';
import { AttachmentPropType } from '../../types/attachment';
import { PromptPowerNotice } from './components/attachments/prompt-power-notice';
import { ATTACHMENT_TYPE_URL } from './components/attachments';
import AttachDialog from './components/attachments/attach-dialog';
import isURL from 'validator/lib/isURL';
import { VoicePromotionAlert } from '../../components/voice-promotion-alert';

const DirectionalMinimizeDiagonalIcon = withDirection( MinimizeDiagonalIcon );
const DirectionalExpandDiagonalIcon = withDirection( ExpandDiagonalIcon );

/**
 * @typedef {Object} Attachment
 * @property {('json')} type        - The type of the attachment, currently only `json` is supported.
 * @property {string}   previewHTML - HTML content as a string, representing a preview.
 * @property {string}   content     - Actual content of the attachment as a string.
 * @property {string}   label       - Label for the attachment.
 */

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

const UseLayoutButton = ( props ) => (
	<Button
		size="small"
		variant="contained"
		{ ...props }
	>
		{ __( 'Use Layout', 'elementor' ) }
	</Button>
);

UseLayoutButton.propTypes = {
	sx: PropTypes.object,
};

const isRegenerateButtonDisabled = ( screenshots, isLoading, isPromptFormActive ) => {
	if ( isLoading || isPromptFormActive ) {
		return true;
	}
	return screenshots.length >= SCREENSHOTS_PER_PAGE * MAX_PAGES;
};

const FormLayout = ( {
	DialogHeaderProps = {},
	DialogContentProps = {},
	attachments: initialAttachments,
} ) => {
	const { attachmentsTypes, onData, onInsert, onSelect, onClose, onGenerate } = useConfig();

	const { screenshots, generate, regenerate, isLoading, error, abort } = useScreenshots( { onData } );

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

	const [ attachments, setAttachments ] = useState( [] );

	const [ shouldRenderWebApp, setShouldRenderWebApp ] = useState( false );

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

		if ( '' === prompt.trim() && 0 === attachments.length ) {
			return;
		}

		if ( isURL( prompt ) ) {
			setShouldRenderWebApp( true );
			return;
		}
		onGenerate();

		lastRun.current = () => {
			setSelectedScreenshotIndex( -1 );
			generate( prompt, attachments );
		};

		lastRun.current();

		setIsPromptEditable( false );
		setCurrentPage( 1 );
	};

	const handleRegenerate = () => {
		lastRun.current = () => {
			regenerate( promptInputRef.current.value, attachments );
			// Changing the current page to the next page number.
			setCurrentPage( pagesCount + 1 );
		};

		lastRun.current();
	};

	const applyTemplate = () => {
		onInsert( selectedTemplate );

		screenshots[ selectedScreenshotIndex ].sendUsageData();

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

	/**
	 * @param {Attachment[]} items
	 */
	const onAttach = ( items ) => {
		items.forEach( ( item ) => {
			if ( ! attachmentsTypes[ item.type ] ) {
				throw new Error( `Invalid attachment type: ${ item.type }` );
			}

			const typeConfig = attachmentsTypes[ item.type ];

			if ( ! item.previewHTML && typeConfig.previewGenerator ) {
				typeConfig.previewGenerator( item.content ).then( ( html ) => {
					item.previewHTML = html;

					setAttachments( ( prev ) => {
						// Replace the attachment with the updated one.
						return prev.map( ( attachment ) => {
							if ( attachment.content === item.content ) {
								return item;
							}

							return attachment;
						} );
					} );
				} );
			}
		} );

		setAttachments( items );
		setShouldRenderWebApp( false );
		setIsPromptEditable( true );
	};

	useEffect( () => {
		const isFirstTemplateExist = screenshots[ 0 ]?.template;

		if ( isFirstTemplateExist ) {
			onSelect( screenshots[ 0 ].template );
			setSelectedScreenshotIndex( 0 );
		}
	}, [ screenshots[ 0 ]?.template ] );

	useEffect( () => {
		if ( initialAttachments?.length ) {
			onAttach( initialAttachments );
		}
	}, [] );

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

					{ attachments.length > 0 && <PromptPowerNotice /> }

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
					{ shouldRenderWebApp && (
						<AttachDialog
							type={ ATTACHMENT_TYPE_URL }
							url={ promptInputRef.current.value }
							onAttach={ onAttach }
							onClose={ () => {
								setShouldRenderWebApp( false );
							} } />
					) }
					<PromptForm
						shouldResetPrompt={ shouldRenderWebApp }
						ref={ promptInputRef }
						isActive={ isPromptFormActive }
						isLoading={ isLoading }
						showActions={ screenshots.length > 0 || isLoading }
						attachmentsTypes={ attachmentsTypes }
						attachments={ attachments }
						onAttach={ onAttach }
						onDetach={ ( index ) => {
							setAttachments( ( prev ) => {
								const newAttachments = [ ...prev ];

								newAttachments.splice( index, 1 );

								return newAttachments;
							} );
							setIsPromptEditable( true );
						} }
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
												screenshots.map( ( { screenshot, type, template, isError, isPending }, index ) => (
													<Screenshot
														key={ index }
														url={ screenshot }
														type={ type }
														disabled={ isPromptFormActive }
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
									<VoicePromotionAlert introductionKey="ai-context-layout-promotion" />
								</Box>

								{
									screenshots.length > 0 && (
										<Box sx={ { pt: 0, px: 2, pb: 2 } } display="grid" gridTemplateColumns="repeat(3, 1fr)" justifyItems="center">
											<RegenerateButton
												onClick={ handleRegenerate }
												disabled={ isRegenerateButtonDisabled( screenshots, isLoading, isPromptFormActive ) }
												sx={ { justifySelf: 'start' } }
											/>

											{
												screenshots.length > slidesPerPage && (
													<Pagination
														page={ currentPage }
														count={ pagesCount }
														disabled={ isPromptFormActive }
														onChange={ ( _, page ) => setCurrentPage( page ) }
													/>
												)
											}

											<UseLayoutButton
												onClick={ applyTemplate }
												disabled={ isPromptFormActive || -1 === selectedScreenshotIndex }
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
	attachments: PropTypes.arrayOf( AttachmentPropType ),
};

export default FormLayout;
