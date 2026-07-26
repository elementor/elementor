import DOMPurify from '../../../node_modules/dompurify/dist/purify.es.mjs';

export default DOMPurify;

export const isValidAttribute = DOMPurify.isValidAttribute.bind( DOMPurify );
