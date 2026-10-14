import { type AutocompleteChangeReason, type AutocompleteProps } from '@elementor/ui';

export type Option = {
	label: string;
	value: string | null;
	fixed?: boolean;
	key?: string;
};

type InternalKeys = '_group' | '_action';

export type InternalOption< TOption extends Option > = Omit< TOption, InternalKeys > & {
	_group: string;
	_action?: 'create';
};

export type SafeOptionConstraint = Option & {
	[ K in InternalKeys ]?: never;
};

export type ValidationResult = { isValid: true; errorMessage: null } | { isValid: false; errorMessage: string };
export type ValidationEvent = 'inputChange' | 'create';

export type OnSelect< TOption extends Option > = (
	value: TOption[],
	reason: AutocompleteChangeReason,
	option: TOption
) => void;
type OnCreate = ( value: string ) => unknown;
type Validate = ( value: string, event: ValidationEvent ) => ValidationResult;

export type CreatableAutocompleteProps< TOption extends SafeOptionConstraint > = Omit<
	AutocompleteProps< TOption, true, true, true >,
	'renderInput' | 'onSelect' | 'options'
> & {
	selected: TOption[];
	options: TOption[];
	placeholder?: string;
	entityName?: {
		singular: string;
		plural: string;
	};
	renderEmptyState?: ( props: { searchValue: string; onClear: () => void } ) => React.ReactNode;
	onSelect?: OnSelect< TOption >;
	onCreate?: OnCreate;
	validate?: Validate;
};
