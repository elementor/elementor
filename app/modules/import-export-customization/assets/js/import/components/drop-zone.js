import React, { useState, useRef, useId } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, Stack, Link, styled } from '@elementor/ui';
import { UploadIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

const StyledDropZoneBox = styled( Box )( ( { theme, isDragOver, isLoading } ) => ( {
	border: 2,
	borderColor: isDragOver ? theme.palette.primary.main : theme.palette.divider,
	borderStyle: 'dashed',
	backgroundColor: isDragOver ? theme.palette.action.hover : theme.palette.background.default,
	transition: 'all 0.2s ease-in-out',
	cursor: isLoading ? 'not-allowed' : 'normal',
	position: 'relative',
} ) );

const StyledContentStack = styled( Stack )( ( { isLoading } ) => ( {
	opacity: isLoading ? 0.5 : 1,
	transition: 'opacity 0.2s ease-in-out',
} ) );

const StyledUploadIcon = styled( UploadIcon )( ( { theme } ) => ( {
	fontSize: '40px',
	color: theme.palette.text.disabled,
} ) );

const StyledLoadingSpinner = styled( CircularProgress )( ( { theme } ) => ( {
	color: theme.palette.primary.dark,
} ) );

const StyledClickToUploadLink = styled( Link )( () => ( {
	cursor: 'pointer',
} ) );

const StyledDragDropText = styled( Typography )( ( { theme } ) => ( {
	marginLeft: theme.spacing( 0.5 ),
} ) );

const DropZone = ( {
	onFileSelect,
	onError = () => {},
	filetypes = [ 'application/zip' ],
	className = '',
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
			<StyledDropZoneBox isDragOver={ isDragOver } isLoading={ isLoading }>
				<StyledContentStack
					alignItems="center"
					justifyContent="center"
					gap={ 1 }
					p={ 6 }
					minHeight="520px"
					isLoading={ isLoading }
				>
					<Box data-testid="icon-container">
						{ isLoading ? (
							<StyledLoadingSpinner
								size={ 40 }
								data-testid="loading-spinner"
							/>
						) : (
							<StyledUploadIcon
								data-testid="upload-icon"
							/>
						) }
					</Box>

					<Stack spacing={ 2 } alignItems="center" textAlign="center" data-testid="text-container">
						<Box data-testid="main-text">
							<StyledClickToUploadLink
								variant="body1"
								component="span"
								onClick={ handleButtonClick }
								data-testid="click-to-upload"
							>
								{ __( 'Click to upload', 'elementor' ) }
							</StyledClickToUploadLink>
							<StyledDragDropText
								variant="body1"
								component="span"
								color="text.primary"
							>
								{ __( 'or drag and drop', 'elementor' ) }
							</StyledDragDropText>
						</Box>
						<Typography
							variant="body2"
							color={ error ? 'error' : 'text.secondary' }
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
				</StyledContentStack>
			</StyledDropZoneBox>
		</Box>
	);
};

DropZone.propTypes = {
	className: PropTypes.string,
	onFileSelect: PropTypes.func.isRequired,
	onError: PropTypes.func,
	filetypes: PropTypes.array,
	isLoading: PropTypes.bool,
	error: PropTypes.shape( {
		message: PropTypes.string.isRequired,
	} ),
	onButtonClick: PropTypes.func,
	onFileChoose: PropTypes.func,
};

export default DropZone;
