import type { ElementorContainer } from './types';

export function validateDocumentSettingsUpdated( container: ElementorContainer ): void {
	const updatedSettings = container.settings.attributes;

	if ( ! updatedSettings ) {
		throw new Error( 'Document settings update failed: Settings not accessible' );
	}
}

export function validateDynamicTagEnabled( container: ElementorContainer, controlName: string ): void {
	const modelSettings = container.model?.attributes?.settings as Record< string, unknown > | undefined;
	const controlValue = modelSettings?.[ controlName ];
	const hasDynamic = controlValue && typeof controlValue === 'object' && '__dynamic__' in controlValue;

	if ( ! hasDynamic ) {
		throw new Error( `Dynamic tag enable failed: Tag not found for ${ controlName }` );
	}
}

export function validateDynamicTagDisabled( container: ElementorContainer, controlName: string ): void {
	const modelSettings = container.model?.attributes?.settings as Record< string, unknown > | undefined;
	const controlValue = modelSettings?.[ controlName ];
	const stillHasDynamic = controlValue && typeof controlValue === 'object' && '__dynamic__' in controlValue;

	if ( stillHasDynamic ) {
		throw new Error( `Dynamic tag disable failed: Tag still exists for ${ controlName }` );
	}
}
