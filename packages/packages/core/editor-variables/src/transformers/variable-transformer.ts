import { createTransformer } from '@elementor/editor-canvas';

import { service } from '../service';
import { type TVariable } from '../storage';
import { resolveCssVariable } from './utils/resolve-css-variable';

const GRID_TRACK_PROPERTIES = new Set( [ 'grid-template-columns', 'grid-template-rows' ] );
const GRID_TRACK_VALUE_PATTERN = /^(\d+)(?:fr)?$/;

export const variableTransformer = createTransformer(
	( idOrLabel: string, { key }: { key: string } ) => {
		const variables = service.variables();

		const targetVariable: TVariable | null =
			variables[ idOrLabel ] || service.findVariableByLabel( idOrLabel );

		if ( ! targetVariable ) {
			return null;
		}

		const stored = ( targetVariable.value ?? '' ).trim();

		if ( GRID_TRACK_PROPERTIES.has( key ) ) {
			const match = stored.match( GRID_TRACK_VALUE_PATTERN );
			const count = match ? Number( match[ 1 ] ) : NaN;

			if ( Number.isInteger( count ) && count >= 1 ) {
				return `repeat(${ count }, 1fr)`;
			}
		}

		const id = service.findIdByLabel( targetVariable.label );
		return resolveCssVariable( id, targetVariable );
	}
);
