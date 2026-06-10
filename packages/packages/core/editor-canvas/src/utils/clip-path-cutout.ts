type Size = { width: number; height: number };
type CutoutRect = { x: number; y: number; width: number; height: number };

export function rectCutoutClipPath( outer: Size, inner: CutoutRect ): string {
	const { width: ow, height: oh } = outer;
	const { x, y, width: iw, height: ih } = inner;

	return `path(evenodd, 'M 0 0 L ${ ow } 0 L ${ ow } ${ oh } L 0 ${ oh } Z M ${ x } ${ y } L ${
		x + iw
	} ${ y } L ${ x + iw } ${ y + ih } L ${ x } ${ y + ih } L ${ x } ${ y } Z')`;
}
