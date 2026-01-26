import React from 'react';

export const Heading = ( { children, className, tag: Tag = 'h3', variant, ...props } ) => (
	<Tag className={ className } { ...props }>
		{ children }
	</Tag>
);

export const Text = ( { children, className, variant, ...props } ) => (
	<p className={ className } { ...props }>
		{ children }
	</p>
);

export const Grid = ( { children, className, container, alignItems, justify, direction, ...props } ) => (
	<div className={ className } { ...props }>
		{ children }
	</div>
);

export const Button = ( { text, url, onClick, target, className, ...props } ) => (
	<a href={ url } onClick={ onClick } target={ target } className={ className } role="link" { ...props }>
		{ text }
	</a>
);
