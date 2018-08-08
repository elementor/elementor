<?php
namespace Elementor\Testing\Base;

use Elementor\Testing\Elementor_Test_Base;

class Controls_Stack extends Elementor_Test_Base {

	/** @var \Elementor\Controls_Stack */
	private $manager;
	private static $id = 2;

	public function setUp() {
		parent::setUp();
		if ( ! $this->manager ) {
			$this->manager = $this->getMockForAbstractClass(
				'\Elementor\Controls_Stack', [
					[
						'id' => self::$id,
						'settings' => [],
					],
				]
			);
		}
	}


	public function test_should_return_id_in_int_format() {
		$this->assertEquals( $this->manager->get_id_int(), self::$id );
	}

	public function test_should_return_type() {
		$this->assertEquals( \Elementor\Controls_Stack::get_type(), 'stack' );
	}

	public function test_should_get_current_section() {
		self::assertEquals( $this->manager->get_current_section(), '' );
	}

	public function test_should_get_active_controls() {
		self::assertEquals( $this->manager->get_active_controls(), [] );
	}

	public function test_should_add_control() {
		$this->manager->start_controls_section(
			'poppy',
			[
				'tab' => 'general',
			]
		);
		self::assertTrue(
			$this->manager->add_control(
				'text', [
					'tab' => '',
					'section' => '',
				]
			)
		);
		$this->manager->end_controls_section();
	}

	/**
	 * @expectedException \WPDieException
	 * @expectedExceptionMessage Cannot add a control outside of a section
	 */
	public function test_should_deny_adding_control_out_of_section() {
		$this->manager->add_control(
			'text', [
				'tab' => '',
				'section' => '',
			]
		);
	}

	public function test_should_return_section_controls() {
		$this->manager->start_controls_section(
			'get_section_controls',
			[
				'tab' => 'general',
			]
		);
		$this->manager->add_control(
			'get_section_controls_text', [
				'tab' => '',
				'section' => '',
			]
		);
		$keys = [ 'type', 'tab', 'section', 'name', 'default' ];
		$this->assertArrayHaveKeys( $keys, $this->manager->get_section_controls( 'get_section_controls' )['get_section_controls_text'] );
		$this->manager->add_control(
			'get_section_controls_checkbox', [
				'tab' => '',
				'section' => '',
			]
		);
		$this->manager->end_controls_section();
		$this->assertArrayHaveKeys( $keys, $this->manager->get_section_controls( 'get_section_controls' )['get_section_controls_checkbox'] );
	}


	/**
	 * @expectedException \WPDieException
	 */
	public function test_should_fail_adding_group_control() {
		$this->manager->add_group_control( 'not real' );
	}

	//public function
}
