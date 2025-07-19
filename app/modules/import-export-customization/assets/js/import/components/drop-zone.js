import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, Stack, Link, styled } from '@elementor/ui';
import { UploadIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import useDropZone from '../hooks/use-drop-zone';
import { getAcceptedFileTypes } from '../utils/file-validation';

const StyledDropZoneBox = styled( Box, {
	shouldForwardProp: ( prop ) => ! [ 'isDragOver', 'isLoading' ].includes( prop ),
} )( ( { theme, isDragOver, isLoading } ) => ( {
	border: 2,
	borderColor: isDragOver ? theme.palette.primary.main : theme.palette.divider,
	borderStyle: 'dashed',
	backgroundColor: isDragOver ? theme.palette.action.hover : theme.palette.background.default,
	transition: 'all 0.2s ease-in-out',
	cursor: isLoading ? 'not-allowed' : 'normal',
	position: 'relative',
	borderRadius: theme.spacing( 0.5 ),
} ) );

const StyledContentStack = styled( Stack, {
	shouldForwardProp: ( prop ) => prop !== 'isLoading',
} )( ( { isLoading } ) => ( {
	opacity: isLoading ? 0.5 : 1,
	transition: 'opacity 0.2s ease-in-out',
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
	helperText = __( 'Upload a .zip file', 'elementor' ),
	...props
} ) => {
	const {
		isDragOver,
		fileInputRef,
		fileInputId,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleFileInputChange,
		handleUploadClick,
	} = useDropZone( {
		onFileSelect,
		onError,
		filetypes,
		isLoading,
		onButtonClick,
		onFileChoose,
	} );

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
							<CircularProgress
								size={ 40 }
								data-testid="loading-spinner"
								sx={ { color: 'primary.dark' } }
							/>
						) : (
							<UploadIcon
								data-testid="upload-icon"
								sx={ { fontSize: '40px', color: 'text.disabled' } }
							/>
						) }
					</Box>

					<Stack spacing={ 2 } alignItems="center" textAlign="center" data-testid="text-container">
						<Box data-testid="main-text">
							<Link
								variant="body1"
								component="span"
								onClick={ handleUploadClick }
								data-testid="click-to-upload"
							>
								{ __( 'Click to upload', 'elementor' ) }
							</Link>
							<Typography
								variant="body1"
								component="span"
								color="text.primary"
								sx={ { marginLeft: 0.5 } }
							>
								{ __( 'or drag and drop', 'elementor' ) }
							</Typography>
						</Box>
						<Typography
							variant="body2"
							color={ error ? 'error' : 'text.secondary' }
							data-testid="helper-text"
						>
							{ error ? error.message : helperText }
						</Typography>
					</Stack>

					<input
						ref={ fileInputRef }
						id={ fileInputId }
						type="file"
						accept={ getAcceptedFileTypes( filetypes ) }
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
	helperText: PropTypes.string,
};

export default DropZone;
