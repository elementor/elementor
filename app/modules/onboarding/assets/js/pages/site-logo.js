/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useContext, useEffect, useState, useCallback } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';
import useAjax from 'elementor-app/hooks/use-ajax';
import DropZone from 'elementor-app/organisms/drop-zone';
import UnfilteredFilesDialog from 'elementor-app/organisms/unfiltered-files-dialog';

import Layout from '../components/layout/layout';
import PageContentLayout from '../components/layout/page-content-layout';

export default function SiteLogo() {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext ),
		[ file, setFile ] = useState( state.siteLogo.id ? state.siteLogo : null ),
		[ isUploading, setIsUploading ] = useState( false ),
		[ showUnfilteredFilesDialog, setShowUnfilteredFilesDialog ] = useState( false ),
		[ fileSource, setFileSource ] = useState(),
		[ noticeState, setNoticeState ] = useState( null ),
		{ ajaxState: updateLogoAjaxState, setAjax: setUpdateLogoAjax } = useAjax(),
		{ ajaxState: uploadImageAjaxState, setAjax: setUploadImageAjax } = useAjax(),
		pageId = 'siteLogo',
		nextStep = 'goodToGo',
		navigate = useNavigate(),
		actionButton = {
			role: 'button',
			onClick: () => {
				elementorCommon.events.dispatchEvent( {
					event: 'next',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
					},
				} );

				if ( file.id ) {
					if ( file.id !== state.siteLogo.id ) {
						updateSiteLogo();
					} else {
						// If the currently displayed logo is already set as the site logo, just go to the next screen.
						const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'completed' );

						updateState( stateToUpdate );

						navigate( 'onboarding/' + nextStep );
					}
				}
			},
		};

	let skipButton;

	if ( 'completed' !== state.steps[ pageId ] ) {
		skipButton = {
			text: __( 'Skip', 'elementor' ),
		};
	}

	if ( isUploading ) {
		actionButton.text = (
			<>
				<i className="eicon-loading eicon-animation-spin" aria-hidden="true" />
			</>
		);
	} else {
		actionButton.text = __( 'Next', 'elementor' );
	}

	if ( ! file ) {
		actionButton.className = 'e-onboarding__button--disabled';
	}

	const updateSiteLogo = useCallback( () => {
		setIsUploading( true );

		setUpdateLogoAjax( {
			data: {
				action: 'elementor_update_site_logo',
				data: JSON.stringify( {
					attachmentId: file.id,
				} ),
			},
		} );
	}, [ file ] );

	const uploadSiteLogo = ( fileToUpload ) => {
		setIsUploading( true );

		setUploadImageAjax( {
			data: {
				action: 'elementor_upload_site_logo',
				fileToUpload,
			},
		} );
	};

	const dismissUnfilteredFilesCallback = () => {
		setIsUploading( false );

		setFile( null );

		setShowUnfilteredFilesDialog( false );
	};

	const onFileSelect = ( selectedFile ) => {
		setFileSource( 'drop' );

		if ( 'image/svg+xml' === selectedFile.type && ! elementorAppConfig.onboarding.isUnfilteredFilesEnabled ) {
			setFile( selectedFile );

			setIsUploading( true );

			setShowUnfilteredFilesDialog( true );
		} else {
			setFile( selectedFile );

			setNoticeState( null );

			uploadSiteLogo( selectedFile );
		}
	};

	const onImageRemoveClick = () => {
		elementorCommon.events.dispatchEvent( {
			event: 'remove selected logo',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
			},
		} );

		setFile( null );
	};

	/**
	 * Ajax Callbacks
	 */
	// Run the callback for the new image upload AJAX request.
	useEffect( () => {
		if ( 'initial' !== uploadImageAjaxState.status ) {
			if ( 'success' === uploadImageAjaxState.status && uploadImageAjaxState.response?.imageAttachment?.id ) {
				elementorCommon.events.dispatchEvent( {
					event: 'logo image uploaded',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						source: fileSource,
					},
				} );

				setIsUploading( false );

				setFile( uploadImageAjaxState.response.imageAttachment );

				if ( noticeState ) {
					setNoticeState( null );
				}
			} else if ( 'error' === uploadImageAjaxState.status ) {
				setIsUploading( false );

				setFile( null );

				elementorCommon.events.dispatchEvent( {
					event: 'indication prompt',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						action_state: 'failure',
						action: 'logo image upload',
					},
				} );

				setNoticeState( {
					type: 'error',
					icon: 'eicon-warning',
					message: 'That didn\'t work. Try uploading your file again.',
				} );
			}
		}
	}, [ uploadImageAjaxState.status ] );

	// Run the callback for the site logo update AJAX request.
	useEffect( () => {
		if ( 'initial' !== updateLogoAjaxState.status ) {
			if ( 'success' === updateLogoAjaxState.status && updateLogoAjaxState.response?.siteLogoUpdated ) {
				elementorCommon.events.dispatchEvent( {
					event: 'logo image updated',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						source: fileSource,
					},
				} );

				setIsUploading( false );

				if ( noticeState ) {
					setNoticeState( null );
				}

				const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'completed' );

				stateToUpdate.siteLogo = {
					id: file.id,
					url: file.url,
				};

				updateState( stateToUpdate );

				navigate( 'onboarding/' + nextStep );
			} else if ( 'error' === updateLogoAjaxState.status ) {
				setIsUploading( false );

				elementorCommon.events.dispatchEvent( {
					event: 'indication prompt',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
						action_state: 'failure',
						action: 'update site logo',
					},
				} );

				setNoticeState( {
					type: 'error',
					icon: 'eicon-warning',
					message: 'That didn\'t work. Try uploading your file again.',
				} );
			}
		}
	}, [ updateLogoAjaxState.status ] );

	return (
		<Layout pageId={ pageId } nextStep={ nextStep }>
			<PageContentLayout
				image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Setup.svg' }
				title={ __( 'Have a logo? Add it here.', 'elementor' ) }
				actionButton={ actionButton }
				skipButton={ skipButton }
				noticeState={ noticeState }
			>
				<span>
					{ __( 'Otherwise, you can skip this and add one later.', 'elementor' ) }
				</span>
				{ ( file && ! showUnfilteredFilesDialog )
					? (
						<div className={ 'e-onboarding__logo-container' + ( isUploading ? ' e-onboarding__is-uploading' : '' ) }>
							<div className="e-onboarding__logo-remove" onClick={ () => onImageRemoveClick() }>
								<i className="eicon-trash-o" />
							</div>
							<img src={ file.url } alt={ __( 'Potential Site Logo', 'elementor' ) } />
						</div>
					)
					: <>
						<DropZone
							className="e-onboarding__drop-zone"
							heading={ __( 'Drop image here', 'elementor' ) }
							secondaryText={ __( 'or', 'elementor' ) }
							buttonText={ __( 'Open Media Library', 'elementor' ) }
							buttonVariant="outlined"
							buttonColor="cta"
							icon={ '' }
							type="wp-media"
							filetypes={ [ 'jpg', 'jpeg', 'png', 'svg' ] }
							onFileSelect={ ( selectedFile ) => onFileSelect( selectedFile ) }
							onWpMediaSelect={ ( frame ) => {
								// Get media attachment details from the frame state
								var attachment = frame.state().get( 'selection' ).first().toJSON();

								setFileSource( 'browse' );
								setFile( attachment );

								setNoticeState( null );
							} }
							onButtonClick={ () => {
								elementorCommon.events.dispatchEvent( {
									event: 'browse file click',
									version: '',
									details: {
										placement: elementorAppConfig.onboarding.eventPlacement,
										step: state.currentStep,
									},
								} );
							} }
							// TODO: DEAL WITH ERROR
							onError={ ( error ) => {
								if ( 'file_not_allowed' === error.id ) {
									elementorCommon.events.dispatchEvent( {
										event: 'indication prompt',
										version: '',
										details: {
											placement: elementorAppConfig.onboarding.eventPlacement,
											step: state.currentStep,
											action_state: 'failure',
											action: 'logo upload format',
										},
									} );

									setNoticeState( {
										type: 'error',
										icon: 'eicon-warning',
										message: __( 'This file type is not supported. Try a different type of file', 'elementor' ),
									} );
								}
							} }
						/>
					</>
				}
				{
					<UnfilteredFilesDialog
						show={ showUnfilteredFilesDialog }
						setShow={ setShowUnfilteredFilesDialog }
						confirmModalText={ __( 'This allows Elementor to scan your SVGs for malicious content. If you do not wish to allow this, use a different image format.', 'elementor' ) }
						errorModalText={ __( 'There was a problem with enabling SVG uploads. Try again, or use another image format.', 'elementor' ) }
						onReady={ () => {
							setShowUnfilteredFilesDialog( false );

							elementorAppConfig.onboarding.isUnfilteredFilesEnabled = true;

							uploadSiteLogo( file );
						} }
						onDismiss={ () => dismissUnfilteredFilesCallback() }
						onCancel={ () => dismissUnfilteredFilesCallback() }
					/>
				}
			</PageContentLayout>
		</Layout>
	);
}
