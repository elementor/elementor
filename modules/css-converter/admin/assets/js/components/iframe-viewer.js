import { useState } from 'react';
import { Box, Typography, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const IframeViewer = ( { inputContent, previewUrl, importType } ) => {
	const [ inputLoaded, setInputLoaded ] = useState( false );
	const [ previewLoaded, setPreviewLoaded ] = useState( false );

	const iframeStyle = {
		width: '1920px',
		height: '1080px',
		border: 'none',
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
		if ( 'url' === importType ) {
			return null;
		}

		return `<html><head><meta charset="UTF-8"><title>Original Content</title></head><body>${ inputContent }</body></html>`;
	};

	const iframeWrapperStyle = {
		width: '400px',
		height: '600px',
		overflow: 'hidden',
		border: '1px solid',
		borderColor: 'divider',
		borderRadius: 1,
		position: 'relative',
	};

	const iframeContainerStyle = {
		width: '1920px',
		height: '2080px',
		transform: 'scale(calc(400 / 1920))',
		transformOrigin: 'top left',
	};

	return (
		<Box sx={ containerStyle }>
			<Box>
				<Typography variant="subtitle2" sx={ { mb: 1.25, fontWeight: 'bold' } }>
					{ __( 'Original Content', 'elementor' ) }
				</Typography>
				<Box sx={ iframeWrapperStyle }>
					<Box sx={ iframeContainerStyle }>
						<Box
							component="iframe"
							src={ 'url' === importType ? inputContent : undefined }
							srcDoc={ importType !== 'url' ? getInputIframeContent() : undefined }
							sx={ iframeStyle }
							sandbox={ 'url' === importType ? 'allow-same-origin allow-scripts allow-popups allow-forms' : 'allow-same-origin allow-scripts' }
							title="Original Content"
							onLoad={ () => setInputLoaded( true ) }
						/>
					</Box>
				</Box>
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
				<Box sx={ iframeWrapperStyle }>
					<Box sx={ iframeContainerStyle }>
						<Box
							component="iframe"
							src={ previewUrl }
							sx={ iframeStyle }
							title="Converted Preview"
							onLoad={ () => setPreviewLoaded( true ) }
						/>
					</Box>
				</Box>
				{ ! previewLoaded && (
					<Typography variant="body2" sx={ { textAlign: 'center', p: 1.25, color: 'text.secondary' } }>
						{ __( 'Loading...', 'elementor' ) }
					</Typography>
				) }
			</Box>
		</Box>
	);
};
