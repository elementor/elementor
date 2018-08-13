<?php
namespace Elementor\Testing\Modules\Library\Documents;

use Elementor\Modules\Library\Documents\Library_Document;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Library_Document extends Elementor_Test_Base {

	public function test_should_return_properties() {
		$properties = Library_Document::get_properties();
		self::assertTrue( $properties['show_in_library'] );
		self::assertTrue( $properties['register_type'] );
		self::assertSame( $properties['group'], 'blocks' );
		self::assertSame( $properties['library_view'], 'grid' );
	}

	public function test__() {
		$library_document = $this->getMockForAbstractClass( 'Elementor\Modules\Library\Documents\Library_Document',
			[ [ 'id' => '', 'post_id' => self::factory()->create_and_get_default_post()->ID ] ] );
		$library_document->method('get_name')->willReturn('libraryTypeExample');
		$library_document->save_type();
		$ret = wp_get_object_terms( $library_document->get_post()->ID, Library_Document::TAXONOMY_TYPE_SLUG );
		$this->assertEquals( $ret[0]->name, 'libraryTypeExample' );
	}
}