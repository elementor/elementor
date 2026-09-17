import * as React from 'react';
import { XIcon } from '@elementor/icons';
import { Card, IconButton, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const BYTES_PER_KILOBYTE = 1024;

const cardSx = {
	minHeight: 152,
	border: '2px dashed',
	borderColor: 'divider',
	borderRadius: 1,
};

type Props = {
	file: File;
	onRemove: () => void;
	statusLabel?: string;
};

const formatFileSize = ( sizeInBytes: number ) => {
	const kilobytes = Math.max( 1, Math.round( sizeInBytes / BYTES_PER_KILOBYTE ) );
	return `${ kilobytes }kb`;
};

export const FileUploadRow = ( { file, onRemove, statusLabel }: Props ) => {
	return (
		<Card variant="outlined" sx={ cardSx }>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				padding={ 2 }
				spacing={ 2 }
				minHeight={ 152 }
			>
				<Stack direction="column" spacing={ 0.5 } minWidth={ 0 } flex={ 1 }>
					<Typography variant="subtitle2" noWrap>
						{ file.name }
					</Typography>
					<Typography variant="caption" color="text.secondary" noWrap>
						{ formatFileSize( file.size ) } · { statusLabel ?? __( 'Complete', 'elementor' ) }
					</Typography>
				</Stack>
				<IconButton size="small" onClick={ onRemove } aria-label={ __( 'Remove file', 'elementor' ) }>
					<XIcon fontSize="inherit" />
				</IconButton>
			</Stack>
		</Card>
	);
};
