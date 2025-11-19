export type JsonSchema7 = {
	type?: string | string[];
	properties?: Record< string, JsonSchema7 >;
	items?: JsonSchema7;
	enum?: unknown[];
	anyOf?: JsonSchema7[];
	oneOf?: JsonSchema7[];
	allOf?: JsonSchema7[];
	required?: string[];
	description?: string;
	default?: unknown;
	if?: JsonSchema7;
	then?: JsonSchema7;
	else?: JsonSchema7;
	key?: string;
	[ key: string ]: unknown;
};
