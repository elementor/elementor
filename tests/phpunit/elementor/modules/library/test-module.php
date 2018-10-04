<?php
namespace Elementor\Testing\Modules\Library;

use Elementor\Modules\Library\Module;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Module extends Elementor_Test_Base {
	/** @var Module */
	private static $module;

	public function test_should_confirm_module_activation() {
		self::$module = new Module();

		$this->assertDocumentTypeRegistered( 'page' );
		$this->assertDocumentTypeRegistered( 'section' );
		$this->assertDocumentGroupRegistered( 'blocks' );
		$this->assertDocumentGroupRegistered( 'pages' );
	}

	public function test_should_return_library() {
		$this->assertEquals( 'library', self::$module->get_name() );
	}

	/**
	 * Asserts that a group is registered in documents
	 *
	 * @param string $group_name
	 */
	private function assertDocumentGroupRegistered( $group_name ) {
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
