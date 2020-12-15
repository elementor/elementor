<?php
namespace Elementor\Testing\Traits;

trait Elementor_Library {
	/**
	 * Asserts that a type is registered in documents
	 *
	 * @param string $type_name
	 */
	private function assertDocumentTypeRegistered( $type_name ) {
		if ( ! is_string( $type_name ) ) {
			throw \PHPUnit_Util_InvalidArgumentHelper::factory(
				1,
				'only string'
			);
		}
		self::assertNotNull( self::elementor()->documents->get_document_type( $type_name ) );
	}
}
