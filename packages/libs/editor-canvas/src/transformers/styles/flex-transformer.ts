import { createTransformer } from '../create-transformer';

type Flex = {
	flexGrow?: number | null;
	flexShrink?: number | null;
	flexBasis?: { size: number; unit: string } | string | null;
};

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

	if ( hasGrow && hasShrink && hasBasis ) {
		return `${ grow } ${ shrink } ${
			typeof basis === 'object' && basis.size !== undefined ? `${ basis.size }${ basis.unit || '' }` : basis
		}`;
	}

	if ( hasGrow && hasShrink && ! hasBasis ) {
		return `${ grow } ${ shrink }`;
	}
	if ( hasGrow && ! hasShrink && hasBasis ) {
		return `${ grow } 1 ${
			typeof basis === 'object' && basis.size !== undefined ? `${ basis.size }${ basis.unit || '' }` : basis
		}`;
	}
	if ( ! hasGrow && hasShrink && hasBasis ) {
		return `0 ${ shrink } ${
			typeof basis === 'object' && basis.size !== undefined ? `${ basis.size }${ basis.unit || '' }` : basis
		}`;
	}

	if ( hasGrow && ! hasShrink && ! hasBasis ) {
		return `${ grow }`;
	}
	if ( ! hasGrow && hasShrink && ! hasBasis ) {
		return `0 ${ shrink }`;
	}
	if ( ! hasGrow && ! hasShrink && hasBasis ) {
		return `0 1 ${
			typeof basis === 'object' && basis.size !== undefined ? `${ basis.size }${ basis.unit || '' }` : basis
		}`;
	}

	return null;
} );
