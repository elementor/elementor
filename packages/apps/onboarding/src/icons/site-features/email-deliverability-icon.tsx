import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const EmailDeliverabilityIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof SvgIcon>>((props, ref) => {
	return (
		<SvgIcon viewBox="0 0 32 32" {...props} ref={ref} width="32" height="32">
			<path
				d="M13.8998 26.8185H8.91711C6.32659 26.8185 4.22656 24.7185 4.22656 22.128V9.15636C4.22656 7.17638 5.82548 5.56771 7.80544 5.55962C13.2372 5.53744 18.6688 5.5374 24.1005 5.5596C26.0804 5.56769 27.6793 7.17636 27.6793 9.15632V16.6031"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M5.35254 6.66406L13.4831 11.7007C14.9964 12.6381 16.91 12.6381 18.4233 11.7007L26.5538 6.66406"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M28.2246 21.62L19.5512 16.2156C18.5501 15.5918 17.344 16.6355 17.8176 17.7158L19.6501 21.8962C19.7847 22.2033 19.7847 22.5527 19.6501 22.8598L17.7337 27.2315C17.268 28.2939 18.4308 29.3331 19.4344 28.7515L28.1917 23.6767C28.9747 23.223 28.9927 22.0987 28.2246 21.62Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path
				d="M12.7002 22.6016L15.1002 22.6016"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M10 18.3984L14.2 18.3984"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</SvgIcon>
	);
});

export default EmailDeliverabilityIcon;
