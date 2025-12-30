import { type V1Element } from './types';

export function getAllDescendants( container: V1Element ): V1Element[] {
	const children = ( container.children ?? [] ).flatMap( ( child ) => getAllDescendants( child as V1Element ) );

	return [ container, ...children ];
}
