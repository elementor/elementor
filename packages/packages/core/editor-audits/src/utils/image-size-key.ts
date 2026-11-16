export type ImageSizeRequest = {
	id: number;
	size?: string;
};

export function buildImageSizeKey( { id, size }: ImageSizeRequest ): string {
	return `${ id }:${ size || 'full' }`;
}
