import { Typography, Input, Box } from '@elementor/ui';

import { useKitValidation } from '../hooks/use-kit-validation';

export default function KitInfo() {
	const {
		templateName,
		description,
		nameError,
		handleNameChange,
		handleDescriptionChange,
		DESCRIPTION_MAX_LENGTH,
	} = useKitValidation();

	return (
		<Box sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 3.5 } }>
			<Typography variant="caption" component="label" color="text.secondary">
				{ __( 'Website template name', 'elementor' ) } *
			</Typography>
			<Input
				fullWidth
				required
				value={ templateName }
				onChange={ handleNameChange }
				placeholder={ __( 'Type name here...', 'elementor' ) }
				inputProps={ { maxLength: 75 } }
				error={ !! nameError }
				sx={ { mb: nameError ? 1 : 2 } }
			/>
			{ nameError && (
				<Typography color="error.main" variant="caption" sx={ { mb: 2, display: 'block' } }>
					{ nameError }
				</Typography>
			) }

			<Typography variant="caption" component="label" color="text.secondary">
				{ __( 'Description (Optional)', 'elementor' ) }
			</Typography>
			<Input
				fullWidth
				multiline
				value={ description }
				onChange={ handleDescriptionChange }
				placeholder={ __( 'Type description here...', 'elementor' ) }
				inputProps={ { maxLength: DESCRIPTION_MAX_LENGTH } }
				error={ description.length > DESCRIPTION_MAX_LENGTH }
			/>
			<Typography
				variant="caption"
				color={ description.length > DESCRIPTION_MAX_LENGTH ? 'error' : 'text.secondary' }
				sx={ { mt: 0.5, display: 'block' } }
			>
				{ description.length } / { DESCRIPTION_MAX_LENGTH } { __( 'characters', 'elementor' ) }
			</Typography>
		</Box>
	);
}
