import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { ControlAdornments, ControlFormLabel } from '@elementor/editor-controls';
import { InfoCircleIcon } from '@elementor/icons';
import { Stack, Tooltip } from '@elementor/ui';

type ControlLabelProps = PropsWithChildren< {
	infoTooltip?: string;
} >;

export const ControlLabel = ( { children, infoTooltip }: ControlLabelProps ) => {
	return (
		<Stack direction="row" alignItems="center" justifyItems="start" gap={ 0.25 }>
			<ControlFormLabel>{ children }</ControlFormLabel>
			{ infoTooltip && (
				<Tooltip title={ infoTooltip } placement="top">
					<InfoCircleIcon fontSize="tiny" />
				</Tooltip>
			) }
			<ControlAdornments />
		</Stack>
	);
};
