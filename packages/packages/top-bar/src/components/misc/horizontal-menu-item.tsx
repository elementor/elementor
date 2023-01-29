import { IconButton, styled, svgIconClasses, IconButtonProps } from '@elementor/ui';
import Tooltip from './tooltip';

const Button = styled( IconButton )( ( ) => ( {
	borderRadius: '8px',
	padding: '6px',
	color: '#fff',
	fontSize: '14px',
	fontWeight: 300,
	display: 'flex',
	alignItems: 'center',

	'&:hover, &:active': {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},

	[ `& .${ svgIconClasses.root }` ]: {
		fill: '#fff',
		width: '20px',
		height: '20px',
	},
} ) );

type Props = IconButtonProps & {
	title?: string;
	selected?: boolean;
}

export default function HorizontalMenuItem( { title, ...props }: Props ) {
	return (
		<Tooltip title={ title }>
			<Button { ...props } aria-label={ title } />
		</Tooltip>
	);
}
