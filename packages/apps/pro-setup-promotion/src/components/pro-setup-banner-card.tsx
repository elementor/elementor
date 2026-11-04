import { DownloadIcon } from '@elementor/icons';
import { alpha, Box, Stack, Typography, type Theme } from '@elementor/ui';

type ProSetupBannerCardProps = {
	title: string;
	subtitle: string;
};

function getInfoBannerSurface( theme: Theme ) {
	const isDark = 'dark' === theme.palette.mode;
	const infoMain = theme.palette.info.main;

	return {
		bgcolor: alpha( infoMain, isDark ? 0.18 : 0.12 ),
		borderColor: alpha( infoMain, isDark ? 0.38 : 0.22 ),
	};
}

function getDownloadTileSurface( theme: Theme ) {
	const isDark = 'dark' === theme.palette.mode;

	if ( isDark ) {
		return {
			bgcolor: alpha( theme.palette.common.white, 0.08 ),
			borderColor: alpha( theme.palette.common.white, 0.16 ),
			color: theme.palette.text.primary,
		};
	}

	return {
		bgcolor: theme.palette.background.paper,
		borderColor: theme.palette.divider,
		color: theme.palette.text.secondary,
	};
}

function resolveFontWeight( weight: Theme[ 'typography' ][ 'fontWeightBold' ], extra = 0 ): number {
	const base = 'number' === typeof weight ? weight : Number.parseInt( String( weight ), 10 );

	return Number.isFinite( base ) ? base + extra : 700 + extra;
}

export function ProSetupBannerCard( { title, subtitle }: ProSetupBannerCardProps ) {
	return (
		<Stack
			className="pro-setup-banner-card"
			direction="row"
			alignItems="center"
			gap={ 1.25 }
			sx={ ( theme ) => {
				const surface = getInfoBannerSurface( theme );

				return {
					border: 1,
					borderColor: surface.borderColor,
					borderRadius: 1.5,
					bgcolor: surface.bgcolor,
					px: 1.25,
					py: 1,
					transition: theme.transitions.create( [ 'border-color', 'background-color' ], {
						duration: 150,
					} ),
				};
			} }
		>
			<Stack flex={ 1 } minWidth={ 0 } gap={ 0.25 } sx={ { textAlign: 'start' } }>
				<Typography
					variant="subtitle2"
					color="text.primary"
					sx={ ( theme ) => ( {
						lineHeight: 1.35,
						fontWeight: resolveFontWeight( theme.typography.fontWeightBold, 100 ),
					} ) }
					noWrap
				>
					{ title }
				</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={ ( theme ) => ( {
						lineHeight: 1.35,
						fontWeight: theme.typography.fontWeightRegular,
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					} ) }
				>
					{ subtitle }
				</Typography>
			</Stack>
			<Box
				aria-hidden
				sx={ ( theme ) => {
					const tile = getDownloadTileSurface( theme );

					return {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
						marginInlineStart: 'auto',
						width: 36,
						height: 36,
						borderRadius: 1,
						border: 1,
						borderColor: tile.borderColor,
						bgcolor: tile.bgcolor,
						color: tile.color,
					};
				} }
			>
				<DownloadIcon aria-hidden sx={ { fontSize: 18 } } />
			</Box>
		</Stack>
	);
}
