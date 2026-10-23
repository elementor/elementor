<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Classes\Seo_Llms_Txt_Detector;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Seo_Llms_Txt_Detector extends Elementor_Test_Base {

	private $detector;

	public function setUp(): void {
		parent::setUp();

		Seo_Llms_Txt_Detector::reset_cache();
		$this->detector = new Seo_Llms_Txt_Detector();
	}

	public function tearDown(): void {
		delete_option( 'wpseo' );
		delete_option( 'rank_math_modules' );
		delete_option( 'aioseo_options' );

		Seo_Llms_Txt_Detector::reset_cache();

		parent::tearDown();
	}

	public function test_get_owner__returns_null_when_no_seo_plugin_active() {
		$this->assertNull( $this->detector->get_owner() );
	}

	public function test_get_owner__detects_yoast_with_enable_llms_txt_true() {
		if ( ! class_exists( 'WPSEO_Options' ) ) {
			$this->markTestSkipped( 'WPSEO_Options not available' );
		}

		update_option( 'wpseo', [ 'enable_llms_txt' => true ] );

		$this->assertSame( 'yoast', $this->detector->get_owner() );
	}

	public function test_get_owner__returns_null_when_yoast_llms_disabled() {
		if ( ! class_exists( 'WPSEO_Options' ) ) {
			$this->markTestSkipped( 'WPSEO_Options not available' );
		}

		update_option( 'wpseo', [ 'enable_llms_txt' => false ] );

		$this->assertNull( $this->detector->get_owner() );
	}

	public function test_get_owner__detects_rank_math_when_llms_txt_module_active() {
		update_option( 'rank_math_modules', [ 'llms-txt', 'other-module' ] );

		$this->assertSame( 'rank_math', $this->detector->get_owner() );
	}

	public function test_get_owner__returns_null_when_rank_math_llms_not_in_modules() {
		update_option( 'rank_math_modules', [ 'other-module' ] );

		$this->assertNull( $this->detector->get_owner() );
	}

	public function test_get_owner__handles_non_array_rank_math_modules() {
		update_option( 'rank_math_modules', 'invalid' );

		$this->assertNull( $this->detector->get_owner() );
	}

	public function test_get_owner__detects_aioseo_when_llms_enabled() {
		$option = [
			'sitemap' => [
				'llms' => [
					'enable' => true,
				],
			],
		];

		update_option( 'aioseo_options', wp_json_encode( $option ) );

		$this->assertSame( 'aioseo', $this->detector->get_owner() );
	}

	public function test_get_owner__returns_null_when_aioseo_llms_disabled() {
		$option = [
			'sitemap' => [
				'llms' => [
					'enable' => false,
				],
			],
		];

		update_option( 'aioseo_options', wp_json_encode( $option ) );

		$this->assertNull( $this->detector->get_owner() );
	}

	public function test_get_owner__handles_aioseo_options_as_array() {
		$option = [
			'sitemap' => [
				'llms' => [
					'enable' => true,
				],
			],
		];

		update_option( 'aioseo_options', $option );

		$this->assertSame( 'aioseo', $this->detector->get_owner() );
	}

	public function test_get_owner__handles_malformed_aioseo_json() {
		update_option( 'aioseo_options', '{invalid json' );

		$this->assertNull( $this->detector->get_owner() );
	}

	public function test_get_owner__respects_filter() {
		add_filter( 'elementor/agents/llms_txt/seo_plugin_owner', function() {
			return 'custom_plugin';
		} );

		$this->assertSame( 'custom_plugin', $this->detector->get_owner() );

		remove_all_filters( 'elementor/agents/llms_txt/seo_plugin_owner' );
	}

	public function test_get_owner__caches_result() {
		update_option( 'rank_math_modules', [ 'llms-txt' ] );

		$this->assertSame( 'rank_math', $this->detector->get_owner() );

		delete_option( 'rank_math_modules' );

		$this->assertSame( 'rank_math', $this->detector->get_owner() );

		Seo_Llms_Txt_Detector::reset_cache();

		$this->assertNull( $this->detector->get_owner() );
	}

	public function test_get_owner_label__returns_correct_labels() {
		update_option( 'rank_math_modules', [ 'llms-txt' ] );
		$this->assertSame( 'Rank Math', $this->detector->get_owner_label() );

		Seo_Llms_Txt_Detector::reset_cache();

		$option = [ 'sitemap' => [ 'llms' => [ 'enable' => true ] ] ];
		update_option( 'aioseo_options', $option );
		$this->assertSame( 'All in One SEO', $this->detector->get_owner_label() );
	}

	public function test_get_owner_label__returns_empty_string_when_no_owner() {
		$this->assertSame( '', $this->detector->get_owner_label() );
	}
}
