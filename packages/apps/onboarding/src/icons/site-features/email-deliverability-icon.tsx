import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const EmailDeliverabilityIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >(
	( props, ref ) => {
		return (
			<SvgIcon viewBox="0 0 27 26" { ...props } ref={ ref } width="27" height="26">
				<path
					d="M10.4232 22.8185H5.44055C2.85003 22.8185 0.75 20.7185 0.75 18.128V5.15636C0.75 3.17638 2.34892 1.56771 4.32887 1.55962C9.76059 1.53744 15.1922 1.5374 20.6239 1.5596C22.6039 1.56769 24.2028 3.17636 24.2028 5.15632V12.6031"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<path
					d="M1.87598 2.66406L10.0065 7.70068C11.5198 8.63814 13.4334 8.63814 14.9467 7.70068L23.0773 2.66406"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<path
					d="M24.748 17.62L16.0747 12.2156C15.0735 11.5918 13.8674 12.6355 14.341 13.7158L16.1735 17.8962C16.3082 18.2033 16.3082 18.5527 16.1735 18.8598L14.2571 23.2315C13.7914 24.2939 14.9542 25.3331 15.9578 24.7515L24.7151 19.6767C25.4982 19.223 25.5162 18.0987 24.748 17.62Z"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
				/>
				<path
					d="M9.22363 18.6016L11.6236 18.6016"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<path
					d="M6.52344 14.3984L10.7234 14.3984"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</SvgIcon>
		);
	}
);

export default EmailDeliverabilityIcon;
