import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const ClassesVariablesIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof SvgIcon>>((props, ref) => {
	return (
		<SvgIcon viewBox="0 0 32 32" {...props} ref={ref} width="32" height="32">
			<path
				d="M6.66797 4H12.0013C12.7085 4 13.3868 4.28095 13.8869 4.78105C14.387 5.28115 14.668 5.95942 14.668 6.66667V22.6667C14.668 24.0812 14.1061 25.4377 13.1059 26.4379C12.1057 27.4381 10.7491 28 9.33464 28C7.92015 28 6.56359 27.4381 5.5634 26.4379C4.56321 25.4377 4.0013 24.0812 4.0013 22.6667V6.66667C4.0013 5.95942 4.28225 5.28115 4.78235 4.78105C5.28245 4.28095 5.96072 4 6.66797 4Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M14.6685 9.8029L17.3351 7.13623C17.8352 6.63631 18.5134 6.35547 19.2205 6.35547C19.9276 6.35547 20.6057 6.63631 21.1058 7.13623L24.8765 10.9069C25.3764 11.407 25.6572 12.0851 25.6572 12.7922C25.6572 13.4993 25.3764 14.1775 24.8765 14.6776L12.8765 26.6776"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M22.2686 17.332H25.3353C26.0425 17.332 26.7208 17.613 27.2209 18.1131C27.721 18.6132 28.002 19.2915 28.002 19.9987V25.332C28.002 26.0393 27.721 26.7176 27.2209 27.2176C26.7208 27.7177 26.0425 27.9987 25.3353 27.9987H9.33529"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M9.33496 22.668V22.6813"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
});

export default ClassesVariablesIcon;
