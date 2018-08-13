<?php
namespace Elementor\Testing\Modules\Library\Documents;

use Elementor\Core\Base\Document;
use Elementor\Modules\Library\Documents\Page;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Page extends Elementor_Test_Base {

	/**
	 * @var Page
	 */
	private $page;

	/**
	 * @throws \Exception
	 */
	public function setUp() {
		$this->page = new Page( [ 'post_id' => self::factory()->create_and_get_default_post()->ID ] );
		parent::setUp();
	}

	public function test_should_return_properties() {
		$properties = page::get_properties();
		$this->assertTrue( $properties['support_wp_page_templates'] );
		$this->assertEquals( $properties['group'], 'pages' );
	}

	public function test_should_return_name() {
		$name = $this->page->get_name();
		$this->assertEquals( 'page', $name );
	}

	public function test_should_return_title() {
		$title = Page::get_title();
		$this->assertEquals( __( 'Page', 'elementor' ), $title );
	}

	public function test_should_return_css_wrapper_selector() {
		$css_wrapper = $this->page->get_css_wrapper_selector();
		$this->assertContains( 'body.elementor-page-', $css_wrapper );
	}

	/**
	 * @throws \ReflectionException
	 * @throws \Exception
	 */
	public function test_should_register_controls() {
		$page_reflection = new \ReflectionClass( 'Elementor\Modules\Library\Documents\Page' );
		$method = $page_reflection->getMethod( '_register_controls' );
		$method->setAccessible( true );

		$method->invokeArgs( $this->page, [] );

		self::assertNotNull( $this->page->get_controls( 'post_status' ) );
		self::assertNotNull( $this->page->get_section_controls( 'section_page_style' ) );
		//self::assertNotNull( $page->get_controls( 'post_status' ) );
	}
}