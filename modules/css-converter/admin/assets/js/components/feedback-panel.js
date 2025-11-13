import { useState, useEffect, useRef } from 'react';
import {
	Alert,
	AlertTitle,
	Box,
	Typography,
	Stack,
	Collapse,
	Button,
	CircularProgress,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { IframeViewer } from './iframe-viewer';

export const FeedbackPanel = ( {
	isLoading,
	loadingText,
	result,
	error,
	importType,
	htmlContent,
	urlContent,
	onConvertAnother,
} ) => {
	const [ showWarnings, setShowWarnings ] = useState( false );
	const feedbackRef = useRef( null );

	useEffect( () => {
		if ( ( isLoading || result || error ) && feedbackRef.current ) {
			feedbackRef.current.scrollIntoView( { behavior: 'smooth', block: 'start' } );
		}
	}, [ isLoading, result, error ] );

	const getPreviewUrl = ( postId, previewUrl ) => {
		if ( previewUrl ) {
			return previewUrl;
		}

		if ( ! postId ) {
			return null;
		}

		const baseUrl = window.location.origin;
		return `${ baseUrl }/?p=${ postId }`;
	};

	const handleOpenEditor = () => {
		if ( result?.edit_url ) {
			window.open( result.edit_url, '_blank' );
		}
	};

	const inputContent = 'url' === importType ? urlContent : htmlContent;

	if ( ! isLoading && ! result && ! error ) {
		return null;
	}

	return (
		<Box ref={ feedbackRef } sx={ { mt: 4, mb: 4 } }>
			{ isLoading && (
				<Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 } }>
					<CircularProgress sx={ { mb: 2 } } />
					<Typography variant="body1">{ loadingText }</Typography>
				</Box>
			) }

			{ error && (
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
			) }

			{ result && (
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

					{ result.warning && (
						<Alert severity="error">
							<AlertTitle>{ __( 'Warning', 'elementor' ) }</AlertTitle>
							<Typography variant="body2">{ result.warning }</Typography>
						</Alert>
					) }

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

					{ result.post_id && inputContent && getPreviewUrl( result.post_id, result.preview_url ) && (
						<IframeViewer
							inputContent={ inputContent }
							previewUrl={ getPreviewUrl( result.post_id, result.preview_url ) }
							importType={ importType }
						/>
					) }

					<Stack direction="row" spacing={ 2 } sx={ { mt: 2 } }>
						<Button onClick={ handleOpenEditor } variant="contained" color="primary">
							{ __( 'Open in Editor', 'elementor' ) }
						</Button>
						<Button onClick={ onConvertAnother } color="secondary">
							{ __( 'Convert Another', 'elementor' ) }
						</Button>
					</Stack>
				</Stack>
			) }
		</Box>
	);
};

