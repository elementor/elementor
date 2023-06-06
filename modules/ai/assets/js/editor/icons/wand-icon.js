import { SvgIcon } from '@elementor/ui';

const WandIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M6 21l15 -15l-3 -3l-15 15l3 3"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M15 6l3 3"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"></path>
		</SvgIcon>
	);
} );

export default WandIcon;
