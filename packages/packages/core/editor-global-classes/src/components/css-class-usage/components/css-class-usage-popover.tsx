import * as React from 'react';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { PopoverBody, PopoverHeader, PopoverMenuList } from '@elementor/editor-ui';
import {
	CurrentLocationIcon,
	ExternalLinkIcon,
	FooterTemplateIcon,
	HeaderTemplateIcon,
	PageTypeIcon,
	PopupTemplateIcon,
	PostTypeIcon,
} from '@elementor/icons';
import { Box, Chip, Divider, Icon, IconButton, MenuList, Stack, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCssClassUsageByID } from '../hooks';

const iconMap: Record< string, React.ReactElement > = {
	'wp-post': <PostTypeIcon fontSize={ 'inherit' } />,
	'wp-page': <PageTypeIcon fontSize={ 'inherit' } />,
	popup: <PopupTemplateIcon fontSize={ 'inherit' } />,
	header: <HeaderTemplateIcon fontSize={ 'inherit' } />,
	footer: <FooterTemplateIcon fontSize={ 'inherit' } />,
};

export const CssClassUsagePopover = ( {
	cssClassID,
	onClose,
}: {
	onClose: React.ComponentProps< typeof PopoverHeader >[ 'onClose' ];
	cssClassID: string;
} ) => {
	const { data: classUsage } = useCssClassUsageByID( cssClassID );
	const onNavigate = useNavigateToDocument( { openNewTab: true } );

	const items = classUsage?.content.map( ( { title, elements, pageId, type } ) => ( {
		type: 'item' as const,
		value: pageId,
		label: title,
		secondaryText: elements.length.toString(),
		icon: iconMap[ type ],
	} ) );

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
			<PopoverBody width={ 344 }>
				<PopoverMenuList
					onSelect={ () => {} }
					items={ items }
					onClose={ () => {} }
					menuListTemplate={ StyledCssClassUsageItem }
					menuItemContentTemplate={ ( item ) => (
						<>
							<Box
								sx={ {
									flex: 1,
									minWidth: 0,
									display: 'flex',
									alignItems: 'center',
									gap: 1.5,
								} }
							>
								<Icon fontSize={ 'small' }>{ item.icon }</Icon>
								{ item.label }
							</Box>
							<Stack gap={ 0.5 } direction={ 'row' } alignItems={ 'center' }>
								<IconButton size={ 'tiny' } onClick={ () => onNavigate( +item.value ) }>
									<ExternalLinkIcon fontSize={ 'tiny' } />
								</IconButton>
								<Chip size={ 'tiny' } label={ item.secondaryText } />
							</Stack>
						</>
					) }
				/>
			</PopoverBody>
		</>
	);
};

const StyledCssClassUsageItem = styled( MenuList )( ( { theme } ) => ( {
	'& > li': {
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
	},
	width: '100%',
	position: 'relative',
} ) );
