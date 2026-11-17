import { getCurrentDocumentType, getExtendedWindow, type MarionetteBehaviorConstructor } from '../types';
import { openAngieForV3Layout } from './open-angie-layout';

type TemplateLibraryView = {
	model: {
		get: ( key: string ) => unknown;
	};
};

type TemplateLibraryBehavior = {
	view: TemplateLibraryView;
	onGenerateVariationClick: () => void;
};

let cachedLibraryBehavior: MarionetteBehaviorConstructor | undefined;

export function getAngieTemplateLibraryBehaviorClass(): MarionetteBehaviorConstructor {
	if ( ! cachedLibraryBehavior ) {
		cachedLibraryBehavior = createAngieTemplateLibraryBehaviorClass();
	}

	return cachedLibraryBehavior;
}

function createAngieTemplateLibraryBehaviorClass(): MarionetteBehaviorConstructor {
	const { Marionette } = getExtendedWindow();

	if ( ! Marionette?.Behavior ) {
		throw new Error( 'Marionette is not available' );
	}

	return Marionette.Behavior.extend( {
		ui: {
			applyButton: '.elementor-template-library-template-apply-ai',
			generateVariation: '.elementor-template-library-template-generate-variation',
		},

		events: {
			'click @ui.applyButton': 'onApplyButtonClick',
			'click @ui.generateVariation': 'onGenerateVariationClick',
		},

		onGenerateVariationClick( this: TemplateLibraryBehavior ) {
			const view = this.view;
			const model = view.model;
			const libraryComponent = (
				window as unknown as {
					$e?: {
						components?: {
							get?: ( name: string ) => {
								manager?: { modalConfig?: { importOptions?: { at?: number } } };
							};
						};
					};
				}
			 ).$e?.components?.get?.( 'library' );
			const at = libraryComponent?.manager?.modalConfig?.importOptions?.at ?? null;

			openAngieForV3Layout( {
				mode: 'library-variation',
				documentType: getCurrentDocumentType(),
				at,
				libraryTemplateId: model.get( 'template_id' ) as string | number,
				libraryTemplateTitle: model.get( 'title' ) as string,
			} );

			( window as unknown as { $e?: { run?: ( command: string ) => void } } ).$e?.run?.( 'library/close' );
		},

		onApplyButtonClick( this: TemplateLibraryBehavior ) {
			this.onGenerateVariationClick();
		},
	} );
}
