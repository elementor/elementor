import { SvgIcon } from '@elementor/ui';

const RestoreIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 16 16" { ...props } ref={ ref }>
			<path fillRule="evenodd" d="M7.943 2.647a5.854 5.854 0 0 1 2.245.423.5.5 0 0 1-.374.928 4.854 4.854 0 0 0-4.313 8.664V10.5a.5.5 0 0 1 1 0v3.333a.5.5 0 0 1-.5.5H2.667a.5.5 0 1 1 0-1h2.03A5.854 5.854 0 0 1 7.944 2.647ZM12.247 4.774a.5.5 0 0 1 .5.5v.007a.5.5 0 0 1-1 0v-.007a.5.5 0 0 1 .5-.5ZM8.667 13.294a.5.5 0 0 1 .5.5v.007a.5.5 0 1 1-1 0v-.007a.5.5 0 0 1 .5-.5ZM11.227 12.247a.5.5 0 0 1 .5.5v.007a.5.5 0 1 1-1 0v-.007a.5.5 0 0 1 .5-.5ZM12.914 10.067a.5.5 0 0 1 .5.5v.007a.5.5 0 1 1-1 0v-.007a.5.5 0 0 1 .5-.5ZM13.294 7.334a.5.5 0 0 1 .5.5v.007a.5.5 0 1 1-1 0v-.007a.5.5 0 0 1 .5-.5Z" clipRule="evenodd" />
		</SvgIcon>
	);
} );

export default RestoreIcon;
