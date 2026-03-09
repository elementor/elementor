import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const CorePlaceholderIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >(
	( props, ref ) => {
		return (
			<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
				<path
					d="M15.333 15.9997C15.333 16.1765 15.4032 16.3461 15.5283 16.4711C15.6533 16.5961 15.8229 16.6663 15.9997 16.6663C16.1765 16.6663 16.3461 16.5961 16.4711 16.4711C16.5961 16.3461 16.6663 16.1765 16.6663 15.9997C16.6663 15.8229 16.5961 15.6533 16.4711 15.5283C16.3461 15.4032 16.1765 15.333 15.9997 15.333C15.8229 15.333 15.6533 15.4032 15.5283 15.5283C15.4032 15.6533 15.333 15.8229 15.333 15.9997Z"
					fill="currentColor"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M6.66699 16.0003C6.66699 17.226 6.90841 18.4397 7.37745 19.572C7.84649 20.7044 8.53398 21.7333 9.40066 22.6C10.2673 23.4667 11.2962 24.1542 12.4286 24.6232C13.561 25.0922 14.7747 25.3337 16.0003 25.3337C17.226 25.3337 18.4397 25.0922 19.572 24.6232C20.7044 24.1542 21.7333 23.4667 22.6 22.6C23.4667 21.7333 24.1542 20.7044 24.6232 19.572C25.0922 18.4397 25.3337 17.226 25.3337 16.0003C25.3337 14.7747 25.0922 13.561 24.6232 12.4286C24.1542 11.2962 23.4667 10.2673 22.6 9.40066C21.7333 8.53398 20.7044 7.84649 19.572 7.37745C18.4397 6.90841 17.226 6.66699 16.0003 6.66699C14.7747 6.66699 13.561 6.90841 12.4286 7.37745C11.2962 7.84649 10.2673 8.53398 9.40066 9.40066C8.53398 10.2673 7.84649 11.2962 7.37745 12.4286C6.90841 13.561 6.66699 14.7747 6.66699 16.0003Z"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M16 4V6.66667"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M4 16H6.66667"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M16 25.333V27.9997"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M25.333 16H27.9997"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</SvgIcon>
		);
	}
);

export default CorePlaceholderIcon;
