QUnit.test( 'Elementor exist', function( assert ) {
	assert.ok( elementor, 'Passed!' );
});

QUnit.test( 'Preview loaded', function( assert ) {
	assert.equal( 1, elementor.$previewContents.find( '.elementor-editor-active' ).length );
});

QUnit.test( 'Frontend CSS loaded', function( assert ) {
	assert.equal( 1, elementor.$previewContents.find( '#elementor-frontend-css' ).length );
});
