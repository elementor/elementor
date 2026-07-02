import React from 'react';
import PropTypes from 'prop-types';

export const Heading = ( { children, className, tag: Tag = 'h3', variant, ...props } ) => (
	<Tag className={ className } { ...props }>
		{ children }
	</Tag>
);

Heading.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	tag: PropTypes.string,
	variant: PropTypes.string,
};

export const Text = ( { children, className, variant, ...props } ) => (
	<p className={ className } { ...props }>
		{ children }
	</p>
);

Text.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	variant: PropTypes.string,
};

export const Grid = ( { children, className, container, alignItems, justify, direction, ...props } ) => (
	<div className={ className } { ...props }>
		{ children }
	</div>
);

Grid.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	container: PropTypes.bool,
	alignItems: PropTypes.string,
	justify: PropTypes.string,
	direction: PropTypes.string,
};

export const Button = ( { text, url, onClick, target, className, ...props } ) => (
	<a href={ url } onClick={ onClick } target={ target } className={ className } { ...props }>
		{ text }
	</a>
);

Button.propTypes = {
	text: PropTypes.string,
	url: PropTypes.string,
	onClick: PropTypes.func,
	target: PropTypes.string,
	className: PropTypes.string,
};
