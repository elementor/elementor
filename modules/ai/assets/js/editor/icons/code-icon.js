import { SvgIcon } from '@elementor/ui';

const CodeIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 16 16" { ...props } ref={ ref }>
			<path fillRule="evenodd" d="M5.02 5.48a.5.5 0 0 1 0 .706L2.707 8.5l2.313 2.314a.5.5 0 1 1-.707.707L1.646 8.853a.5.5 0 0 1 0-.707l2.667-2.667a.5.5 0 0 1 .707 0ZM10.98 5.48a.5.5 0 0 1 .707 0l2.667 2.666a.5.5 0 0 1 0 .707l-2.667 2.667a.5.5 0 0 1-.707-.707l2.313-2.314-2.313-2.313a.5.5 0 0 1 0-.707ZM9.455 2.681a.5.5 0 0 1 .363.606L7.152 13.954a.5.5 0 0 1-.97-.243L8.848 3.045a.5.5 0 0 1 .607-.364Z" clipRule="evenodd" />
		</SvgIcon>
	);
} );

export default CodeIcon;
