import { type Element } from '@elementor/editor-elements';

export function mockElement( { id = '1', type = 'e-heading' }: Partial< Element > = {} ): Element {
	return {
		id,
		type,
	};
}
