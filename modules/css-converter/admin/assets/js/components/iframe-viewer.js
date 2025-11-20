import { useState } from 'react';
import { Box, Typography, Dialog, DialogHeader, DialogTitle, DialogContent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const IframeViewer = ( { inputContent, previewUrl, importType } ) => {
	const [ inputLoaded, setInputLoaded ] = useState( false );
	const [ previewLoaded, setPreviewLoaded ] = useState( false );
	const [ openModal, setOpenModal ] = useState( null );

	const iframeStyle = {
		width: '1920px',
		height: '1080px',
		border: 'none',
		pointerEvents: 'none',
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
		cursor: 'pointer',
		'&:hover': {
			borderColor: 'primary.main',
			boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
		},
	};

	const iframeContainerStyle = {
		width: '1920px',
		height: '2080px',
		transform: 'scale(calc(400 / 1920))',
		transformOrigin: 'top left',
	};

	const largeIframeStyle = {
		width: '100%',
		height: '80vh',
		border: 'none',
		minHeight: '600px',
		pointerEvents: 'auto',
	};

	return (
		<>
			<Box sx={ containerStyle }>
				<Box>
					<Typography variant="subtitle2" sx={ { mb: 1.25, fontWeight: 'bold' } }>
						{ __( 'Original Content', 'elementor' ) }
					</Typography>
					<Box
						sx={ iframeWrapperStyle }
						onClick={ () => setOpenModal( 'input' ) }
					>
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
					<Box
						sx={ iframeWrapperStyle }
						onClick={ () => setOpenModal( 'preview' ) }
					>
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

			<Dialog
				open={ openModal !== null }
				onClose={ () => setOpenModal( null ) }
				maxWidth="xl"
				fullWidth
				sx={ {
					zIndex: 130000,
				} }
			>
				<DialogHeader onClose={ () => setOpenModal( null ) }>
					<DialogTitle>
						{ 'input' === openModal ? __( 'Original Content', 'elementor' ) : __( 'Converted Preview', 'elementor' ) }
					</DialogTitle>
				</DialogHeader>
				<DialogContent dividers>
					<Box
						component="iframe"
						src={ 'preview' === openModal ? previewUrl : ( 'url' === importType ? inputContent : undefined ) }
						srcDoc={ 'input' === openModal && importType !== 'url' ? getInputIframeContent() : undefined }
						sx={ largeIframeStyle }
						sandbox={ 'preview' === openModal || 'url' === importType ? 'allow-same-origin allow-scripts allow-popups allow-forms' : 'allow-same-origin allow-scripts' }
						title={ 'input' === openModal ? 'Original Content' : 'Converted Preview' }
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};
