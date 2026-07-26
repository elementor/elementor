import * as React from 'react';

export const Fragment = React.Fragment;

export function jsx( type, props, key ) {
	return React.createElement( type, key === undefined ? props : { ...props, key } );
}

export const jsxs = jsx;
export const jsxDEV = jsx;
