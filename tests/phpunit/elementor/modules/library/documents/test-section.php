<?php
namespace Elementor\Testing\Modules\Library\Documents;

use Elementor\Modules\Library\Documents\Section;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Section extends Elementor_Test_Base {

	/**
	 * @var Section
	 */
	private static $page;

	/**
	 * @throws \Exception
	 */
	public static function setUpBeforeClass() {
		self::$page = new Section();
		parent::setUpBeforeClass();
	}

	public function test_should_return_properties() {
		$properties = Section::get_properties();
		$this->assertEquals( $properties['library_view'], 'list' );
		$this->assertEquals( $properties['group'], 'blocks' );
	}

	public function test_should_return_name() {
		$name = self::$page->get_name();
		$this->assertEquals( 'section', $name );
	}

	public function test_should_return_title() {
		$title = Section::get_title();
		$this->assertEquals( __( 'Section', 'elementor' ), $title );
	}
}