import * as React from 'react';
import { useRef } from 'react';
import { UploadIcon } from '@elementor/icons';
import { Card, Link, Stack, Typography, useUnstableDropZone } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { fileUploadBorderSx } from './upload-border-sx';

type Props = {
	onFileSelected: ( file: File ) => void;
	allowedFileTypes: string[];
	accept: string;
	regionLabel?: string;
	primaryLabel?: string;
	secondaryLabel?: string;
	helperText?: string;
};

export const FileUploadDropzone = ( {
	onFileSelected,
	allowedFileTypes,
	accept,
	regionLabel,
	primaryLabel,
	secondaryLabel,
	helperText,
}: Props ) => {
	const fileInputRef = useRef< HTMLInputElement >( null );

	const { getDropZoneProps } = useUnstableDropZone( {
		allowedFileTypes,
		onChange: ( { valid } ) => {
			if ( valid[ 0 ] ) {
				onFileSelected( valid[ 0 ] );
			}
		},
	} );

	const dropZoneProps = getDropZoneProps();

	const handleBrowseClick = () => fileInputRef.current?.click();

	const handleFileInputChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const file = event.target.files?.[ 0 ];
		if ( file ) {
			onFileSelected( file );
		}
		event.target.value = '';
	};

	return (
		<Card
			variant="outlined"
			role="region"
			aria-label={ regionLabel ?? __( 'File dropzone', 'elementor' ) }
			onDrop={ dropZoneProps.onDrop }
			onDragEnter={ dropZoneProps.onDragEnter }
			onDragLeave={ dropZoneProps.onDragLeave }
			onDragOver={ dropZoneProps.onDragOver }
			sx={ fileUploadBorderSx }
		>
			<Stack alignItems="center" spacing={ 1 } padding={ 3 }>
				<UploadIcon fontSize="medium" />
				<Stack direction="row" spacing={ 0.5 } alignItems="center">
					<Link component="button" type="button" underline="always" onClick={ handleBrowseClick }>
						<Typography variant="body1" component="span">
							{ primaryLabel ?? __( 'Upload file', 'elementor' ) }
						</Typography>
					</Link>
					<Typography variant="body1">{ secondaryLabel ?? __( 'or drag and drop', 'elementor' ) }</Typography>
				</Stack>
				{ helperText ? (
					<Typography variant="caption" color="text.secondary">
						{ helperText }
					</Typography>
				) : null }
			</Stack>
			<input ref={ fileInputRef } type="file" accept={ accept } hidden onChange={ handleFileInputChange } />
		</Card>
	);
};
