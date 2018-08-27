<?php
namespace Elementor\Testing;

class Elementor_Test_Base extends \WP_UnitTestCase {

	use Elementor_Test;

	protected function getSelf() {
		return $this;
	}

	/**
	 * Asserts that a group is registered in documents
	 *
	 * @param string $group_name
	 */
	protected function assertDocumentGroupRegistered( $group_name ) {
		if ( ! is_string( $group_name ) ) {
			throw \PHPUnit_Util_InvalidArgumentHelper::factory(
				1,
				'only string'
			);
		}

		self::assertArrayHasKey( $group_name, self::elementor()->documents->get_groups() );
	}

	/**
	 * Asserts that a type is registered in documents
	 *
	 * @param string $type_name
	 */
	protected function assertDocumentTypeRegistered( $type_name ) {
		if ( ! is_string( $type_name ) ) {
			throw \PHPUnit_Util_InvalidArgumentHelper::factory(
				1,
				'only string'
			);
		}
		self::assertNotNull( self::elementor()->documents->get_document_type( $type_name ) );
	}
}