import { createMockPropType } from 'test-utils';

export function stringPropType() {
	return createMockPropType( { kind: 'plain', key: 'string' } );
}

export function numberPropType() {
	return createMockPropType( { kind: 'plain', key: 'number' } );
}

export function booleanPropType() {
	return createMockPropType( { kind: 'plain', key: 'boolean' } );
}

export function urlPropType() {
	return createMockPropType( { kind: 'plain', key: 'url' } );
}

export function classesPropType() {
	return createMockPropType( {
		kind: 'array',
		key: 'classes',
		item_prop_type: stringPropType(),
	} );
}

export function linkPropType() {
	return createMockPropType( {
		kind: 'object',
		key: 'link',
		shape: {
			destination: stringPropType(),
			isTargetBlank: booleanPropType(),
		},
	} );
}

export function imagePropType() {
	return createMockPropType( {
		kind: 'object',
		key: 'image',
		shape: {
			src: imageSrcPropType(),
			size: stringPropType(),
		},
	} );
}

function imageSrcPropType() {
	return createMockPropType( {
		kind: 'object',
		key: 'image-src',
		shape: {
			id: imageAttachmentIdPropType(),
			url: urlPropType(),
		},
	} );
}

function imageAttachmentIdPropType() {
	return createMockPropType( {
		kind: 'plain',
		key: 'image-attachment-id',
	} );
}
