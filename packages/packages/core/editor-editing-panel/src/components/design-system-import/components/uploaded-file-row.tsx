import * as React from 'react';
import { XIcon } from '@elementor/icons';
import { Card, IconButton, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const BYTES_PER_KILOBYTE = 1024;

type Props = {
	file: File;
	onRemove: () => void;
};

const formatFileSize = ( sizeInBytes: number ) => {
	const kilobytes = Math.max( 1, Math.round( sizeInBytes / BYTES_PER_KILOBYTE ) );
	return `${ kilobytes }kb`;
};

export const UploadedFileRow = ( { file, onRemove }: Props ) => {
	return (
		<Card variant="outlined">
			<Stack direction="row" alignItems="center" justifyContent="space-between" padding={ 2 } spacing={ 2 }>
				<Stack direction="column" spacing={ 0.5 }>
					<Typography variant="subtitle2">{ file.name }</Typography>
					<Typography variant="caption" color="text.secondary">
						{ formatFileSize( file.size ) } · { __( 'Complete', 'elementor' ) }
					</Typography>
				</Stack>
				<IconButton size="small" onClick={ onRemove } aria-label={ __( 'Remove file', 'elementor' ) }>
					<XIcon fontSize="small" />
				</IconButton>
			</Stack>
		</Card>
	);
};
