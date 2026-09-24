import { generateElementId } from './generate-element-id';
import { type BackboneModel, type V1ElementModelProps, type V1ElementSettingsProps } from './types';

type CloneableElement = Partial< V1ElementModelProps > | BackboneModel;

function isBackboneModel( item: CloneableElement ): item is BackboneModel {
	return 'toJSON' in item && 'get' in item;
}

export function cloneElementTree( item: CloneableElement ): V1ElementModelProps {
	const source = isBackboneModel( item )
		? ( item.toJSON() as Partial< V1ElementModelProps > )
		: item;

	return {
		...source,
		id: generateElementId(),
		settings: {
			...( source.settings ?? {} ),
			_element_id: '',
		} as V1ElementSettingsProps,
		elements: ( source.elements ?? [] ).map( ( child ) =>
			cloneElementTree( child as Partial< V1ElementModelProps > ),
		),
	} as V1ElementModelProps;
}
