import { useState } from 'react';
import {
	Dialog,
	DialogHeader,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Alert,
	AlertTitle,
	Box,
	Typography,
	Stack,
	Collapse,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { IframeViewer } from './iframe-viewer';

export const ResultsModal = ( {
	result,
	error,
	importType,
	htmlContent,
	urlContent,
	onClose,
	onConvertAnother,
} ) => {
	const [ showWarnings, setShowWarnings ] = useState( false );

	const getPreviewUrl = ( postId ) => {
		const baseUrl = window.location.origin;
		return `${ baseUrl }/?p=${ postId }`;
	};

	const handleOpenEditor = () => {
		if ( result?.edit_url ) {
			window.open( result.edit_url, '_blank' );
		}
	};

	const inputContent = importType === 'url' ? urlContent : htmlContent;

	return (
		<Dialog
			open={ true }
			onClose={ onClose }
			maxWidth="lg"
			fullWidth
		>
			<DialogHeader onClose={ onClose }>
				<DialogTitle>
					{ error ? __( '✗ Conversion Failed', 'elementor' ) : __( '✓ Conversion Successful', 'elementor' ) }
				</DialogTitle>
			</DialogHeader>

			<DialogContent dividers>
				{ error ? (
					<Stack spacing={ 2 }>
						<Alert severity="error">
							<AlertTitle>{ __( 'Error Code:', 'elementor' ) } { error.code }</AlertTitle>
							{ error.message }
						</Alert>
						{ error.recommendations && (
							<Box>
								<Typography variant="subtitle2" sx={ { mb: 1 } }>
									{ __( 'Recommendations:', 'elementor' ) }
								</Typography>
								<Stack component="ul" spacing={ 0.5 } sx={ { pl: 2, m: 0 } }>
									{ error.recommendations.map( ( rec, index ) => (
										<Typography key={ index } component="li" variant="body2">
											{ rec }
										</Typography>
									) ) }
								</Stack>
							</Box>
						) }
					</Stack>
				) : (
					<Stack spacing={ 2 }>
						<Alert severity="success">
							<Stack spacing={ 0.5 }>
								<Typography variant="body2">
									<strong>{ __( 'Post ID:', 'elementor' ) }</strong> { result.post_id }
								</Typography>
								<Typography variant="body2">
									<strong>{ __( 'Widgets Created:', 'elementor' ) }</strong> { result.widgets_created || 0 }
								</Typography>
								{ result.global_classes_created !== undefined && (
									<Typography variant="body2">
										<strong>{ __( 'Global Classes Created:', 'elementor' ) }</strong> { result.global_classes_created }
									</Typography>
								) }
							</Stack>
						</Alert>

						{ result.stats && (
							<Box sx={ { p: 2, bgcolor: 'action.hover', borderRadius: 1 } }>
								<Typography variant="subtitle2" sx={ { mb: 1 } }>
									<strong>{ __( 'Stats:', 'elementor' ) }</strong>
								</Typography>
								<Typography variant="body2">
									{ result.stats.total_elements || 0 } { __( 'elements,', 'elementor' ) }{ ' ' }
									{ result.stats.elements_converted || 0 } { __( 'converted,', 'elementor' ) }{ ' ' }
									{ result.stats.properties_converted || 0 } { __( 'properties', 'elementor' ) }
								</Typography>
							</Box>
						) }

						{ result.warnings && result.warnings.length > 0 && (
							<Box>
								<Button
									variant="text"
									size="small"
									onClick={ () => setShowWarnings( ! showWarnings ) }
									sx={ { mb: 1 } }
								>
									{ showWarnings ? '▼' : '▶' } { __( 'Warnings', 'elementor' ) } ({ result.warnings.length })
								</Button>
								<Collapse in={ showWarnings }>
									<Stack component="ul" spacing={ 0.5 } sx={ { pl: 2, m: 0 } }>
										{ result.warnings.map( ( warning, index ) => (
											<Typography key={ index } component="li" variant="body2">
												{ typeof warning === 'string' ? warning : warning.message || JSON.stringify( warning ) }
											</Typography>
										) ) }
									</Stack>
								</Collapse>
							</Box>
						) }

						{ result.post_id && inputContent && (
							<IframeViewer
								inputContent={ inputContent }
								previewUrl={ getPreviewUrl( result.post_id ) }
								importType={ importType }
							/>
						) }
					</Stack>
				) }
			</DialogContent>

			<DialogActions>
				{ error ? (
					<Button onClick={ onClose } color="secondary">
						{ __( 'Try Again', 'elementor' ) }
					</Button>
				) : (
					<>
						<Button onClick={ handleOpenEditor } variant="contained" color="primary">
							{ __( 'Open in Editor', 'elementor' ) }
						</Button>
						<Button onClick={ onConvertAnother } color="secondary">
							{ __( 'Convert Another', 'elementor' ) }
						</Button>
					</>
				) }
			</DialogActions>
		</Dialog>
	);
};
