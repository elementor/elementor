export function isRtl(): boolean {
	return ( document?.documentElement?.dir ?? '' ).toLowerCase() === 'rtl';
}
