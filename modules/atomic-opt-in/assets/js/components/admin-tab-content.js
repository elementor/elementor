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
