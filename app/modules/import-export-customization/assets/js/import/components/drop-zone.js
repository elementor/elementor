import React, { useState, useRef, useId } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, Stack, Link } from '@elementor/ui';
import { UploadIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

const DropZone = ( {
	onFileSelect,
	onError = () => {},
	filetypes = [ 'application/zip' ],
	className = '',
	icon,
	isLoading = false,
	error,
	onButtonClick,
	onFileChoose,
	...props
} ) => {
	const [ isDragOver, setIsDragOver ] = useState( false );
	const [ dragCounter, setDragCounter ] = useState( 0 );
	const fileInputRef = useRef( null );
	const fileInputId = useId();

	const getMimeTypeToExtensionMap = () => {
		return {
			'application/zip': [ 'zip' ],
			'application/json': [ 'json' ],
			'application/pdf': [ 'pdf' ],
			'text/plain': [ 'txt' ],
			'image/jpeg': [ 'jpg', 'jpeg' ],
			'image/png': [ 'png' ],
			'image/gif': [ 'gif' ],
			'text/csv': [ 'csv' ],
			'application/xml': [ 'xml' ],
			'text/xml': [ 'xml' ],
		};
	};

	const getValidExtensions = () => {
		const mimeToExtMap = getMimeTypeToExtensionMap();
		const validExtensions = [];

		filetypes.forEach( ( mimeType ) => {
			if ( mimeToExtMap[ mimeType ] ) {
				validExtensions.push( ...mimeToExtMap[ mimeType ] );
			}
		} );

		return validExtensions;
	};

	const isValidFileType = ( fileType, fileName = '' ) => {
		if ( 0 === filetypes.length ) {
			return true;
		}

		if ( filetypes.includes( fileType ) ) {
			return true;
		}

		const extension = fileName.toLowerCase().split( '.' ).pop();
		const validExtensions = getValidExtensions();

		return validExtensions.includes( extension );
	};

	const handleDragEnter = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		setDragCounter( ( prev ) => prev + 1 );

		if ( e.dataTransfer.items && e.dataTransfer.items.length > 0 ) {
			setIsDragOver( true );
		}
	};

	const handleDragLeave = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		setDragCounter( ( prev ) => prev - 1 );

		if ( dragCounter <= 1 ) {
			setIsDragOver( false );
		}
	};

	const handleDragOver = ( e ) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = ( e ) => {
		e.preventDefault();
		e.stopPropagation();

		setIsDragOver( false );
		setDragCounter( 0 );

		if ( isLoading ) {
			return;
		}

		const file = e.dataTransfer.files[ 0 ];

		if ( file && isValidFileType( file.type, file.name ) ) {
			onFileSelect( file, e, 'drop' );
		} else {
			onError( {
				id: 'file_not_allowed',
				message: __( 'This file type is not allowed', 'elementor' ),
			} );
		}
	};

	const handleFileInputChange = ( e ) => {
		const file = e.target.files[ 0 ];
		if ( ! file ) {
			return;
		}

		if ( ! isValidFileType( file.type, file.name ) ) {
			onError( {
				id: 'file_not_allowed',
				message: __( 'This file type is not allowed', 'elementor' ),
			} );
			return;
		}

		onFileSelect( file, e, 'browse' );

		if ( onFileChoose ) {
			onFileChoose( file );
		}
	};

	const handleButtonClick = ( e ) => {
		if ( onButtonClick ) {
			onButtonClick( e );
		}

		if ( fileInputRef.current ) {
			fileInputRef.current.click();
		}
	};

	const getAcceptedFileTypes = () => {
		const acceptTypes = [ ...filetypes ];
		const validExtensions = getValidExtensions();

		validExtensions.forEach( ( ext ) => {
			acceptTypes.push( `.${ ext }` );
		} );

		return acceptTypes.join( ',' );
	};

	return (
		<Box
			className={ className }
			onDragEnter={ handleDragEnter }
			onDragLeave={ handleDragLeave }
			onDragOver={ handleDragOver }
			onDrop={ handleDrop }
			data-testid="drop-zone"
			{ ...props }
		>
			<Box
				sx={ {
					border: 2,
					borderColor: isDragOver ? 'primary.main' : 'divider',
					borderStyle: 'dashed',
					backgroundColor: isDragOver ? 'action.hover' : 'background.default',
					transition: 'all 0.2s ease-in-out',
					cursor: isLoading ? 'not-allowed' : 'normal',
					position: 'relative',
				} }
			>
				<Stack
					alignItems="center"
					justifyContent="center"
					gap={ 1 }
					p={ 6 }
					minHeight="520px"
				>
					{ isLoading && (
						<Box
							position="absolute"
							top={ 0 }
							left={ 0 }
							right={ 0 }
							bottom={ 0 }
							display="flex"
							alignItems="center"
							justifyContent="center"
							bgcolor="action.hover"
							zIndex={ 1 }
							data-testid="loading-overlay"
						>
							<CircularProgress size={ 40 } data-testid="loading-spinner" />
						</Box>
					) }

					<Box
						sx={ {
							opacity: isLoading ? 0.5 : 1,
							transition: 'opacity 0.2s ease-in-out',
						} }
						data-testid="icon-container"
					>
						{ icon ? (
							<Box
								component="i"
								className={ icon }
								sx={ {
									fontSize: '40px',
									color: 'text.disabled',
								} }
								data-testid="custom-icon"
							/>
						) : (
							<UploadIcon
								sx={ {
									fontSize: '40px',
									color: 'text.disabled',
								} }
								data-testid="upload-icon"
							/>
						) }
					</Box>

					<Stack spacing={ 2 } alignItems="center" textAlign="center" data-testid="text-container">
						<Typography
							variant="body1"
							component="div"
							color="text.primary"
							sx={ {
								opacity: isLoading ? 0.5 : 1,
								transition: 'opacity 0.2s ease-in-out',
								fontSize: '16px',
							} }
							data-testid="main-text"
						>
							<Link
								component="span"
								onClick={ handleButtonClick }
								sx={ {
									cursor: 'pointer',
								} }
								data-testid="click-to-upload"
							>
								{ __( 'Click to upload', 'elementor' ) }
							</Link>
							{ ' ' + __( 'or drag and drop', 'elementor' ) }
						</Typography>
						<Typography
							variant="body2"
							color={ error ? 'error' : 'text.secondary' }
							sx={ {
								opacity: isLoading ? 0.5 : 1,
								transition: 'opacity 0.2s ease-in-out',
								fontSize: '14px',
							} }
							data-testid="helper-text"
						>
							{ error ? error.message : __( 'Upload a .zip file', 'elementor' ) }
						</Typography>
					</Stack>

					<input
						ref={ fileInputRef }
						id={ fileInputId }
						type="file"
						accept={ getAcceptedFileTypes() }
						onChange={ handleFileInputChange }
						style={ { display: 'none' } }
						data-testid="file-input"
					/>
				</Stack>
			</Box>
		</Box>
	);
};

DropZone.propTypes = {
	className: PropTypes.string,
	onFileSelect: PropTypes.func.isRequired,
	onError: PropTypes.func,
	filetypes: PropTypes.array,
	icon: PropTypes.string,
	isLoading: PropTypes.bool,
	error: PropTypes.shape( {
		message: PropTypes.string.isRequired,
	} ),
	onButtonClick: PropTypes.func,
	onFileChoose: PropTypes.func,
};

export default DropZone;
