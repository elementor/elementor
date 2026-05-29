export const SNAP_THRESHOLD_PX = 16;

type Rect = { left: number; right: number; top: number; bottom: number };

export type SnapInput = {
	panel: Rect;
	viewport: Rect;
	isRtl: boolean;
};

export function shouldSnapToDock( { panel, viewport, isRtl }: SnapInput ): boolean {
	const distance = isRtl ? panel.left - viewport.left : viewport.right - panel.right;

	return distance <= SNAP_THRESHOLD_PX;
}
