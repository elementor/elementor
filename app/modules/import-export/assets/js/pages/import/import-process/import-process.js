import { useEffect, useContext, useState, useMemo } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ImportContext } from '../../../context/import-context/import-context-provider';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';
import UnfilteredFilesDialog from 'elementor-app/organisms/unfiltered-files-dialog';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import useQueryParams from 'elementor-app/hooks/use-query-params';
import useKit from '../../../hooks/use-kit';
import useImportActions from '../hooks/use-import-actions';
import { useImportKitLibraryApplyAllPlugins } from '../import-kit/hooks/use-import-kit-library-apply-all-plugins';

export default function ImportProcess() {
	const sharedContext = useContext( SharedContext ),
		importContext = useContext( ImportContext ),
		navigate = useNavigate(),
		[ errorType, setErrorType ] = useState( '' ),
		[ showUnfilteredFilesDialog, setShowUnfilteredFilesDialog ] = useState( false ),
		[ startImport, setStartImport ] = useState( false ),
		[ plugins, setPlugins ] = useState( [] ),
		missing = useImportKitLibraryApplyAllPlugins( plugins ),
		{ kitState, kitActions, KIT_STATUS_MAP } = useKit(),
		{ referrer, file_url: fileURL, action_type: actionType, nonce } = useQueryParams().getAll(),
		{ includes, selectedCustomPostTypes, currentPage } = sharedContext.data || {},
		{ file, uploadedData, importedData, overrideConditions, isResolvedData } = importContext.data || {},
		isKitHasSvgAssets = useMemo( () => includes.some( ( item ) => [ 'templates', 'content' ].includes( item ) ), [ includes ] ),
		{ navigateToMainScreen } = useImportActions(),
		uploadKit = () => {
			const decodedFileURL = decodeURIComponent( fileURL );

			importContext.dispatch( { type: 'SET_FILE', payload: decodedFileURL } );

			kitActions.upload( { file: decodedFileURL, kitLibraryNonce: nonce } );
		},
		importKit = () => {
			if ( elementorAppConfig[ 'import-export' ].isUnfilteredFilesEnabled || ! isKitHasSvgAssets ) {
				setStartImport( true );
			} else {
				setShowUnfilteredFilesDialog( true );
			}
		},
		applyAllSetCpt = () => {
		const cpt = kitState.data?.manifest[ 'custom-post-type-title' ] || importContext.data?.uploadedData?.manifest[ 'custom-post-type-title' ];
			if ( cpt ) {
				const cptArray = Object.keys( cpt );
				sharedContext.dispatch( { type: 'SET_SELECTED_CPT', payload: cptArray } );
			}
		},
		applyAllImportPlugins = () => {
			const allPlugins = ( kitState.data?.manifest?.plugins || importContext.data.uploadedData.manifest.plugins );
			setPlugins( allPlugins );
		},
		onCancelProcess = () => {
			importContext.dispatch( { type: 'SET_FILE', payload: null } );

			navigateToMainScreen();
		},
		onReady = () => {
			setShowUnfilteredFilesDialog( false );
			setStartImport( true );
		},
		eventTracking = ( command, eventType = 'click' ) => {
			if ( 'kit-library' === sharedContext.data.referrer ) {
				appsEventTrackingDispatch(
					command,
					{
						page_source: 'import',
						step: currentPage,
						modal_type: 'unfiltered_file',
						event_type: eventType,
					},
				);
			}
		};

	// On load.
	useEffect( () => {
		// Saving the referrer value globally.
		if ( referrer ) {
			sharedContext.dispatch( { type: 'SET_REFERRER', payload: referrer } );
		}

		if ( actionType ) {
			importContext.dispatch( { type: 'SET_ACTION_TYPE', payload: actionType } );
		}

		if ( fileURL && ! file ) {
			// When the starting point of the app is the import/process screen and importing via file_url.
			uploadKit();
		} else if ( uploadedData ) {
			// When the import/process is the second step of the kit import process, after selecting the kit content.
			importKit();
		} else {
			navigate( 'import' );
		}
		sharedContext.dispatch( { type: 'SET_CURRENT_PAGE_NAME', payload: ImportProcess.name } );
	}, [] );

	// Starting the import process.
	useEffect( () => {
		if ( startImport ) {
			kitActions.import( {
				session: uploadedData.session,
				include: includes,
				overrideConditions,
				referrer,
				selectedCustomPostTypes,
			} );
		}
	}, [ startImport ] );

	// Updating the kit data after upload/import.
	useEffect( () => {
		if ( KIT_STATUS_MAP.INITIAL !== kitState.status ) {
			switch ( kitState.status ) {
				case KIT_STATUS_MAP.IMPORTED:
					importContext.dispatch( { type: 'SET_IMPORTED_DATA', payload: kitState.data } );
					break;
				case KIT_STATUS_MAP.UPLOADED:
					importContext.dispatch( { type: 'SET_UPLOADED_DATA', payload: kitState.data } );
					break;
				case KIT_STATUS_MAP.ERROR:
					setErrorType( kitState.data );
					break;
			}
		}
	}, [ kitState.status ] );

	// Actions after the kit upload/import data was updated.
	useEffect( () => {
		if ( KIT_STATUS_MAP.INITIAL !== kitState.status || ( isResolvedData && 'apply-all' === importContext.data.actionType ) ) {
			if ( importedData ) { // After kit upload.
				navigate( '/import/complete' );
			} else if ( 'apply-all' === importContext.data.actionType ) { // Forcing apply-all kit content.
				if ( kitState.data?.manifest?.plugins || importContext.data.uploadedData?.manifest.plugins ) {
					importContext.dispatch( { type: 'SET_PLUGINS_STATE', payload: 'have' } );
				}
				if ( uploadedData.conflicts && Object.keys( uploadedData.conflicts ).length && ! isResolvedData ) {
					navigate( '/import/resolver' );
				} else {
					// The kitState must be reset due to staying in the same page, so that the useEffect will be re-triggered.
					kitActions.reset();

					if ( 'have' === importContext.data.pluginsState ) {
						applyAllImportPlugins();
					}

					if ( '' === importContext.data.pluginsState || 'success' === importContext.data.pluginsState ) {
						applyAllSetCpt();
						importKit();
					}
				}
			} else {
				navigate( '/import/plugins' );
			}
		}
	}, [ uploadedData, importedData, importContext.data.pluginsState ] );

	useEffect( () => {
		if ( missing?.length > 0 ) {
			importContext.dispatch( { type: 'SET_PLUGINS', payload: missing } );
			navigate( 'import/plugins-activation' );
		}
	}, [ missing ] );

	return (
		<Layout type="import">
			<section>

				<FileProcess
					info={ uploadedData && __( 'Importing your content, templates and site settings', 'elementor' ) }
					errorType={ errorType }
					onDialogApprove={ onCancelProcess }
					onDialogDismiss={ onCancelProcess }
				/>

				<UnfilteredFilesDialog
					show={ showUnfilteredFilesDialog }
					setShow={ setShowUnfilteredFilesDialog }
					confirmModalText={ __( 'This allows Elementor to scan your SVGs for malicious content. Otherwise, you can skip any SVGs in this import.', 'elementor' ) }
					errorModalText={ __( 'Nothing to worry about, just continue without importing SVGs or go back and start the import again.', 'elementor' ) }
					onReady={ () => onReady() }
					onCancel={ () => {
						setShowUnfilteredFilesDialog( false );
						onCancelProcess();
					} }
					onLoad={ () => eventTracking( 'kit-library/modal-load', 'load' ) }
					onClose={ () => {
						eventTracking( 'kit-library/close' );
						onReady();
					} }
					onDismiss={ () => {
						onReady();
						eventTracking( 'kit-library/skip' );
					} }
					onEnable={ () => eventTracking( 'kit-library/enable' ) }
				/>
			</section>
		</Layout>
	);
}
