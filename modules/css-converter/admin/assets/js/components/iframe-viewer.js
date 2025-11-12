import { useState } from 'react';
import { Box, Typography, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const IframeViewer = ( { inputContent, previewUrl, importType } ) => {
	const [ inputLoaded, setInputLoaded ] = useState( false );
	const [ previewLoaded, setPreviewLoaded ] = useState( false );

	const iframeStyle = {
		width: '400px',
		height: '600px',
		border: '1px solid',
		borderColor: 'divider',
		borderRadius: 1,
	};

	const containerStyle = {
		display: 'flex',
		gap: 2.5,
		mt: 3,
		p: 2.5,
		bgcolor: 'action.hover',
		borderRadius: 1,
	};

	const getInputIframeContent = () => {
		if ( importType === 'url' ) {
			return `<html><head><title>Original URL</title></head><body><p>URL: ${ inputContent }</p></body></html>`;
		}

		return `<html><head><meta charset="UTF-8"><title>Original Content</title></head><body>${ inputContent }</body></html>`;
	};

	return (
		<Box sx={ containerStyle }>
			<Box>
				<Typography variant="subtitle2" sx={ { mb: 1.25, fontWeight: 'bold' } }>
					{ __( 'Original Content', 'elementor' ) }
				</Typography>
				<Box
					component="iframe"
					srcDoc={ getInputIframeContent() }
					sx={ iframeStyle }
					sandbox="allow-same-origin allow-scripts"
					title="Original Content"
					onLoad={ () => setInputLoaded( true ) }
				/>
				{ ! inputLoaded && (
					<Typography variant="body2" sx={ { textAlign: 'center', p: 1.25, color: 'text.secondary' } }>
						{ __( 'Loading...', 'elementor' ) }
					</Typography>
				) }
			</Box>
			<Box>
				<Typography variant="subtitle2" sx={ { mb: 1.25, fontWeight: 'bold' } }>
					{ __( 'Converted Preview', 'elementor' ) }
				</Typography>
				<Box
					component="iframe"
					src={ previewUrl }
					sx={ iframeStyle }
					title="Converted Preview"
					onLoad={ () => setPreviewLoaded( true ) }
				/>
				{ ! previewLoaded && (
					<Typography variant="body2" sx={ { textAlign: 'center', p: 1.25, color: 'text.secondary' } }>
						{ __( 'Loading...', 'elementor' ) }
					</Typography>
				) }
			</Box>
		</Box>
	);
};
