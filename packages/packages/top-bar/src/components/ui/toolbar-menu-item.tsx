import { IconButton, IconButtonProps, Tooltip } from '@elementor/ui';

type Props = IconButtonProps & {
	title?: string;
	selected?: boolean;
}

export default function ToolbarMenuItem( { title, ...props }: Props ) {
	return (
		<Tooltip title={ title }>
			<span>
				<IconButton { ...props } aria-label={ title } />
			</span>
		</Tooltip>
	);
}
