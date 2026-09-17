import { useState } from 'react';
import { Box, Button, Collapse, Divider, Link, Typography } from '@elementor/ui';
import { ChevronDownIcon } from '@elementor/icons';
import { WhatsNewItemMedia } from './whats-new-item-media';
import { WhatsNewItemChips } from './whats-new-item-chips';

export const WhatsNewItemCollapsed = ( { item, itemIndex, isNew, onSeen, setIsOpen } ) => {
	const [ expanded, setExpanded ] = useState( false );

	const handleToggle = () => {
		if ( ! expanded && isNew && onSeen ) {
			onSeen( item.id );
		}
		setExpanded( ! expanded );
	};

	const handleKeyDown = ( event ) => {
		if ( 'Enter' === event.key || ' ' === event.key ) {
			event.preventDefault();
			handleToggle();
		}
	};

	return (
		<Box>
			<Box
				role="button"
				tabIndex={ 0 }
				aria-expanded={ expanded }
				onClick={ handleToggle }
				onKeyDown={ handleKeyDown }
				sx={ {
					position: 'relative',
					display: 'flex',
					alignItems: 'flex-start',
					gap: 1,
					cursor: 'pointer',
					py: 2,
					paddingInlineStart: 1,
				} }
			>
				<Box
					component="span"
					sx={ {
						position: 'absolute',
						insetInlineStart: '-6px',
						top: '23px',
						width: 6,
						height: 6,
						borderRadius: '50%',
						backgroundColor: 'primary.main',
						opacity: isNew ? 1 : 0,
						transition: 'opacity 0.2s ease',
						pointerEvents: 'none',
					} }
				/>
				<Box sx={ { flex: 1, minWidth: 0 } }>
					{ item.topic && (
						<Typography variant="caption" color="text.tertiary" display="block">
							{ item.topic }
						</Typography>
					) }
					<Typography variant="subtitle2" noWrap>{ item.title }</Typography>
					{ item.description && (
						<Box sx={ {
							maxHeight: expanded ? 0 : '3em',
							opacity: expanded ? 0 : 1,
							overflow: 'hidden',
							transition: 'max-height 0.2s ease, opacity 0.15s ease',
						} }>
							<Typography variant="caption" color="text.secondary" sx={ {
								display: '-webkit-box',
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
							} }>
								{ item.description }
							</Typography>
						</Box>
					) }
				</Box>
				<ChevronDownIcon
					sx={ {
						flexShrink: 0,
						color: 'secondary.main',
						fontSize: 'small',
						mt: 0.25,
						transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
						transition: 'transform 0.2s',
					} }
				/>
			</Box>
			<Collapse in={ expanded }>
				<Box sx={ { pb: 2, paddingInlineStart: 1 } }>
					<WhatsNewItemMedia item={ item } />
					<WhatsNewItemChips
						chipPlan={ item.chipPlan }
						chipTags={ item.chipTags }
						itemIndex={ itemIndex }
					/>
					{ item.description && (
						<Typography
							variant="body2"
							color="text.secondary"
							sx={ { pb: 2 } }
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
						<Box sx={ { pb: 2 } }>
							<Button
								href={ item.ctaLink }
								target={ item.ctaLink.startsWith( '#' ) ? '_self' : '_blank' }
								variant="contained"
								size="small"
								color="promotion"
								onClick={ item.ctaLink.startsWith( '#' ) ? () => setIsOpen?.( false ) : undefined }
							>
								{ item.cta }
							</Button>
						</Box>
					) }
				</Box>
			</Collapse>
			<Divider />
		</Box>
	);
};

WhatsNewItemCollapsed.propTypes = {
	item: PropTypes.object.isRequired,
	itemIndex: PropTypes.number.isRequired,
	isNew: PropTypes.bool,
	onSeen: PropTypes.func,
	setIsOpen: PropTypes.func,
};
