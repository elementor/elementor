'use strict';

const SECTION_HEADING = /^## Visual proof\s*$/m;
const SKIP_MARKER = /#skip_proof\b/;

function extractVisualProofSection( body ) {
	if ( 'string' !== typeof body || ! body.trim() ) {
		return '';
	}

	const match = body.match( SECTION_HEADING );
	if ( ! match || undefined === match.index ) {
		return '';
	}

	const start = match.index + match[ 0 ].length;
	const rest = body.slice( start );
	const next = rest.search( /^##\s|\n<!--start_gitstream/m );

	return ( -1 === next ? rest : rest.slice( 0, next ) ).trim();
}

function shouldCaptureVisualProof( body ) {
	const section = extractVisualProofSection( body );

	if ( ! section ) {
		return { capture: false, reason: 'missing-section', section: '' };
	}

	if ( SKIP_MARKER.test( section ) ) {
		return { capture: false, reason: 'skip-proof', section };
	}

	return { capture: true, reason: 'ready', section };
}

function extractLabeledField( section, label ) {
	if ( 'string' !== typeof section || ! section.trim() ) {
		return '';
	}

	const escaped = label.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
	const match = section.match( new RegExp( '\\*\\*' + escaped + ':\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)', 'i' ) );
	return match ? match[ 1 ].trim() : '';
}

function extractBrokenCaption( section ) {
	const match = ( section || '' ).match( /\*\*Broken:\*\*\s*(.+)/i );
	if ( match ) {
		return match[ 1 ].trim();
	}
	return extractLabeledField( section, 'Broken' );
}

function buildOverlayCaption( section ) {
	const broken = extractBrokenCaption( section );
	const where = extractLabeledField( section, 'Where' );
	const steps = extractLabeledField( section, 'Steps' ).replace( /\s+/g, ' ' );
	const parts = [];

	if ( broken ) {
		parts.push( 'Broken: ' + broken );
	}
	if ( where ) {
		parts.push( 'Where: ' + where );
	}
	if ( steps ) {
		parts.push( 'Steps: ' + steps );
	}

	const text = parts.join( ' · ' );
	const max = 700;
	return text.length > max ? text.slice( 0, max - 1 ) + '…' : text;
}

module.exports = {
	extractVisualProofSection,
	shouldCaptureVisualProof,
	extractBrokenCaption,
	extractLabeledField,
	buildOverlayCaption,
};

if ( require.main === module && '--test' === process.argv[ 2 ] ) {
	const assert = require( 'assert' );

	assert.equal( shouldCaptureVisualProof( '' ).reason, 'missing-section' );
	assert.equal( shouldCaptureVisualProof( '## Summary\nHi' ).reason, 'missing-section' );
	assert.equal(
		shouldCaptureVisualProof( '## Visual proof\n#skip_proof\nDocs only.' ).reason,
		'skip-proof',
	);
	assert.equal(
		shouldCaptureVisualProof( '## Visual proof\n**Where:** Editor\n**Steps:** click' ).capture,
		true,
	);
	assert.equal(
		extractBrokenCaption( '**Broken:** Z-index stayed disabled.\n**Where:** Editor' ),
		'Z-index stayed disabled.',
	);
	assert.ok(
		buildOverlayCaption(
			'**Broken:** Z-index stayed disabled.\n**Where:** Style → Position\n**Steps:** set Absolute then Z-index 5',
		).includes( 'Steps: set Absolute then Z-index 5' ),
	);

	const withGitstream = [
		'## Visual proof',
		'**Steps:** open editor',
		'<!--start_gitstream_placeholder-->',
		'## 1. Problem',
	].join( '\n' );
	assert.ok( ! extractVisualProofSection( withGitstream ).includes( 'Problem' ) );

	console.log( 'visual-proof parse tests passed' );
}
