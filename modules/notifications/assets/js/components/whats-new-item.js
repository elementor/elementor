import { Box, Button, Chip, Divider, Link, Typography } from '@elementor/ui';
import { WhatsNewItemTopicLine } from './whats-new-item-topic-line';
import { WrapperWithLink } from './wrapper-with-link';
import { WhatsNewItemMedia } from './whats-new-item-media';
import { WhatsNewItemChips } from './whats-new-item-chips';
import { isImageOnly } from './is-image-only';

export const WhatsNewItem = ( { item, itemIndex, itemsLength, setIsOpen, featured = false } ) => {
	const hasMedia = item.imageSrc || item.gifSrc || item.youtubeEmbedId;

	if ( isImageOnly( item ) ) {
		return (
			<Box
				key={ itemIndex }
				display="flex"
				flexDirection="column"
				sx={ {
					pt: 2,
					...( featured && { px: 1 } ),
				} }
			>
				<WhatsNewItemMedia item={ item } />
				{ itemIndex !== itemsLength - 1 && (
					<Divider
						sx={ {
							my: 1,
						} }
					/>
				) }
			</Box>
		);
	}

	return (
		<Box
			key={ itemIndex }
			display="flex"
			flexDirection="column"
			sx={ {
				pt: 2,
				...( featured && { px: 1 } ),
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
					variant={ featured ? 'h6' : 'subtitle1' }
					sx={ { pb: 2 } }
				>
					{ item.title }
				</Typography>
			</WrapperWithLink>
			<Box sx={ { position: 'relative' } }>
				<WhatsNewItemMedia item={ item } />
				{ featured && item.chipPlan && hasMedia && (
					<Chip
						label={ item.chipPlan }
						color="promotion"
						size="small"
						sx={ { position: 'absolute', top: 8, insetInlineStart: 8 } }
					/>
				) }
			</Box>

			<WhatsNewItemChips
				chipPlan={ featured && hasMedia ? null : item.chipPlan }
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
						onClick={ item.ctaLink.startsWith( '#' ) ? () => setIsOpen( false ) : undefined }
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
	featured: PropTypes.bool,
};
