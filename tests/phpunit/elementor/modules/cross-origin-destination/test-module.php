<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\CrossOriginDestination;

use Elementor\Modules\CrossOriginDestination\Module;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	public function test_add_filters__link_attributes__has_empty_rel() {
		// Arrange.
		$module = new Module();

		// Act.
		$attributes = apply_filters( 'elementor/element/link-attributes', [
			'rel' => '',
		] );

		// Assert.
		$this->assertEqualSets( $attributes, [
			'rel' => 'noopener',
		] );
	}

	public function test_add_filters__link_attributes__already_has_other_rel() {
		// Arrange.
		$module = new Module();

		// Act.
		$attributes = apply_filters( 'elementor/element/link-attributes', [
			'rel' => 'nofollow',
		] );

		// Assert.
		$this->assertEqualSets( $attributes, [
			'rel' => 'nofollow noopener',
		] );
	}

	public function test_add_filters__link_attributes__already_has_noopener_rel() {
		// Arrange.
		$module = new Module();

		// Act.
		$attributes = apply_filters( 'elementor/element/link-attributes', [
			'rel' => 'nofollow noopener',
		] );

		// Assert.
		$this->assertEqualSets( $attributes, [
			'rel' => 'nofollow noopener',
		] );
	}

	public function test_add_filters__link_attributes() {
		// Arrange.
		$module = new Module();

		// Act.
		$attributes = apply_filters( 'elementor/element/link-attributes', [
			'should-not-be-touched' => 'test-value',
		] );

		// Assert.
		$this->assertEqualSets( $attributes, [
			'rel' => 'noopener',
			'should-not-be-touched' => 'test-value',
		] );
	}
}
