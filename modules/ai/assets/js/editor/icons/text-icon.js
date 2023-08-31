import { SvgIcon } from '@elementor/ui';

const TextIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 16 17" { ...props } ref={ ref }>
			<path fillRule="evenodd" d="M2.832 3.834a.5.5 0 0 1 .5-.5h9.333a.5.5 0 0 1 .5.5v1.333a.5.5 0 0 1-1 0v-.833H3.832v.833a.5.5 0 0 1-1 0V3.834Z" clipRule="evenodd" />
			<path fillRule="evenodd" d="M7.999 3.334a.5.5 0 0 1 .5.5v9.333a.5.5 0 1 1-1 0V3.834a.5.5 0 0 1 .5-.5Z" clipRule="evenodd" />
			<path fillRule="evenodd" d="M6.165 13.167a.5.5 0 0 1 .5-.5h2.667a.5.5 0 0 1 0 1H6.665a.5.5 0 0 1-.5-.5Z" clipRule="evenodd" />
		</SvgIcon>
	);
} );

export default TextIcon;
