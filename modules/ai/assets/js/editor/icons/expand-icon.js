import { SvgIcon } from '@elementor/ui';

const ExpandIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M16 4l4 0l0 4"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M14 10l6 -6"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M8 20l-4 0l0 -4"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M4 20l6 -6"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M16 20l4 0l0 -4"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M14 14l6 6"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M8 4l-4 0l0 4"></path>
			<path fillRule="evenodd" clipRule="evenodd" d="M4 4l6 6"></path>
		</SvgIcon>
	);
} );

export default ExpandIcon;
