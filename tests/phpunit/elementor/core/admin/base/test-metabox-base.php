<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin\Base;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Metabox_Base extends Metabox_Test_Base {
	protected function get_metabox_instance() {
		return new Mock_Test_Metabox();
	}

	public function test_get_name() {
		$this->assertEquals( Mock_Test_Metabox::TEST_PREFIX . 'name', $this->metabox->get_name() );
	}

	public function test_get_type() {
		$excepted = Mock_Test_Metabox::TEST_PREFIX . 'type';

		$this->assertEquals( $excepted, $this->metabox->get_type() );
	}

	public function test_get_title() {
		$excepted = Mock_Test_Metabox::TEST_PREFIX . 'title';

		$this->assertEquals( $excepted, $this->metabox->get_title() );
	}

	public function test_get_fields() {
		$this->assertEqualSets( [
			[
				'id' => Mock_Test_Metabox::FIELD_INPUT_A,
				'field_type' => 'input',
			],
			[
				'id' => Mock_Test_Metabox::FIELD_INPUT_B,
				'field_type' => 'input',
			],
		], $this->metabox->get_fields() );
	}

	public function test_get_input_fields() {
		$this->assertEqualSets( [
			Mock_Test_Metabox::FIELD_INPUT_A,
			Mock_Test_Metabox::FIELD_INPUT_B,
		], $this->metabox->get_input_fields() );
	}

	public function test_render_meta_box() {
		// Arrange.
		$input_fields = $this->metabox->get_input_fields();

		// Act.
		ob_start();
		do_meta_boxes( $this->screen, 'normal', $this->post );
		$output = ob_get_clean();

		// Assert.
		foreach ( $input_fields as $input_field ) {
			$this->assertContains( 'id="' . $input_field . '"', $output );
		}
	}

	/**
	 * @param array $input_fields
	 *
	 * @return array input fields with values ( key/value ).
	 */
	private function generate_test_post_with_meta( array $input_fields ) {
		$result = [];

		foreach ( $input_fields as $input_key => $input_value ) {
			$_POST[ $input_key ] = $input_value;
		}

		do_action( 'save_post_' . $this->metabox->get_type(), $this->post->ID, $this->post, true );

		foreach ( $input_fields as $input_key => $input_value ) {
			$result[ $input_key ] = get_post_meta( $this->post->ID, '_elementor_' . $input_key, true );;
		}

		return $result;
	}

	public function test_save_post_meta() {
		// Arrange.
		$excepted_input = [];

		foreach( $this->metabox->get_input_fields() as $input_field_name ) {
			$excepted_input[ $input_field_name ] = rand();
		}

		// Act.
		$actual = $this->generate_test_post_with_meta( $excepted_input );

		// Assert.
		foreach ( $excepted_input as $input_key => $input_value ) {
			$this->assertEquals( $excepted_input[ $input_key ], $actual[ $input_key ] );
		}
	}

	/**
	 * The test aim to check if 'sanitize_text_field' were triggered.
	 */
	public function test_sanitize_post_meta() {
		// Arrange.
		$input_fields = [
			Mock_Test_Metabox::FIELD_INPUT_A => 'simple text',
			Mock_Test_Metabox::FIELD_INPUT_B => '<tag />',
		];

		// Act.
		$actual = $this->generate_test_post_with_meta( $input_fields );

		// Assert.
		$this->assertEqualSets( [
			Mock_Test_Metabox::FIELD_INPUT_A => 'simple text',
			Mock_Test_Metabox::FIELD_INPUT_B => '',
		], $actual );
	}

	public function test_sanitize_post_meta__with_is_sanitize_meta_false() {
		// Arrange.
		$default_is_sanitize_meta_orig = $this->metabox->default_is_sanitize_meta;

		$this->metabox->default_is_sanitize_meta = false;

		$input_fields = [
			Mock_Test_Metabox::FIELD_INPUT_A => 'simple text',
			Mock_Test_Metabox::FIELD_INPUT_B => '<tag />',
		];

		// Act.
		$actual = $this->generate_test_post_with_meta( $input_fields );

		// Assert.
		$this->assertEqualSets( $input_fields, $actual );

		// Cleanup.
		$this->metabox->default_is_sanitize_meta = $default_is_sanitize_meta_orig;
	}

	public function test_sanitize_post_meta__without_unfiltered_html_capability() {
		// Arrange.
		$current_user = $this->factory()->get_editor_user();
		$current_user->add_cap( 'unfiltered_html', false );

		wp_set_current_user( $current_user->ID );

		$input_fields = [
			Mock_Test_Metabox::FIELD_INPUT_A => 'simple text',
			Mock_Test_Metabox::FIELD_INPUT_B => '<tag />',
		];

		// Act.
		$actual = $this->generate_test_post_with_meta( $input_fields );

		// Assert.
		$this->assertEqualSets( [
			Mock_Test_Metabox::FIELD_INPUT_A => 'simple text',
			Mock_Test_Metabox::FIELD_INPUT_B => '',
		], $actual );
	}
}
