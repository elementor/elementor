import { createTransformer } from '../create-transformer';

type Flex = {
	flexGrow?: number | null;
	flexShrink?: number | null;
	flexBasis?: { size: number; unit: string } | string | null;
};

const DEFAULT_FLEX_GROW = 0;
const DEFAULT_FLEX_SHRINK = 1;
const DEFAULT_FLEX_BASIS = 'auto';

const formatBasis = ( basis: NonNullable< Flex[ 'flexBasis' ] > ) =>
	typeof basis === 'object' && basis.size !== undefined ? `${ basis.size }${ basis.unit || '' }` : basis;

export const flexTransformer = createTransformer( ( value: Flex ) => {
	const grow = value.flexGrow;
	const shrink = value.flexShrink;
	const basis = value.flexBasis;

	const hasGrow = grow !== undefined && grow !== null;
	const hasShrink = shrink !== undefined && shrink !== null;
	const hasBasis = basis !== undefined && basis !== null;

	if ( ! hasGrow && ! hasShrink && ! hasBasis ) {
		return null;
	}

	const growOut = hasGrow ? grow : DEFAULT_FLEX_GROW;
	const shrinkOut = hasShrink ? shrink : DEFAULT_FLEX_SHRINK;
	const basisOut = hasBasis ? formatBasis( basis ) : DEFAULT_FLEX_BASIS;

	return `${ growOut } ${ shrinkOut } ${ basisOut }`;
} );
