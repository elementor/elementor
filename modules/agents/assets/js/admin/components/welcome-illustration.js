import SvgIcon from '@elementor/ui/SvgIcon';

const ILLUSTRATION_WIDTH = 205;
const ILLUSTRATION_HEIGHT = 94;

export const WelcomeIllustration = () => {
	return (
		<SvgIcon
			viewBox={ `0 0 ${ ILLUSTRATION_WIDTH } ${ ILLUSTRATION_HEIGHT }` }
			sx={ {
				width: ILLUSTRATION_WIDTH,
				height: ILLUSTRATION_HEIGHT,
			} }
		>
			<path d="M133.046 0.5H172.091C173.479 0.5 174.809 1.05115 175.79 2.03223L191.412 17.6543C192.393 18.6354 192.945 19.9661 192.945 21.3535V80.2383L192.938 80.5078C192.797 83.2717 190.512 85.4697 187.713 85.4697H133.046C130.157 85.4697 127.815 83.1274 127.815 80.2383V5.73145C127.815 2.84223 130.157 0.5 133.046 0.5Z" fill="#FFDFFB" stroke="#C946C9" />
			<path d="M174.815 2.41406C174.815 1.96875 175.353 1.74571 175.668 2.06055L191.234 17.626C191.548 17.9409 191.325 18.4794 190.88 18.4795H180.046C177.157 18.4795 174.815 16.1373 174.815 13.248V2.41406Z" fill="#FFDFFB" stroke="#C946C9" />
			<line x1="140.815" y1="30.5" x2="155.009" y2="30.5" stroke="white" strokeWidth="3" strokeLinecap="round" />
			<line x1="140.815" y1="39.0957" x2="175.069" y2="39.0957" stroke="white" strokeWidth="3" strokeLinecap="round" />
			<line x1="140.815" y1="47.6934" x2="175.069" y2="47.6934" stroke="white" strokeWidth="3" strokeLinecap="round" />
			<line x1="140.815" y1="56.291" x2="149.277" y2="56.291" stroke="white" strokeWidth="3" strokeLinecap="round" />
			<rect x="163.5" y="52.5" width="41" height="41" rx="20.5" fill="white" stroke="#C945C9" />
			<path d="M174 69.6654C174 68.7813 174.351 67.9335 174.976 67.3083C175.601 66.6832 176.449 66.332 177.333 66.332H190.667C191.551 66.332 192.399 66.6832 193.024 67.3083C193.649 67.9335 194 68.7813 194 69.6654V78.832C194 79.7161 193.649 80.5639 193.024 81.1891C192.399 81.8142 191.551 82.1654 190.667 82.1654H177.333C176.449 82.1654 175.601 81.8142 174.976 81.1891C174.351 80.5639 174 79.7161 174 78.832V69.6654Z" stroke="#C946C9" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M184 63V66.3333" stroke="#C946C9" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M180.666 73V73.0158" stroke="#C946C9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M187.334 73V73.0158" stroke="#C946C9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
			<g clipPath="url(#clip0_94_8723)">
				<path d="M101 52.998H101.5M104.5 52.998H106M109 52.998H115" stroke="#696299" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M111 56.998L115 52.998" stroke="#696299" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M111 48.998L115 52.998" stroke="#696299" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</g>
			<rect x="0.5" y="14.498" width="88" height="71" rx="4.93396" fill="white" stroke="#696299" />
			<circle cx="7.7413" cy="21.7901" r="1.35849" fill="#696299" />
			<circle cx="13.1754" cy="21.7901" r="1.35849" fill="#696299" />
			<circle cx="18.6092" cy="21.7901" r="1.35849" fill="#696299" />
			<rect x="12.0002" y="37.0938" width="30.1231" height="20.3774" rx="2.71698" fill="#696299" />
			<line x1="49.6467" y1="50.5352" x2="58.6959" y2="50.5352" stroke="#696299" strokeWidth="3" strokeLinecap="round" />
			<line x1="49.6467" y1="43.7422" x2="73.7575" y2="43.7422" stroke="#696299" strokeWidth="3" strokeLinecap="round" />
			<line x1="0.000244141" y1="28.5" x2="89.0002" y2="28.5" stroke="#696299" />
			<defs>
				<clipPath id="clip0_94_8723">
					<rect width="24" height="24" fill="white" transform="translate(96.0002 40.998)" />
				</clipPath>
			</defs>
		</SvgIcon>
	);
};
