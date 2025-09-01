import { useEffect } from 'react';
import { useNavigate } from '@reach/router';
import { Box, Typography, Link, CircularProgress, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import useQueryParams from 'elementor-app/hooks/use-query-params';
import { BaseLayout, TopBar, PageHeader, CenteredContent } from '../../shared/components';
import DropZone from '../components/drop-zone';
import { IMPORT_STATUS, ACTION_TYPE, useImportContext } from '../context/import-context';
import { useUploadKit } from '../hooks/use-upload-kit';
import ImportError from '../components/import-error';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

export default function ImportKit() {
	const { data, dispatch } = useImportContext();
	const navigate = useNavigate();

	const { id, referrer, file_url: fileUrl, action_type: actionType, nonce } = useQueryParams().getAll();

	const { uploading, error } = useUploadKit();

	const headerContent = (
		<PageHeader title={ __( 'Import', 'elementor' ) } />
	);

	const onFileSelect = ( file ) => {
		dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.UPLOADING } );
		dispatch( { type: 'SET_FILE', payload: file } );
	};

	useEffect( () => {
		dispatch( { type: 'RESET_STATE' } );
	}, [ dispatch ] );

	useEffect( () => {
		if ( data.uploadedData ) {
			if ( data.actionType === ACTION_TYPE.APPLY_ALL ) {
				const includes = [];

				if ( data.uploadedData?.manifest?.[ 'site-settings' ] ) {
					includes.push( 'settings' );
				}

				if ( 0 < Object.keys( data.uploadedData?.manifest?.templates || {} ).length ) {
					includes.push( 'templates' );
				}

				if ( data.uploadedData?.manifest?.content ) {
					includes.push( 'content' );
				}

				if ( data.uploadedData?.manifest?.plugins ) {
					includes.push( 'plugins' );
				}

				dispatch( { type: 'ADD_INCLUDES', payload: includes } );
				dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.IMPORTING } );
				navigate( 'import-customization/process' );
			} else {
				dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.CUSTOMIZING } );
				navigate( 'import-customization/content' );
			}
		}
	}, [ data.uploadedData, dispatch, navigate, data.actionType ] );

	useEffect( () => {
		if ( id || fileUrl ) {
			dispatch( { type: 'SET_KIT_UPLOAD_PARAMS', payload: { id, source: referrer, fileUrl, nonce } } );
			if ( actionType ) {
				dispatch( { type: 'SET_ACTION_TYPE', payload: actionType } );
			}
			dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.UPLOADING } );
		}
	}, [ id, referrer, fileUrl, actionType, nonce, dispatch ] );

	useEffect( () => {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitImportUploadBox );
	}, [] );

	const renderContent = () => {
		if ( error ) {
			return (
				<CenteredContent data-testid="import-error">
					<Stack spacing={ 3 } alignItems="center" >
						<ImportError statusText={ __( 'Uploading failed', 'elementor' ) } />
					</Stack>
				</CenteredContent>
			);
		}

		if ( uploading || referrer ) {
			return (
				<CenteredContent data-testid="import-loader">
					<CircularProgress size={ 30 } />
				</CenteredContent>
			);
		}

		return (
			<Stack
				data-testid="content-container"
				direction="column"
				alignItems="flex-start"
				justifyContent="center"
				sx={ {
					pt: 8,
					gap: 7,
					maxWidth: 1080,
					mx: 'auto',
				} }
			>
				<Stack direction="column" sx={ { gap: 3 } }>
					<Typography
						variant="h4"
						color="text.primary"
						data-testid="import-title"
					>
						{ __( 'Import a website template', 'elementor' ) }
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
						data-testid="import-description"
					>
						{ __( 'Upload a file with templates, site settings, content, etc., and apply them to your site ', 'elementor' ) }
						<Link
							href="#"
							color="info.light"
							sx={ { ml: 1, textDecoration: 'none' } }
							data-testid="import-learn-more-link"
						>
							{ __( 'Learn more', 'elementor' ) }
						</Link>
					</Typography>
				</Stack>
				<Stack sx={ { width: '100%' } } data-testid="import-card">
					<Box sx={ { p: 0 } } data-testid="import-card-content">
						<DropZone onFileSelect={ onFileSelect } />
					</Box>
				</Stack>
			</Stack>
		);
	};

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
		>
			{ renderContent() }
		</BaseLayout>
	);
}
