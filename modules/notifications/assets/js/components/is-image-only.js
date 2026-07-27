export const isImageOnly = ( item ) => ! item.title && ! item.description && ( item.imageSrc || item.gifSrc || item.youtubeEmbedId );
