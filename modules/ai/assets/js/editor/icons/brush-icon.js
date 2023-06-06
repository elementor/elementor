import { SvgIcon } from '@elementor/ui';

const BrushIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" clipRule="evenodd" stroke="none" d="M0 0h24v24H0z" fill="none"></path>
			<path fillRule="evenodd" clipRule="evenodd" stroke="none" d="M0 0h24v24H0z" fill="none"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M3 21v-4a4 4 0 1 1 4 4h-4"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M21 3a16 16 0 0 0 -12.8 10.2"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M21 3a16 16 0 0 1 -10.2 12.8"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M10.6 9a9 9 0 0 1 4.4 4.4"></path>
		</SvgIcon>
	);
} );

export default BrushIcon;
