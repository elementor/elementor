import { Box, Typography } from '@elementor/ui';
import { CheckIcon } from '@elementor/icons';

export const TextNode = ( { children, ...props } ) => {
	return (
		<Typography color="text.primary" { ...props }>{ children }</Typography>
	);
};

TextNode.propTypes = {
	children: PropTypes.node,
};

export const ContentList = ( { children, ...props } ) => {
	return (
		<Box component="ul" sx={ { my: 0 } } { ...props }>
			{ children }
		</Box>
	);
};

ContentList.propTypes = {
	children: PropTypes.node,
};

export const ContentListItem = ( { children, ...props } ) => {
	return (
		<TextNode component="li" sx={ { listStyle: 'disc', marginInlineStart: 3 } } { ...props }>
			{ children }
		</TextNode>
	);
};

ContentListItem.propTypes = {
	children: PropTypes.node,
};

export const AdvantagesList = ( { children, ...props } ) => {
	return (
		<Box
			component="ul"
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				gap: 0.5,
				my: 0,
			} }
			{ ...props }
		>
			{ children }
		</Box>
	);
};

AdvantagesList.propTypes = {
	children: PropTypes.node,
};

export const AdvantagesListItem = ( { children, ...props } ) => {
	return (
		<TextNode
			component="li"
			sx={ {
				listStyle: 'none',
				marginInlineStart: 0,
				lineHeight: '150%',
				display: 'flex',
				alignItems: 'flex-start',
				gap: 0.5,
			} }
			{ ...props }
		>
			<CheckIcon fontSize="small" />{ children }
		</TextNode>
	);
};

AdvantagesListItem.propTypes = {
	children: PropTypes.node,
};
