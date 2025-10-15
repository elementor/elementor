type EditorElementsPanelExtendsWindow = Window & {
	Marionette: {
		CompositeView: {
			extend: ( options: { template: string; initialize: () => void } ) => {
				new (): {
					template: string;
					initialize: () => void;
				};
			};
		};
	};

	elementor: {
		hooks: {
			addFilter: (
				filterName: string,
				callback: (
					regions: Record< string, unknown >,
					options: { elements: unknown }
				) => Record< string, unknown >
			) => void;
		};

		getPanelView: () => {
			getCurrentPageView: () => {
				search: {
					reset: () => void;
				};
			};
		};
	};

	$e: {
		routes: {
			getCurrent: () => Record< string, string >;
		};

		route: ( route: string ) => void;

		components: {
			get: ( componentName: string ) =>
				| {
						addTab: ( id: string, options: { title: string } ) => void;
						removeTab: ( id: string ) => void;
				  }
				| undefined;
		};
	};
};

export function getWindow() {
	return window as unknown as EditorElementsPanelExtendsWindow;
}
