import { Box, Button, Divider, Link, Typography } from '@elementor/ui';
import { WhatsNewItemTopicLine } from './whats-new-item-topic-line';
import { WrapperWithLink } from './wrapper-with-link';
import { WhatsNewItemThumbnail } from './whats-new-item-thumbnail';
import { WhatsNewItemChips } from './whats-new-item-chips';

export const WhatsNewItem = ( { item, itemIndex, itemsLength, setIsOpen } ) => {
	return (
		<Box
			key={ itemIndex }
			display="flex"
			flexDirection="column"
			sx={ {
				pt: 2,
			} }
		>
			{ ( item.topic || item.date ) && (
				<WhatsNewItemTopicLine
					topic={ item.topic }
					date={ item.date }
				/>
			) }
			<WrapperWithLink link={ item.link }>
				<Typography
					variant="subtitle1"
					sx={ {
						pb: 2,
					} }
				>
					{ item.title }
				</Typography>
			</WrapperWithLink>
			{ item.imageSrc && (
				<WhatsNewItemThumbnail
					imageSrc={ item.imageSrc }
					link={ item.link }
					title={ item.title }
				/>
			) }

			<WhatsNewItemChips
				chipPlan={ item.chipPlan }
				chipTags={ item.chipTags }
				itemIndex={ itemIndex }
			/>

			{ item.description && (
				<Typography
					variant="body2"
					color="text.secondary"
					sx={ {
						pb: 2,
					} }
				>
					{ item.description }
					{ item.readMoreText && (
						<>
							{ ' ' }
							<Link
								href={ item.link }
								color="info.main"
								target="_blank"
							>
								{ item.readMoreText }
							</Link>
						</>
					) }
				</Typography>
			) }
			{ item.cta && item.ctaLink && (
				<Box
					sx={ {
						pb: 2,
					} }
				>
					<Button
						href={ item.ctaLink }
						target={ item.ctaLink.startsWith( '#' ) ? '_self' : '_blank' }
						variant="contained"
						size="small"
						color="promotion"
						onClick={ item.ctaLink.startsWith( '#' ) ? () => setIsOpen( false ) : () => {} }
					>
						{ item.cta }
					</Button>
				</Box>
			) }
			{ itemIndex !== itemsLength - 1 && (
				<Divider
					sx={ {
						my: 1,
					} }
				/>
			) }
		</Box>
	);
};

WhatsNewItem.propTypes = {
	item: PropTypes.object.isRequired,
	itemIndex: PropTypes.number.isRequired,
	itemsLength: PropTypes.number.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};
