type ExtendedWindow = Window & {
	$e?: {
		components?: {
			get?: ( name: 'panel' ) =>
				| {
						blockUserInteractions?: () => void;
						unblockUserInteractions?: () => void;
				  }
				| undefined;
		};
	};
};

export function blockPanelInteractions() {
	const extendedWindow = window as unknown as ExtendedWindow;

	extendedWindow.$e?.components?.get?.( 'panel' )?.blockUserInteractions?.();
}

export function unblockPanelInteractions() {
	const extendedWindow = window as unknown as ExtendedWindow;

	extendedWindow.$e?.components?.get?.( 'panel' )?.unblockUserInteractions?.();
}
