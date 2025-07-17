import * as React from 'react';
import { ClearIcon } from '@elementor/icons';
import { IconButton, type SxProps, type Theme, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilterAndSortContext } from '../context';

type ClearIconButtonProps = { tooltipText: React.ReactNode; sxStyle?: SxProps< Theme > };

export const ClearIconButton = ( { tooltipText, sxStyle }: ClearIconButtonProps ) => {
	const { onReset } = useFilterAndSortContext();
	return (
		<Tooltip title={ tooltipText } placement="top">
			<IconButton
				key={ 'clear-filters' }
				size="tiny"
				onClick={ onReset }
				aria-label={ __( 'Clear filters', 'elementor' ) }
				sx={ sxStyle }
			>
				<ClearIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
