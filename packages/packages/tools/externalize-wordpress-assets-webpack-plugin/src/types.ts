export type Global = string | string[];

export type RequestToGlobalMap = Array< {
	request: string | RegExp;
	global: Global;
} >;
