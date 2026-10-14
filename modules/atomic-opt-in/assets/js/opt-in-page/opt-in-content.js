import { Box, Typography } from '@elementor/ui';

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
		<Box component="ul" sx={ { listStyle: 'disc' } } { ...props }>
			{ children }
		</Box>
	);
};

ContentList.propTypes = {
	children: PropTypes.node,
};

export const ContentListItem = ( { children, ...props } ) => {
	return (
		<TextNode component="li" { ...props }>
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
			sx={ { marginInlineStart: 2 } }
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
				lineHeight: '150%',
				listStyle: 'disc',
			} }
			{ ...props }
		>
			{ children }
		</TextNode>
	);
};

AdvantagesListItem.propTypes = {
	children: PropTypes.node,
};
