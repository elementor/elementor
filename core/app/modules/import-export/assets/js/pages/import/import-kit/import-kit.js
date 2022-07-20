import { useState, useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ImportContext } from '../../../context/import-context/import-context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ProcessFailedDialog from '../../../shared/process-failed-dialog/process-failed-dialog';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Notice from 'elementor-app/ui/molecules/notice';
import DropZone from 'elementor-app/organisms/drop-zone';
import Button from 'elementor-app/ui/molecules/button';

import useKit from '../../../hooks/use-kit';

import './import-kit.scss';

export default function ImportKit() {
	const sharedContext = useContext( SharedContext ),
		importContext = useContext( ImportContext ),
		navigate = useNavigate(),
		{ kitState, kitActions, KIT_STATUS_MAP } = useKit(),
		[ errorType, setErrorType ] = useState( '' ),
		[ isLoading, setIsLoading ] = useState( false ),
		{ referrer } = sharedContext.data,
		resetImportProcess = () => {
			importContext.dispatch( { type: 'SET_FILE', payload: null } );
			setErrorType( null );
			setIsLoading( false );
			kitActions.reset();
		};

		const getLearnMoreLink = () => (
			<InlineLink
				url="https://go.elementor.com/app-what-are-kits"
				key="learn-more-link"
				italic
				onLinkClick={ () => {
					if ( 'kit-library' === referrer ) {
						$e.run(
							'kit-library/seek-more-info',
							{},
							{
								meta: {
									event: 'learn more',
									source: 'import',
									step: '1',
								},
							},
						)
					}
				} }
			>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		);

	// On load.
	useEffect( () => {
		sharedContext.dispatch( { type: 'SET_INCLUDES', payload: [] } );
	}, [] );

	// Uploading the kit after file is selected.
	useEffect( () => {
		if ( importContext.data.file ) {
			kitActions.upload( { file: importContext.data.file } );
		}
	}, [ importContext.data.file ] );

	// Listening to kit upload state.
	useEffect( () => {
		if ( KIT_STATUS_MAP.UPLOADED === kitState.status ) {
			if ( 'kit library' === referrer ) {
				// elementorCommon.events.eventTracking(
				// 	'kit-library/file-upload',
				// 	{
				// 		placement: 'kit library',
				// 		event: 'top panel info',
				// 	},
				// 	{
				// 		source: 'import',
				// 		step: '1',
				// 		event_type: 'feedback',
				// 		status: 'success',
				// 		method: 'browse/drag-drop', // TODO: Distinguish upload type
				// 	},
				// );
			}
			importContext.dispatch( { type: 'SET_UPLOADED_DATA', payload: kitState.data } );
		} else if ( 'error' === kitState.status ) {
			if ( 'kit library' === referrer ) {
				// elementorCommon.events.eventTracking(
				// 	'kit-library/file-upload',
				// 	{
				// 		placement: 'kit library',
				// 		event: 'top panel info',
				// 	},
				// 	{
				// 		source: 'import',
				// 		step: '1',
				// 		event_type: 'feedback',
				// 		status: 'failure',
				// 		method: 'browse/drag-drop', // TODO: Distinguish upload type
				// 	},
				// );
			}
			setErrorType( kitState.data );
		}
	}, [ kitState.status ] );

	// After kit was uploaded.
	useEffect( () => {
		if ( importContext.data.uploadedData && importContext.data.file ) {
			const url = importContext.data.uploadedData.manifest.plugins ? '/import/plugins' : '/import/content';

			navigate( url );
		}
	}, [ importContext.data.uploadedData ] );

	return (
		<Layout type="import">
			<section className="e-app-import">
				{
					'kit-library' === referrer &&
					<Button
						className="e-app-import__back-to-library"
						icon="eicon-chevron-left"
						text={ __( 'Back to Kit Library', 'elementor' ) }
						url="/kit-library"
					/>
				}

				<PageHeader
					heading={ __( 'Import a Template Kit', 'elementor' ) }
					description={ [
						__( 'Upload a file with templates, site settings, content, etc., and apply them to your site automatically.', 'elementor' ),
						getLearnMoreLink(),
					] }
				/>

				<Notice label={ __( 'Important:', 'elementor' ) } color="warning" className="e-app-import__notice">
					{ __( 'We recommend that you backup your site before importing a kit file.', 'elementor' ) }
				</Notice>

				<DropZone
					className="e-app-import__drop-zone"
					heading={ __( 'Upload Files to Your Library', 'elementor' ) }
					text={ __( 'Drag & drop the .zip file with your Kit', 'elementor' ) }
					secondaryText={ __( 'Or', 'elementor' ) }
					filetypes={ [ 'zip' ] }
					onFileSelect={ ( file ) => {
						setIsLoading( true );
						importContext.dispatch( { type: 'SET_FILE', payload: file } );
						if ( 'kit-library' === referrer ) {
							$e.run(
								'kit-library/choose-file',
								{},
								{
									meta: {
										event: 'select kit file',
										source: 'import',
									},
								},
							);
						}
					} }
					onError={ () => setErrorType( 'general' ) }
					isLoading={ isLoading }
					referrer={ referrer }
					onFileSelectEvent={ ( uploadType ) => {
						let uploadMethod;
						if ( 'file-upload' === uploadType ) {
							uploadMethod = 'drag-drop';
						} else if ( 'file-explorer' === uploadType ) {
							uploadMethod = 'browse';
						}
						$e.run(
								'kit-library/file-upload',
								{
									method: uploadMethod,
								},
								{
									meta: {
										event: 'top panel info',
										source: 'import',
										step: '1',
									},
								},
							)
						} }
				/>

				{ errorType && <ProcessFailedDialog
					errorType={ errorType }
					onApprove={ resetImportProcess }
					onModalClose={ () => $e.run(
							'kit-library/modal-close',
							{},
							{
								meta: {
									placement: 'kit library',
									event: 'error modal close',
									source: 'import',
									step: '1',
									event_type: 'load',
								},
							},
						)
					}
					isError={ () => {
							$e.run(
							'kit-library/modal-error',
							{
								errorType: `error modal load  ${ errorType }`,
							},
							{
								meta: {
									source: 'import',
									step: '1',
									event_type: 'load',
								},
							},
						)
					} }
					learnMoreEvent={ () => $e.run(
						'kit-library/seek-more-info',
						{},
						{
							meta: {
								event: 'error modal learn more',
								source: 'import',
								step: '1',
							},
						},
					) }
				/>	}
			</section>
		</Layout>
	);
}
