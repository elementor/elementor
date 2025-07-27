import { useEffect } from 'react';
import { Button, Stack, Typography } from '@elementor/ui';
import { useNavigate } from '@reach/router';
import { __ } from '@wordpress/i18n';
import { BaseLayout, PageHeader, TopBar, Footer } from '../../shared/components';
import ImportKitContent from '../components/import-kit-parts-selection';
import { IMPORT_STATUS, useImportContext } from '../context/import-context';

const headerContent = (
	<PageHeader title={ __( 'Import', 'elementor' ) } />
);

export default function ImportCustomization() {
	const { isCustomizing, dispatch, isProcessing } = useImportContext();
	const navigate = useNavigate();

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			<Button
				variant="text"
				color="secondary"
				size="small"
				onClick={ () => dispatch( { type: 'SET_IMPORT_STATUS', payload: IMPORT_STATUS.PENDING } ) }
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
					navigate( 'import-customization/process' );
				} }
				data-testid="import-apply-button"
			>
				{ __( 'Import and apply', 'elementor' ) }
			</Button>
		</Stack>
	);

	useEffect( () => {
		if ( isProcessing ) {
			navigate( 'import-customization/process' );
		} else if ( ! isCustomizing ) {
			navigate( 'import-customization', { replace: true } );
		}
	}, [ isProcessing, isCustomizing, navigate ] );

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<Stack spacing={ 4 } sx={ { mt: 4, mx: 'auto' } } >
				<Stack spacing={ 2 }>
					<Typography variant="h4" >
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
