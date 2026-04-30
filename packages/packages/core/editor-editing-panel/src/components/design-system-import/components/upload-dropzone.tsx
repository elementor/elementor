import * as React from 'react';
import { useRef } from 'react';
import { UploadIcon } from '@elementor/icons';
import { Card, Link, Stack, Typography, useUnstableDropZone } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { uploadBorderSx } from './upload-border-sx';

const ALLOWED_FILE_TYPES = [ 'application/zip' ] as const;
const FILE_INPUT_ACCEPT = 'application/zip,.zip';

type Props = {
	onFileSelected: ( file: File ) => void;
};

export const UploadDropzone = ( { onFileSelected }: Props ) => {
	const fileInputRef = useRef< HTMLInputElement >( null );

	const { getDropZoneProps } = useUnstableDropZone( {
		allowedFileTypes: [ ...ALLOWED_FILE_TYPES ],
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
			aria-label={ __( 'Design system file dropzone', 'elementor' ) }
			onDrop={ dropZoneProps.onDrop }
			onDragEnter={ dropZoneProps.onDragEnter }
			onDragLeave={ dropZoneProps.onDragLeave }
			onDragOver={ dropZoneProps.onDragOver }
			sx={ uploadBorderSx }
		>
			<Stack alignItems="center" spacing={ 1 } padding={ 3 }>
				<UploadIcon fontSize="medium" />
				<Stack direction="row" spacing={ 0.5 } alignItems="center">
					<Link component="button" type="button" underline="always" onClick={ handleBrowseClick }>
						<Typography variant="body1" component="span">
							{ __( 'Upload file', 'elementor' ) }
						</Typography>
					</Link>
					<Typography variant="body1">{ __( 'or drag and drop', 'elementor' ) }</Typography>
				</Stack>
				<Typography variant="caption" color="text.secondary">
					{ __( 'zip (max. 3MB)', 'elementor' ) }
				</Typography>
			</Stack>
			<input
				ref={ fileInputRef }
				type="file"
				accept={ FILE_INPUT_ACCEPT }
				hidden
				onChange={ handleFileInputChange }
			/>
		</Card>
	);
};
