import * as React from 'react';
import { CheckedCircleIcon } from '@elementor/icons';
import { Box, Stack, styled, Typography, useTheme } from '@elementor/ui';

import { ElementorLogoIcon, HelloLayoutIcon, PlusIcon } from '../../icons';
import { t } from '../../utils/translations';
import { InstalledChip } from './styled-components';

const HELLO_BADGE_BG_COLOR = '#ED01EE';
const LEFT_CARD_SIZE = 120;
const RIGHT_CARD_SIZE = 144;
const CARDS_OVERLAP = 15;
const PLUS_SIZE = 32;

const PreviewRoot = styled( Box )( {
	position: 'relative',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
} );

const ElementorPlaceholderCard = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	inlineSize: LEFT_CARD_SIZE,
	blockSize: LEFT_CARD_SIZE,
	borderRadius: theme.spacing( 1.25 ),
	border: `2px dashed ${ theme.palette.divider }`,
	backgroundColor: '#F4F4F4',
	flexShrink: 0,
} ) );

const HelloCard = styled( Box )( ( { theme } ) => ( {
	position: 'relative',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'flex-start',
	gap: theme.spacing( 1.5 ),
	inlineSize: RIGHT_CARD_SIZE,
	blockSize: RIGHT_CARD_SIZE,
	paddingBlockStart: theme.spacing( 5.5 ),
	paddingBlockEnd: theme.spacing( 2.5 ),
	borderRadius: theme.spacing( 1.25 ),
	border: `2px solid ${ theme.palette.common.black }`,
	backgroundColor: theme.palette.background.paper,
	marginInlineStart: `-${ CARDS_OVERLAP }px`,
	flexShrink: 0,
	zIndex: 1,
} ) );

const HelloBadge = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	insetBlockStart: theme.spacing( -1.5 ),
	insetInlineEnd: theme.spacing( -1.5 ),
	paddingBlock: theme.spacing( 0.375 ),
	paddingInline: theme.spacing( 1 ),
	borderRadius: theme.spacing( 2.5 ),
	backgroundColor: HELLO_BADGE_BG_COLOR,
	color: theme.palette.common.white,
	zIndex: 2,
} ) );

const PlusOverlay = styled( Box )( {
	position: 'absolute',
	insetBlockStart: '50%',
	insetInlineStart: `${ LEFT_CARD_SIZE - CARDS_OVERLAP }px`,
	transform: 'translate(-50%, -50%)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	zIndex: 3,
	pointerEvents: 'none',
} );

interface HelloThemePreviewProps {
	isInstalled?: boolean;
}

export function HelloThemePreview( { isInstalled = false }: HelloThemePreviewProps ) {
	const theme = useTheme();

	return (
		<Stack alignItems="center" width="100%" data-testid="hello-theme-preview">
			<PreviewRoot>
				<ElementorPlaceholderCard>
					<ElementorLogoIcon sx={ { fontSize: theme.spacing( 5.5 ) } } />
				</ElementorPlaceholderCard>

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
								zIndex: 2,
							} }
						/>
					) : (
						<HelloBadge>
							<Typography variant="caption" color="inherit" sx={ { fontWeight: 400, lineHeight: 1.5 } }>
								{ t( 'steps.theme_selection.theme_hello_label' ) }
							</Typography>
						</HelloBadge>
					) }

					<HelloLayoutIcon sx={ { fontSize: theme.spacing( 6 ), color: 'common.black' } } />

					<Typography variant="caption" color="text.secondary">
						{ t( 'steps.theme_selection.by_elementor' ) }
					</Typography>
				</HelloCard>

				<PlusOverlay>
					<PlusIcon sx={ { fontSize: PLUS_SIZE, color: 'common.black' } } />
				</PlusOverlay>
			</PreviewRoot>
		</Stack>
	);
}
