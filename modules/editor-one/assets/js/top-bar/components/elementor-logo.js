import { SvgIcon } from '@elementor/ui';

const ElementorLogo = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 25 24" { ...props }>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12.3708 0C5.74351 0 0.370789 5.37258 0.370789 12C0.370789 18.6274 5.74351 24 12.3708 24C18.9981 24 24.3708 18.6274 24.3708 12C24.3708 5.37258 18.9981 0 12.3708 0ZM10.3708 7H8.37079V17H10.3708V7ZM16.3708 7H12.3708V9H16.3708V7ZM12.3708 11H16.3708V13H12.3708V11ZM16.3708 15H12.3708V17H16.3708V15Z"
				fill="#fff"
			/>
		</SvgIcon>
	);
};

export default ElementorLogo;

