import * as React from 'react';
import {
	ClassesPropProvider,
	ElementProvider,
	getStylesFieldComponent,
	StyleInheritanceProvider,
	StyleProvider,
	type StylesFieldsWrite,
	StylesFieldsWriteProvider,
} from '@elementor/editor-editing-panel';
import { type ElementID } from '@elementor/editor-elements';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { type StyleDefinitionVariant } from '@elementor/editor-styles';
import { SessionStorageProvider } from '@elementor/session';

import { type CompositeWidgetQuickEdit } from '../types';
import { updateLocalStyles } from './update-local-styles';
import { useQuickEditTargets } from './use-quick-edit-targets';

type Props = {
	rootId: ElementID;
	quickEdit: CompositeWidgetQuickEdit;
};

export function QuickEditField( { rootId, quickEdit }: Props ) {
	const targets = useQuickEditTargets( rootId, quickEdit.targets );
	const breakpoint = useActiveBreakpoint();
	const Field = getStylesFieldComponent( quickEdit.style_prop );

	if ( ! targets || ! Field ) {
		return null;
	}

	const meta: StyleDefinitionVariant[ 'meta' ] = { breakpoint, state: null };

	const write: StylesFieldsWrite = ( props, { propDisplayName } ) =>
		updateLocalStyles( { rootId, elementIds: targets.elementIds, meta, props, propDisplayName } );

	return (
		<ElementProvider { ...targets.readTarget }>
			<ClassesPropProvider prop={ targets.classesProp }>
				<StyleProvider meta={ meta } id={ targets.readStyleId } setId={ noop } setMetaState={ noop }>
					<SessionStorageProvider prefix={ targets.readTarget.element.id }>
						<StyleInheritanceProvider>
							<StylesFieldsWriteProvider write={ write }>
								<Field label={ quickEdit.label } />
							</StylesFieldsWriteProvider>
						</StyleInheritanceProvider>
					</SessionStorageProvider>
				</StyleProvider>
			</ClassesPropProvider>
		</ElementProvider>
	);
}

function noop() {}
