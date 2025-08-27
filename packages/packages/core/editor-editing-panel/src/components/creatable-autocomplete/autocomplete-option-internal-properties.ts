import { type InternalOption, type Option } from './types';

export function addGroupToOptions< TOption extends Option >(
	options: TOption[],
	pluralEntityName?: string
): InternalOption< TOption >[] {
	return options.map( ( option ) => {
		return {
			...option,
			_group: `Existing ${ pluralEntityName ?? 'options' }`,
		};
	} );
}

export function removeInternalKeys< TOption extends Option >( option: InternalOption< TOption > ): TOption {
	const { _group, _action, ...rest } = option;
	return rest as unknown as TOption;
}
