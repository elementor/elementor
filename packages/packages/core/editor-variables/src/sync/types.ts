export type CanvasExtendedWindow = Window & {
	elementor?: {
		$preview?: [ HTMLIFrameElement ];
	};
};
