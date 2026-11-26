import { getWidgetsCache } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { stylesRepository } from '@elementor/editor-styles-repository';

type GetAppliedStylesArgs = {
	elementTypeKey: string;
	appliedStyleIds: string[];
	defaultTagStyleId: string | null;
	activeStyleId: string | null;
};

export function getAppliedStyles( {
	elementTypeKey,
	appliedStyleIds,
	defaultTagStyleId,
	activeStyleId,
}: GetAppliedStylesArgs ): StyleDefinition[] {
	const baseStyleIds = Object.keys( getWidgetsCache()?.[ elementTypeKey ]?.base_styles ?? {} );

	const applicableIds = [
		...baseStyleIds,
		...appliedStyleIds,
		...( defaultTagStyleId ? [ defaultTagStyleId ] : [] ),
		...( activeStyleId ? [ activeStyleId ] : [] ),
	];

	return stylesRepository.all().filter( ( style ) => applicableIds.includes( style.id ) );
}
