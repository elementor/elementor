import * as React from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { service } from '../../service';

const MIN_CSS_TEXTAREA_ROWS = 4;

type Props = {
	onClose?: () => void;
	onImported?: () => void;
};

type StoredVariables = {
	created?: number;
	updated?: number;
	errors?: Array< Record< string, unknown > >;
};

export const VariablesImportPanel = ( { onClose, onImported }: Props ) => {
	const [ importUrl, setImportUrl ] = React.useState( '' );
	const [ importCss, setImportCss ] = React.useState( '' );
	const [ isImporting, setIsImporting ] = React.useState( false );
	const [ importError, setImportError ] = React.useState< string | null >( null );
	const [ importResult, setImportResult ] = React.useState< StoredVariables | null >( null );

	const canStartImport = ( importUrl.trim().length > 0 ) || ( importCss.trim().length > 0 );

	const handleStartImport = async () => {
		setImportError( null );
		setImportResult( null );
		if ( ! canStartImport || isImporting ) {
			return;
		}
		setIsImporting( true );
		try {
			const body: Record< string, unknown > = {};
			if ( importCss.trim().length > 0 ) {
				body.css = importCss.trim();
			} else if ( importUrl.trim().length > 0 ) {
				body.url = importUrl.trim();
			}

			const response = await fetch( '/wp-json/elementor/v2/css-converter/variables', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-DEV-TOKEN': 'my-dev-token',
				},
				body: JSON.stringify( body ),
			} );

			const data = await response.json().catch( () => ( {} ) );
			if ( ! response.ok ) {
				const errorMessage = ( data && ( data.message || data.error ) ) || `${ response.status }`;
				setImportError( String( errorMessage ) );
				return;
			}

			const storedFromSnake = data && data.stored_variables;
			const storedFromCamel = data && data.storedVariables;
			const rawStored = storedFromSnake ?? storedFromCamel ?? null;
			if ( rawStored ) {
				const created = typeof rawStored.created === 'number' ? rawStored.created : 0;
				const updated = typeof rawStored.updated === 'number' ? rawStored.updated : 0;
				const errorsArray = Array.isArray( rawStored.errors )
					? rawStored.errors
					: ( Array.isArray( rawStored.error ) ? rawStored.error : [] );
				setImportResult( { created, updated, errors: errorsArray } );
			} else {
				setImportResult( { created: 0, updated: 0, errors: [] } );
			}

			// Reload variables from server/store and notify parent so UI refreshes
			await service.load();
			onImported?.();
		} catch ( error ) {
			setImportError( error instanceof Error ? error.message : __( 'Unknown error', 'elementor' ) );
		} finally {
			setIsImporting( false );
		}
	};

	return (
		<Box sx={ { p: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1 } }>
			<TextField
				label={ __( 'Import from url', 'elementor' ) }
				placeholder="https://example.com/styles.css"
				value={ importUrl }
				onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => setImportUrl( e.target.value ) }
				fullWidth
				size="small"
			/>
			<TextField
				label={ __( 'Import from pasted CSS', 'elementor' ) }
				placeholder={ '/* ' + __( 'Paste your CSS here', 'elementor' ) + ' */' }
				value={ importCss }
				onChange={ ( e: React.ChangeEvent< HTMLInputElement | HTMLTextAreaElement > ) => setImportCss( e.target.value ) }
				fullWidth
				multiline
				minRows={ MIN_CSS_TEXTAREA_ROWS }
				size="small"
			/>
			<Stack direction="row" gap={ 1 } alignItems="center">
				<Button
					variant="contained"
					color="primary"
					disabled={ ! canStartImport || isImporting }
					onClick={ handleStartImport }
					size="small"
				>
					{ isImporting ? __( 'Importing…', 'elementor' ) : __( 'start import', 'elementor' ) }
				</Button>
			</Stack>

			{ importError && (
				<Alert severity="error">{ importError }</Alert>
			) }
			{ importResult && (
				<Alert severity="success">
					<Stack gap={ 0.5 }>
						<Typography variant="body2"><strong>{ __( 'Created', 'elementor' ) }:</strong> { importResult.created ?? 0 }</Typography>
						<Typography variant="body2"><strong>{ __( 'Updated', 'elementor' ) }:</strong> { importResult.updated ?? 0 }</Typography>
						{ importResult.errors && importResult.errors.length > 0 && (
							<Box>
								<Typography variant="body2" sx={ { fontWeight: 'bold' } }>
									{ __( 'Errors', 'elementor' ) } ({ importResult.errors.length }):
								</Typography>
								<Stack component="ul" sx={ { pl: 2, m: 0 } }>
									{ importResult.errors.map( ( err, idx ) => {
										const name = typeof err?.name === 'string' ? err.name : '';
										const reason = typeof err?.reason === 'string' ? err.reason : '';
										const message = typeof err?.message === 'string' ? err.message : '';
										const line = [ name, reason ].filter( Boolean ).join( ' - ' );
										return (
											<Box key={ idx } component="li">
												<Typography variant="caption">
													{ line }{ message ? ': ' + message : '' }
												</Typography>
											</Box>
										);
									} ) }
								</Stack>
							</Box>
						) }
					</Stack>
				</Alert>
			) }
		</Box>
	);
};


