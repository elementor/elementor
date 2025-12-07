import { Button, Divider, Link, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';
import { ItemContainer, ItemCtaContainer, ItemImage, ItemMetaContainer } from './styled-components';

const WhatsNewItem = ( { item, isLast } ) => {
	return (
		<ItemContainer>
			{ ( item.topic || item.date ) && (
				<ItemMetaContainer>
					{ item.topic && (
						<Typography variant="caption" color="text.secondary">
							{ item.topic }
						</Typography>
					) }
					{ item.topic && item.date && (
						<Typography variant="caption" color="text.secondary">•</Typography>
					) }
					{ item.date && (
						<Typography variant="caption" color="text.secondary">
							{ item.date }
						</Typography>
					) }
				</ItemMetaContainer>
			) }
			<Typography variant="subtitle1" sx={ { pb: 1 } }>
				{ item.link ? (
					<Link href={ item.link } target="_blank" color="inherit" underline="hover">
						{ item.title }
					</Link>
				) : item.title }
			</Typography>
			{ item.imageSrc && (
				<ItemImage src={ item.imageSrc } alt={ item.title } />
			) }
			{ item.description && (
				<Typography variant="body2" color="text.secondary" sx={ { pb: 2 } }>
					{ item.description }
					{ item.readMoreText && item.link && (
						<>
							{ ' ' }
							<Link href={ item.link } color="info.main" target="_blank">
								{ item.readMoreText }
							</Link>
						</>
					) }
				</Typography>
			) }
			{ item.cta && item.ctaLink && (
				<ItemCtaContainer>
					<Button
						href={ item.ctaLink }
						target="_blank"
						variant="contained"
						size="small"
						color="promotion"
					>
						{ item.cta }
					</Button>
				</ItemCtaContainer>
			) }
			{ ! isLast && <Divider sx={ { my: 1 } } /> }
		</ItemContainer>
	);
};

WhatsNewItem.propTypes = {
	item: PropTypes.object.isRequired,
	isLast: PropTypes.bool.isRequired,
};

export default WhatsNewItem;

