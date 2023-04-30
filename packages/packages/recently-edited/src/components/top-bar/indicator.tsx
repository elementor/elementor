import { Typography, Stack, Tooltip as BaseTooltip, TooltipProps } from '@elementor/ui';
import { Document } from '@elementor/documents';

type Props = {
	title: Document['title'],
	status: Document['status']
}

export default function Indicator( { title, status }: Props ) {
	return (
		<Tooltip title={ title }>
			<Stack direction="row" alignItems="center" spacing={ 2 }>
				<Typography variant="body2" sx={ { maxWidth: '120px' } } noWrap>
					{ title }
				</Typography>
				{ status.value !== 'publish' &&
					<Typography variant="body2" sx={ { fontStyle: 'italic' } }>
						({ status.label })
					</Typography>
				}
			</Stack>
		</Tooltip>
	);
}

function Tooltip( props: TooltipProps ) {
	return <BaseTooltip
		PopperProps={ {
			sx: {
				'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
					mt: 7,
				},
			},
		} }
		{ ...props }
	/>;
}
