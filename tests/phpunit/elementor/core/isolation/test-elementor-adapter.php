<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Isolation;

use Elementor\Core\Base\Document;
use Elementor\Core\Isolation\Elementor_Adapter;
use Elementor\Core\Isolation\Elementor_Adapter_Interface;
use Elementor\Plugin;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Elementor_Adapter extends PHPUnit_TestCase {
	private ?Elementor_Adapter_Interface $elementor_adapter;
	private ?Document $document = null;

	public function setUp(): void {
		parent::setUp();

		$this->elementor_adapter = new Elementor_Adapter();
		$this->document = Plugin::$instance->documents->create(
			'post',
			[
				'post_title' => 'title',
				'post_status' => 'publish',
			]
		);
	}

	public function tearDown(): void {
		$this->elementor_adapter = null;
		$this->document = null;

		parent::tearDown();
	}

	public function test_get_template_type__assert_no_error() {
		$this->assertFalse( ( bool ) $this->elementor_adapter->get_template_type( '' ) );
	}

	public function test_get_template_type__assert_type() {
		$this->assertTrue( 'post' === $this->elementor_adapter->get_template_type( $this->document->get_id() ) );
	}
}
