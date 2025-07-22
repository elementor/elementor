import * as React from 'react';
import { type Document } from '@elementor/editor-documents';
import { Stack, Tooltip as BaseTooltip, type TooltipProps, Typography } from '@elementor/ui';

type Props = {
	title: Document[ 'title' ];
	status: Document[ 'status' ];
};

export default function Indicator( { title, status }: Props ) {
	return (
		<Tooltip title={ title }>
			<Stack component="span" direction="row" alignItems="center" spacing={ 0.5 }>
				<Typography component="span" variant="body2" sx={ { maxWidth: '120px' } } noWrap>
					{ title }
				</Typography>
				{ status.value !== 'publish' && (
					<Typography component="span" variant="body2" sx={ { fontStyle: 'italic' } }>
						({ status.label })
					</Typography>
				) }
			</Stack>
		</Tooltip>
	);
}

function Tooltip( props: TooltipProps ) {
	return (
		<BaseTooltip
			PopperProps={ {
				sx: {
					'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
						mt: 2.7,
					},
				},
			} }
			{ ...props }
		/>
	);
}
