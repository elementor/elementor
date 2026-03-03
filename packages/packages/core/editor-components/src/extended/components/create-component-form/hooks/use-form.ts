import { useMemo, useState } from 'react';
import { type z } from '@elementor/schema';

export const useForm = < TValues extends Record< string, unknown > >( initialValues: TValues ) => {
	const [ values, setValues ] = useState< TValues >( initialValues );
	const [ errors, setErrors ] = useState< Partial< Record< keyof TValues, string > > >( {} );

	const isValid = useMemo( () => {
		return ! Object.values( errors ).some( ( error ) => error );
	}, [ errors ] );

	const handleChange = (
		e: React.ChangeEvent< HTMLInputElement >,
		field: keyof TValues,
		validationSchema: z.ZodType< TValues >
	) => {
		const updated = { ...values, [ field ]: e.target.value };
		setValues( updated );

		const { success, errors: validationErrors } = validateForm( updated, validationSchema );

		if ( ! success ) {
			setErrors( validationErrors );
		} else {
			setErrors( {} );
		}
	};

	const validate = (
		validationSchema: z.ZodType< TValues >
	): { success: true; parsedValues: TValues } | { success: false; parsedValues?: never } => {
		const { success, errors: validationErrors, parsedValues } = validateForm( values, validationSchema );

		if ( ! success ) {
			setErrors( validationErrors );
			return { success };
		}
		setErrors( {} );
		return { success, parsedValues };
	};

	return {
		values,
		errors,
		isValid,
		handleChange,
		validateForm: validate,
	};
};

const validateForm = < TValues extends Record< string, unknown > >(
	values: TValues,
	schema: z.ZodType< TValues >
):
	| { success: false; parsedValues?: never; errors: Partial< Record< keyof TValues, string > > }
	| { success: true; parsedValues: TValues; errors?: never } => {
	const result = schema.safeParse( values );

	if ( result.success ) {
		return { success: true, parsedValues: result.data };
	}

	const errors = {} as Partial< Record< keyof TValues, string > >;

	( Object.entries( result.error.formErrors.fieldErrors ) as Array< [ keyof TValues, string[] ] > ).forEach(
		( [ field, error ] ) => {
			errors[ field ] = error[ 0 ];
		}
	);

	return { success: false, errors };
};
