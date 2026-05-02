import { Box, SvgIcon } from '@elementor/ui';
import AiStarsIcon from './ai-stars-icon';

const AiLoaderIcon = () => (
	<Box sx={ { position: 'relative', width: 40, height: 40 } }>
		<Box
			sx={ {
				position: 'relative',
				width: 40,
				height: 40,
				borderRadius: '50%',
				background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F1FA 100%)',
				boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.28)',
			} }
		/>
		<Box
			sx={ {
				position: 'absolute',
				top: 8,
				left: 8,
				width: 24,
				height: 24,
				pointerEvents: 'none',
			} }
		>
			<SvgIcon
				viewBox="0 0 24 24"
				sx={ { width: 24, height: 24 } }
			>
				<defs>
					<linearGradient
						id="siteBuilderLoaderGradient"
						x1="10.6213"
						y1="18.7556"
						x2="21.3988"
						y2="18.6768"
						gradientUnits="userSpaceOnUse"
					>
						<stop offset="0" stopColor="#696199" />
						<stop offset="1" stopColor="#C945C9" />
					</linearGradient>
				</defs>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M6.58319 3.89317C8.18657 2.82183 10.0716 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3C12.75 3.41421 12.4142 3.75 12 3.75C10.3683 3.75 8.77326 4.23385 7.41655 5.14038C6.05984 6.0469 5.00242 7.33537 4.378 8.84286C3.75358 10.3504 3.5902 12.0092 3.90853 13.6095C4.22685 15.2098 5.01259 16.6798 6.16637 17.8336C7.32016 18.9874 8.79017 19.7732 10.3905 20.0915C11.9909 20.4098 13.6497 20.2464 15.1571 19.622C16.6646 18.9976 17.9531 17.9402 18.8596 16.5835C19.7661 15.2267 20.25 13.6317 20.25 12C20.25 11.5858 20.5858 11.25 21 11.25C21.4142 11.25 21.75 11.5858 21.75 12C21.75 13.9284 21.1782 15.8134 20.1068 17.4168C19.0355 19.0202 17.5127 20.2699 15.7312 21.0078C13.9496 21.7458 11.9892 21.9389 10.0979 21.5627C8.20656 21.1865 6.46927 20.2579 5.10571 18.8943C3.74215 17.5307 2.81355 15.7934 2.43735 13.9021C2.06114 12.0108 2.25422 10.0504 2.99218 8.26884C3.73013 6.48726 4.97982 4.96452 6.58319 3.89317Z"
					fill="url(#siteBuilderLoaderGradient)"
				/>
			</SvgIcon>
		</Box>
		<AiStarsIcon
			sx={ {
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				width: 10,
				height: 10,
			} }
		/>
	</Box>
);

export default AiLoaderIcon;
