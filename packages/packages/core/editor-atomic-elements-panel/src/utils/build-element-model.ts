import { type ElementTile } from './group-widgets';

export function buildElementModel( tile: ElementTile ) {
	const { promotionType, settings, ...model } = tile;

	return model;
}
