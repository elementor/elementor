import { useEffect } from 'react';
import { useNavigate } from '@reach/router';
import { Box, Typography, Link, CircularProgress, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import useQueryParams from 'elementor-app/hooks/use-query-params';
import { BaseLayout, TopBar, PageHeader, CenteredContent } from '../../shared/components';
import DropZone from '../components/drop-zone';
import { IMPORT_STATUS, useImportContext } from '../context/import-context';
import { useUploadKit } from '../hooks/use-upload-kit';
import ImportError from '../components/import-error';

export default function ImportKit() {
	const { data, dispatch } = useImportContext();
	const navigate = useNavigate();

	const { id, referrer, file_url: fileUrl, nonce } = useQueryParams().getAll();

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
			dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.CUSTOMIZING } );
			navigate( 'import-customization/content' );
		}
	}, [ data.uploadedData, dispatch, navigate ] );

	useEffect( () => {
		if ( id || fileUrl ) {
			dispatch( { type: 'SET_KIT_UPLOAD_PARAMS', payload: { id, source: referrer, fileUrl, nonce } } );
			dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.UPLOADING } );
		}
	}, [ id, referrer, fileUrl, nonce, dispatch ] );

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
							sx={ { color: 'info.main', ml: 1, textDecoration: 'none' } }
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
