import { SvgIcon } from '@elementor/ui';

const AiStarsIcon = ( props ) => (
	<SvgIcon viewBox="0 0 10 10" sx={ { width: 10, height: 10 } } { ...props }>
		<path
			d="M4.8 0C4.8 2.2 3 4 0.8 4C3 4 4.8 5.8 4.8 8C4.8 5.8 6.6 4 8.8 4C6.6 4 4.8 2.2 4.8 0Z"
			fill="currentColor"
		/>
		<path
			d="M8 5.6C8 6.8 7 7.8 5.8 7.8C7 7.8 8 8.8 8 10C8 8.8 9 7.8 10.2 7.8C9 7.8 8 6.8 8 5.6Z"
			fill="currentColor"
			opacity="0.6"
		/>
	</SvgIcon>
);

export default AiStarsIcon;
