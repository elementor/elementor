import * as React from 'react';
import { __useOpenDocumentInNewTab as useOpenDocumentInNewTab } from '@elementor/editor-documents';
import {
	EllipsisWithTooltip,
	PopoverBody,
	PopoverHeader,
	PopoverMenuList,
	type VirtualizedItem,
} from '@elementor/editor-ui';
import {
	CurrentLocationIcon,
	ExternalLinkIcon,
	FooterTemplateIcon,
	HeaderTemplateIcon,
	PagesIcon,
	PopupTemplateIcon,
	PostTypeIcon,
} from '@elementor/icons';
import { Box, Chip, Divider, Icon, MenuList, Stack, styled, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCssClassUsageByID } from '../hooks';
import { type ContentType } from '../types';

type VirtualItem = VirtualizedItem< 'item', string > & { docType: ContentType };

const iconMapper: Record< ContentType, { label: string; icon: React.ReactElement } > = {
	'wp-post': {
		label: __( 'Post', 'elementor' ),
		icon: <PostTypeIcon fontSize={ 'inherit' } />,
	},
	'wp-page': {
		label: __( 'Page', 'elementor' ),
		icon: <PagesIcon fontSize={ 'inherit' } />,
	},
	popup: {
		label: __( 'Popup', 'elementor' ),
		icon: <PopupTemplateIcon fontSize={ 'inherit' } />,
	},
	header: {
		label: __( 'Header', 'elementor' ),
		icon: <HeaderTemplateIcon fontSize={ 'inherit' } />,
	},
	footer: {
		label: __( 'Footer', 'elementor' ),
		icon: <FooterTemplateIcon fontSize={ 'inherit' } />,
	},
};

export const CssClassUsagePopover = ( {
	cssClassID,
	onClose,
}: {
	onClose: React.ComponentProps< typeof PopoverHeader >[ 'onClose' ];
	cssClassID: string;
} ) => {
	const { data: classUsage } = useCssClassUsageByID( cssClassID );
	const onNavigate = useOpenDocumentInNewTab();

	const items: VirtualItem[] =
		classUsage?.content.map(
			( { title, elements, pageId, type } ) =>
				( {
					type: 'item',
					value: pageId,
					label: title,
					secondaryText: elements.length.toString(),
					docType: type,
				} ) as VirtualItem
		) ?? [];

	return (
		<>
			<PopoverHeader
				icon={ <CurrentLocationIcon fontSize={ 'tiny' } /> }
				title={
					<Stack flexDirection={ 'row' } gap={ 1 } alignItems={ 'center' }>
						<Box aria-label={ 'header-title' }>{ __( 'Locator', 'elementor' ) }</Box>
						<Box>
							<Chip sx={ { lineHeight: 1 } } size={ 'tiny' } label={ classUsage.total } />
						</Box>
					</Stack>
				}
				onClose={ onClose }
			/>
			<Divider />
			<PopoverBody width={ 300 }>
				<PopoverMenuList
					onSelect={ ( value ) => onNavigate( +value ) }
					items={ items }
					onClose={ () => {} }
					menuListTemplate={ StyledCssClassUsageItem }
					menuItemContentTemplate={ ( item ) => (
						<Stack minWidth={ 0 } direction={ 'row' } flex={ 1 } justifyContent={ 'space-between' }>
							<Stack alignItems={ 'center' } direction={ 'row' } gap={ 0.5 }>
								<Tooltip title={ iconMapper[ item.docType as ContentType ].label } placement="top">
									<Icon fontSize={ 'small' }>{ iconMapper[ item.docType as ContentType ].icon }</Icon>
								</Tooltip>
								<EllipsisWithTooltip
									title={ item.label }
									as={ Typography }
									variant="caption"
									maxWidth={ '173px' }
								/>
								<ExternalLinkIcon fontSize={ 'tiny' } className={ 'hover-only-icon' } />
							</Stack>
							<Chip
								sx={ {
									ml: 'auto',
								} }
								size={ 'tiny' }
								label={ item.secondaryText }
							/>
						</Stack>
					) }
				/>
			</PopoverBody>
		</>
	);
};

const StyledCssClassUsageItem = styled( MenuList )( ( { theme } ) => ( {
	'& > li': {
		cursor: 'pointer',
		height: 32,
		width: '100%',
		display: 'flex',
		alignItems: 'center',
	},
	'& > [role="option"]': {
		...theme.typography.caption,
		lineHeight: 'inherit',
		padding: theme.spacing( 0.5, 1, 0.5, 2 ),
		textOverflow: 'ellipsis',
		position: 'absolute',
		top: 0,
		left: 0,
		opacity: 1,
		'.hover-only-icon': {
			opacity: 0,
		},
		'&:hover': {
			backgroundColor: theme.palette.action.hover,
			'.hover-only-icon': {
				opacity: 1,
			},
		},
	},
	width: '100%',
	position: 'relative',
} ) );
