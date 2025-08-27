import { getElementLabel, getWidgetsCache, type V1Element, type V1ElementModelProps } from '@elementor/editor-elements';
import { CLASSES_PROP_KEY, type PropsSchema } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

export type ContainerArgs = {
	container?: V1Element;
	containers?: V1Element[];
};

export function hasAtomicWidgets( args: ContainerArgs ): boolean {
	const { containers = [ args.container ] } = args;

	return containers.some( isAtomicWidget );
}

export function isAtomicWidget( container: V1Element | undefined ): boolean {
	if ( ! container ) {
		return false;
	}

	return Boolean( getContainerSchema( container ) );
}

export function getClassesProp( container: V1Element ): string | null {
	const propsSchema = getContainerSchema( container );

	if ( ! propsSchema ) {
		return null;
	}

	const [ propKey ] =
		Object.entries( propsSchema ).find(
			( [ , propType ] ) => propType.kind === 'plain' && propType.key === CLASSES_PROP_KEY
		) ?? [];

	return propKey ?? null;
}

function getContainerSchema( container: V1Element ): PropsSchema | null {
	const type = container?.model.get( 'widgetType' ) || container?.model.get( 'elType' );

	const widgetsCache = getWidgetsCache();
	const elementType = widgetsCache?.[ type ];

	return elementType?.atomic_props_schema ?? null;
}

type ClipboardElements = V1ElementModelProps[];

export function getClipboardElements( storageKey: string = 'clipboard' ): ClipboardElements | undefined {
	try {
		const storedData = JSON.parse( localStorage.getItem( 'elementor' ) ?? '{}' );

		return storedData[ storageKey ]?.elements as ClipboardElements;
	} catch {
		return undefined;
	}
}

export function getTitleForContainers( containers: V1Element[] ): string {
	return containers.length > 1 ? __( 'Elements', 'elementor' ) : getElementLabel( containers[ 0 ].id );
}
