import * as React from 'react';
import { CheckedCircleIcon } from '@elementor/icons';
import { Box, Stack, styled, Typography, useTheme } from '@elementor/ui';

import { ElementorBoxIcon, HelloLayoutIcon, PlusIcon } from '../../icons';
import { t } from '../../utils/translations';
import { InstalledChip } from './styled-components';

const HELLO_BADGE_BG_COLOR = '#491146';

const PreviewRoot = styled( Stack )( {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	position: 'relative',
} );

const PlusConnector = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	marginInline: theme.spacing( -1.5 ),
	position: 'relative',
	zIndex: 3,
	flexShrink: 0,
} ) );

const PlusKnockout = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: theme.palette.background.default,
	borderRadius: '50%',
	padding: theme.spacing( 0.25 ),
} ) );

const HelloCard = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: theme.spacing( 1 ),
	inlineSize: theme.spacing( 18 ),
	blockSize: theme.spacing( 18 ),
	borderRadius: theme.spacing( 1.5 ),
	border: `2px solid ${ theme.palette.text.primary }`,
	backgroundColor: theme.palette.background.paper,
	position: 'relative',
	flexShrink: 0,
	zIndex: 2,
} ) );

const HelloBadge = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	insetBlockStart: theme.spacing( -1.25 ),
	insetInlineEnd: theme.spacing( -1.25 ),
	padding: theme.spacing( 0.5, 1.25 ),
	borderRadius: theme.spacing( 2.5 ),
	backgroundColor: HELLO_BADGE_BG_COLOR,
	color: theme.palette.common.white,
	zIndex: 3,
} ) );

interface HelloThemePreviewProps {
	isInstalled?: boolean;
}

export function HelloThemePreview( { isInstalled = false }: HelloThemePreviewProps ) {
	const theme = useTheme();

	return (
		<PreviewRoot data-testid="hello-theme-preview">
			<ElementorBoxIcon sx={ { fontSize: theme.spacing( 15 ), flexShrink: 0 } } />

			<PlusConnector>
				<PlusKnockout>
					<PlusIcon sx={ { fontSize: theme.spacing( 5 ), color: 'text.primary' } } />
				</PlusKnockout>
			</PlusConnector>

			<HelloCard>
				{ isInstalled ? (
					<InstalledChip
						label={ t( 'common.installed' ) }
						size="small"
						color="success"
						icon={ <CheckedCircleIcon /> }
						sx={ {
							position: 'absolute',
							insetBlockStart: theme.spacing( 1 ),
							insetInlineStart: theme.spacing( 1 ),
							zIndex: 3,
						} }
					/>
				) : (
					<HelloBadge>
						<Typography variant="caption" color="inherit" sx={ { fontWeight: 600, lineHeight: 1.2 } }>
							{ t( 'steps.theme_selection.theme_hello_label' ) }
						</Typography>
					</HelloBadge>
				) }

				<HelloLayoutIcon sx={ { fontSize: theme.spacing( 6 ), color: 'text.primary' } } />

				<Typography variant="caption" color="text.secondary" sx={ { lineHeight: 1.2 } }>
					{ t( 'steps.theme_selection.by_elementor' ) }
				</Typography>
			</HelloCard>
		</PreviewRoot>
	);
}
