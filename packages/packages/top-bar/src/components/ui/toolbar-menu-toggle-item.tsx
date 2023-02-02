import { styled, svgIconClasses, ToggleButton, toggleButtonClasses, ToggleButtonProps } from '@elementor/ui';
import Tooltip from './tooltip';

const Button = styled( ToggleButton )( () => ( {
	borderRadius: '8px',
	padding: '6px',
	color: '#fff',
	fontSize: '14px',
	fontWeight: 300,
	display: 'flex',
	alignItems: 'center',
	border: 0,
	boxShadow: 'none',

	[ [
		`&.${ toggleButtonClasses.selected }`,
		`&.${ toggleButtonClasses.selected }:hover`,
		'&:hover',
		'&:active',
	].join( ', ' ) ]: {
		border: 0,
		boxShadow: 'none',
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},

	[ `& .${ svgIconClasses.root }` ]: {
		fill: '#fff',
		width: '20px',
		height: '20px',
	},
} ) );

type Props = Omit<ToggleButtonProps, 'onChange'> & {
	title?: string;
	onClick?: () => void;
}

export default function ToolbarMenuToggleItem( { title, onClick, ...props }: Props ) {
	return (
		<Tooltip title={ title }>
			<Button { ...props } onChange={ onClick } />
		</Tooltip>
	);
}
