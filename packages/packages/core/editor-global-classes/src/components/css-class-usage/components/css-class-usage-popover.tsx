import * as React from 'react';
import { PopoverBody, PopoverHeader, PopoverMenuList } from '@elementor/editor-ui';
import { CurrentLocationIcon } from '@elementor/icons';
import { Box, Chip, Divider, MenuList, Stack, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCssClassUsageByID } from '../hooks';

export const CssClassUsagePopover = ( {
	cssClassID,
	onClose,
}: {
	onClose: React.ComponentProps< typeof PopoverHeader >[ 'onClose' ];
	cssClassID: string;
} ) => {
	const { data: classUsage } = useCssClassUsageByID( cssClassID );
	const items = classUsage?.content.map( ( { title, elements, pageId } ) => ( {
		type: 'item' as const,
		value: pageId,
		label: title,
		secondaryText: elements.length.toString(),
	} ) );

	return (
		<>
			<PopoverHeader
				icon={ <CurrentLocationIcon fontSize={ 'tiny' } /> }
				title={
					<Stack flexDirection={ 'row' } gap={ 1 } alignItems={ 'center' }>
						<Box aria-label={ 'header-title' }>{ __( 'Locator', 'elementor' ) }</Box>
						<Box>
							<Chip sx={ { lineHeight: 1 } } size={ 'tiny' } label={ classUsage?.total || 1 } />
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
									gap: 1,
								} }
							>
								{ item.label }
							</Box>
							<Chip size={ 'tiny' } label={ item.secondaryText } />
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
