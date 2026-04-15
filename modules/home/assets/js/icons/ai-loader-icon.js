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
					<linearGradient id="sitePlannerLoaderGradient" x1="2.25" y1="12" x2="21.75" y2="12" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#696199" />
						<stop offset="1" stopColor="#C945C9" />
					</linearGradient>
				</defs>
				<path
					d="M12 2.25 A 9.75 9.75 0 1 1 2.25 12"
					fill="none"
					stroke="url(#sitePlannerLoaderGradient)"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</SvgIcon>
		</Box>
		<AiStarsIcon
			sx={ {
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				width: 9.6,
				height: 9.6,
				color: '#171719',
			} }
		/>
	</Box>
);

export default AiLoaderIcon;
