import { useEffect } from 'react';
import { Button, Stack, Typography } from '@elementor/ui';
import { useNavigate } from '@reach/router';
import { __ } from '@wordpress/i18n';
import { BaseLayout, PageHeader, TopBar, Footer } from '../../shared/components';
import ImportKitContent from '../components/import-kit-parts-selection';
import { IMPORT_STATUS, useImportContext } from '../context/import-context';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

const headerContent = (
	<PageHeader title={ __( 'Import', 'elementor' ) } />
);

export default function ImportCustomization() {
	const {
		isCustomizing,
		dispatch,
		isProcessing,
		data,
	} = useImportContext();
	const navigate = useNavigate();

	useEffect( () => {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitImportCustomization );
	}, [] );

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			<Button
				variant="text"
				color="secondary"
				size="small"
				onClick={ () => {
					if ( data?.kitUploadParams ) {
						let url = '';
						if ( 'cloud' === data?.kitUploadParams?.source ) {
							url = 'kit-library/cloud';
						} else if ( 'kit-library' === data?.kitUploadParams?.source ) {
							url = 'kit-library';
						}

						navigate( url, { replace: true } );
					} else {
						dispatch( { type: 'RESET_STATE' } );
						dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.PENDING } );
					}
				} }
				data-testid="import-back-button"
			>
				{ __( 'Back', 'elementor' ) }
			</Button>
			<Button
				variant="contained"
				color="primary"
				size="small"
				onClick={ () => {
					dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.IMPORTING } );
					navigate( 'import/process' );
				} }
				data-testid="import-apply-button"
			>
				{ __( 'Import and apply', 'elementor' ) }
			</Button>
		</Stack>
	);

	useEffect( () => {
		if ( isProcessing ) {
			navigate( 'import/process' );
		} else if ( ! isCustomizing ) {
			navigate( 'import', { replace: true } );
		}
	}, [ isProcessing, isCustomizing, navigate ] );

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<Stack spacing={ 4 } sx={ { mt: 4, mx: 'auto' } } >
				<Stack spacing={ 2 }>
					<Typography variant="h4" component="h2" gutterBottom color="text.primary">
						{ __( 'Select which parts you want to apply', 'elementor' ) }
					</Typography>
					<Stack>
						<Typography variant="subtitle2" >
							{ __( 'These are the templates, content and site settings that come with your website templates.', 'elementor' ) }
						</Typography>
						<Typography variant="subtitle2" >
							{ __( 'All items are already selected by default. Uncheck the ones you don\'t want.', 'elementor' ) }
						</Typography>
					</Stack>
				</Stack>
				<ImportKitContent />
			</Stack>
		</BaseLayout>
	);
}
