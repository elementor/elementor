import { useEffect } from 'react';
import { useNavigate } from '@reach/router';
import { Box, Typography, Link, Card, CardContent, CircularProgress, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { BaseLayout, TopBar, PageHeader, CenteredContent } from '../../shared/components';
import DropZone from '../components/drop-zone';
import { IMPORT_STATUS, useImportContext } from '../context/import-context';
import { useUploadKit } from '../hooks/use-upload-kit';
import ImportError from '../components/import-error';

export default function ImportKit() {
	const { data, dispatch } = useImportContext();
	const navigate = useNavigate();

	const { uploading, error } = useUploadKit();

	const headerContent = (
		<PageHeader title={ __( 'Import', 'elementor' ) } />
	);

	const onFileSelect = ( file ) => {
		dispatch( { type: 'SET_FILE', payload: file } );
	};

	useEffect( () => {
		if ( data.uploadedData ) {
			dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.CUSTOMIZING } );
			navigate( 'import-customization/content' );
		}
	}, [ data.uploadedData, dispatch, navigate ] );

	const renderContent = () => {
		if ( error ) {
			return (
				<CenteredContent>
					<Stack spacing={ 3 } alignItems="center" >
						<ImportError statusText={ __( 'Uploading failed', 'elementor' ) } />
					</Stack>
				</CenteredContent>
			);
		}

		if ( uploading ) {
			return (
				<CenteredContent>
					<CircularProgress size={ 30 } />
				</CenteredContent>
			);
		}

		return (
			<Box
				data-testid="content-container"
				display="flex"
				flexDirection="column"
				alignItems="flex-start"
				sx={ {
					pt: 8,
					width: '100%',
					px: 20,
				} }
			>
				<Typography variant="h4" color="text.primary" sx={ { fontWeight: 700, mb: 3, textAlign: 'left' } }>
					{ __( 'Import a website template', 'elementor' ) }
				</Typography>
				<Typography variant="body1" color="text.secondary" sx={ { fontWeight: 500, mb: 7, textAlign: 'left' } }>
					{ __( 'Upload a file with templates, site settings, content, etc., and apply them to your site ', 'elementor' ) }
					<Link href="#" sx={ { color: 'info.main', fontWeight: 500, ml: 1, textDecoration: 'none' } }>{ __( 'Learn more', 'elementor' ) }</Link>
				</Typography>
				<Card sx={ { width: '100%', p: 0, borderRadius: 2, boxShadow: 0, minHeight: 600 } }>
					<CardContent sx={ { p: 0 } }>
						<DropZone onFileSelect={ onFileSelect } helperText={ __( 'SVG, PNG, JPG or GIF (max. 3MB)', 'elementor' ) } filetypes={ [ 'image/svg+xml', 'image/png', 'image/jpeg', 'image/gif', 'application/zip' ] } />
					</CardContent>
				</Card>
			</Box>
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
