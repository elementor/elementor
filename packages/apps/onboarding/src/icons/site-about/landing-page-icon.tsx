import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const LandingPageIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<path
				d="M4 11V24C4 24.7957 4.31607 25.5587 4.87868 26.1213C5.44129 26.6839 6.20435 27 7 27H25C25.7957 27 26.5587 26.6839 27.1213 26.1213C27.6839 25.5587 28 24.7957 28 24V11M4 11V8C4 7.20435 4.31607 6.44129 4.87868 5.87868C5.44129 5.31607 6.20435 5 7 5H25C25.7957 5 26.5587 5.31607 27.1213 5.87868C27.6839 6.44129 28 7.20435 28 8V11M4 11H28M7 8H7.01067V8.01067H7V8ZM10 8H10.0107V8.01067H10V8ZM13 8H13.0107V8.01067H13V8Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
} );

export default LandingPageIcon;
