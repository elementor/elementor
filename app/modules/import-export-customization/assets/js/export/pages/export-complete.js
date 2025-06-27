import React, { useEffect, useRef } from 'react';
import { Redirect } from '@reach/router';
import { Button, Box, Typography, Stack, Link, Card, CardContent } from '@elementor/ui';
import { BaseLayout, TopBar, Footer, PageHeader } from '../../components';
import { useExportContext } from '../../context/export-context';

export default function ExportComplete() {
	const { data, sanitizeFilename } = useExportContext();
	const { exportedData, kitInfo } = data;
	const downloadLink = useRef( null );

	const downloadFile = ( event ) => {
		event?.preventDefault();

		if ( ! downloadLink.current ) {
			const link = document.createElement( 'a' );

			const fileName = sanitizeFilename( kitInfo.title );

			link.href = 'data:application/zip;base64,' + exportedData.file;
			link.download = fileName + '.zip';

			downloadLink.current = link;
		}

		downloadLink.current.click();
	};

	useEffect( () => {
		if ( 'cloud' !== kitInfo.source && exportedData?.file ) {
			downloadFile();
		}
	}, [ exportedData, kitInfo.source, downloadFile ] );

	const handleDone = () => {
		window.top.location = elementorAppConfig.admin_url;
	};

	if ( ! exportedData ) {
		return <Redirect to="/export-customization/" replace />;
	}

	const isCloudExport = 'cloud' === kitInfo.source;

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			{ isCloudExport ? (
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={ () => window.location.href = elementorAppConfig.base_url + '#/kit-library/cloud' }
				>
					{ __( 'View in Library', 'elementor' ) }
				</Button>
			) : (
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={ handleDone }
				>
					{ __( 'Done', 'elementor' ) }
				</Button>
			) }
		</Stack>
	);

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<Box sx={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: 'calc(100vh - 180px)',
				p: 3,
			} }>
				<Box sx={ {
					maxWidth: '600px',
					textAlign: 'center',
					width: '100%',
				} }>
					<Stack spacing={ 3 } alignItems="center">
						<Box sx={ { mb: 2 } }>
							<img
								src={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
								alt=""
								style={ { width: '80px', height: '80px' } }
							/>
						</Box>

						<Typography variant="h4" component="h2" gutterBottom>
							{ isCloudExport
								? __( 'Your website template is now saved to the library!', 'elementor' )
								: __( 'Your .zip file is ready', 'elementor' )
							}
						</Typography>

						<Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
							{ isCloudExport
								? (
									<>
										{ __( 'You can find it in the My Website Templates tab.', 'elementor' ) }{ ' ' }
										<Link
											href={ elementorAppConfig.base_url + '#/kit-library/cloud' }
											sx={ { cursor: 'pointer' } }
										>
											{ __( 'Take me there', 'elementor' ) }
										</Link>
									</>
								)
								: __( 'Once the download is complete, you can upload it to be used for other sites.', 'elementor' )
							}
						</Typography>

						<Card sx={ { width: '100%', border: 1, borderRadius: 1, borderColor: 'action.focus' } } elevation={ 0 }>
							<CardContent sx={ { p: 2.5 } }>
								<Typography variant="h6" component="h3" gutterBottom>
									{ kitInfo.title }
								</Typography>

								{ kitInfo.description && (
									<Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>
										{ kitInfo.description }
									</Typography>
								) }

								<Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1 } }>
									{ __( 'Exported items:', 'elementor' ) }
								</Typography>
								<Typography variant="body2">
									{ data.includes.map( ( item ) => {
										const itemLabels = {
											content: __( 'Content', 'elementor' ),
											templates: __( 'Templates', 'elementor' ),
											settings: __( 'Settings & configurations', 'elementor' ),
											plugins: __( 'Plugins', 'elementor' ),
										};
										return itemLabels[ item ] || item;
									} ).join( ', ' ) }
								</Typography>
							</CardContent>
						</Card>

						{ ! isCloudExport && (
							<Typography variant="body2" color="text.secondary">
								{ __( 'Is the automatic download not starting?', 'elementor' ) }{ ' ' }
								<Link href="#" onClick={ downloadFile } sx={ { cursor: 'pointer', textDecoration: 'underline' } }>
									{ __( 'Download manually', 'elementor' ) }
								</Link>
								{ '. ' }
							</Typography>
						) }
					</Stack>
				</Box>
			</Box>
		</BaseLayout>
	);
}
