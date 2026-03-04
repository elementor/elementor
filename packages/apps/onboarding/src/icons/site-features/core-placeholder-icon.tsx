import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const CorePlaceholderIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >(
	( props, ref ) => {
		return (
			<SvgIcon viewBox="0 0 26 26" { ...props } ref={ ref } width="26" height="26">
				<path
					d="M12.0833 12.75C12.0833 12.9268 12.1536 13.0964 12.2786 13.2214C12.4036 13.3464 12.5732 13.4167 12.75 13.4167C12.9268 13.4167 13.0964 13.3464 13.2214 13.2214C13.3464 13.0964 13.4167 12.9268 13.4167 12.75C13.4167 12.5732 13.3464 12.4036 13.2214 12.2786C13.0964 12.1536 12.9268 12.0833 12.75 12.0833C12.5732 12.0833 12.4036 12.1536 12.2786 12.2786C12.1536 12.4036 12.0833 12.5732 12.0833 12.75Z"
					fill="currentColor"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M3.41667 12.75C3.41667 13.9757 3.65808 15.1893 4.12712 16.3217C4.59617 17.4541 5.28366 18.483 6.15034 19.3497C7.01702 20.2163 8.04592 20.9038 9.17829 21.3729C10.3107 21.8419 11.5243 22.0833 12.75 22.0833C13.9757 22.0833 15.1893 21.8419 16.3217 21.3729C17.4541 20.9038 18.483 20.2163 19.3497 19.3497C20.2163 18.483 20.9038 17.4541 21.3729 16.3217C21.8419 15.1893 22.0833 13.9757 22.0833 12.75C22.0833 11.5243 21.8419 10.3107 21.3729 9.17829C20.9038 8.04592 20.2163 7.01702 19.3497 6.15034C18.483 5.28366 17.4541 4.59617 16.3217 4.12712C15.1893 3.65808 13.9757 3.41667 12.75 3.41667C11.5243 3.41667 10.3107 3.65808 9.17829 4.12712C8.04592 4.59617 7.01702 5.28366 6.15034 6.15034C5.28366 7.01702 4.59617 8.04592 4.12712 9.17829C3.65808 10.3107 3.41667 11.5243 3.41667 12.75Z"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12.75 0.75V3.41667"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M0.75 12.75H3.41667"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M12.75 22.0833V24.75"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M22.0833 12.75H24.75"
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
