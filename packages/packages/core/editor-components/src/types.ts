export type FormValues = {
	componentName: string;
};

export type FormErrors = Partial< Record< keyof FormValues, string | undefined > >;
