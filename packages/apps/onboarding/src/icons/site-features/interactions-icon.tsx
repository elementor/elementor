import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const InteractionsIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >(
	( props, ref ) => {
		return (
			<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
				<path
					d="M12.3001 24.5497C12.1024 24.7925 11.8534 24.9888 11.5711 25.1243C11.2887 25.2598 10.9799 25.3313 10.6667 25.3337C10.0427 25.3337 9.44807 25.0483 9.03341 24.5497L3.21874 17.5523C2.86185 17.1138 2.66699 16.5657 2.66699 16.0003C2.66699 15.4349 2.86185 14.8868 3.21874 14.4483L9.03341 7.45099C9.23113 7.2081 9.48006 7.01189 9.76241 6.87636C10.0448 6.74083 10.3536 6.66934 10.6667 6.66699C11.2907 6.66699 11.8854 6.95233 12.3001 7.45099L18.1147 14.4483C18.4716 14.8868 18.6665 15.4349 18.6665 16.0003C18.6665 16.5657 18.4716 17.1138 18.1147 17.5523L12.3001 24.5497Z"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M22.667 6.66699L28.7817 14.4483C29.1386 14.8868 29.3334 15.4349 29.3334 16.0003C29.3334 16.5657 29.1386 17.1138 28.7817 17.5523L22.667 25.3337"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M17.333 6.66699L23.4477 14.4483C23.8046 14.8868 23.9994 15.4349 23.9994 16.0003C23.9994 16.5657 23.8046 17.1138 23.4477 17.5523L17.333 25.3337"
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

export default InteractionsIcon;
