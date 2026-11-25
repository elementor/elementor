import * as React from 'react';
import {
	ClassesPropProvider,
	ElementProvider,
	getStylesFieldComponent,
	StyleInheritanceProvider,
	StyleProvider,
	StylesFieldTargetsProvider,
} from '@elementor/editor-editing-panel';
import { type ElementID } from '@elementor/editor-elements';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { SessionStorageProvider } from '@elementor/session';

import { type CompositeWidgetQuickEdit } from '../types';
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

	return (
		<ElementProvider { ...targets.readTarget }>
			<ClassesPropProvider prop={ targets.classesProp }>
				<StyleProvider
					meta={ { breakpoint, state: null } }
					id={ targets.readStyleId }
					setId={ noop }
					setMetaState={ noop }
				>
					<SessionStorageProvider prefix={ targets.readTarget.element.id }>
						<StyleInheritanceProvider>
							<StylesFieldTargetsProvider elementIds={ targets.elementIds }>
								<Field label={ quickEdit.label } />
							</StylesFieldTargetsProvider>
						</StyleInheritanceProvider>
					</SessionStorageProvider>
				</StyleProvider>
			</ClassesPropProvider>
		</ElementProvider>
	);
}

function noop() {}
