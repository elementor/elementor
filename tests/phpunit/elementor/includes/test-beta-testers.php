<?php
namespace Elementor\Testing\Includes;

use Elementor\Beta_Testers;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Beta_Testers extends Elementor_Test_Base {

	const PLUGIN_BASE = ELEMENTOR_PLUGIN_BASE;

	public function setUp(): void {
		parent::setUp();

		update_option( 'elementor_beta', 'yes' );
	}

	public function test_no_update_when_checked_version_matches_beta_tag() {
		$beta_version = $this->increase_version( ELEMENTOR_VERSION );
		$remove_http_mock = $this->mock_beta_readme( $beta_version );

		$transient = (object) [
			'checked' => [
				static::PLUGIN_BASE => $beta_version,
			],
		];

		$result = $this->beta_check( $transient );

		$remove_http_mock();

		$this->assertEmpty( $result->response );
	}

	public function test_no_update_when_checked_version_is_newer_than_beta_tag() {
		$beta_version = $this->increase_version( ELEMENTOR_VERSION );
		$checked_version = $this->increase_version( $beta_version );
		$remove_http_mock = $this->mock_beta_readme( $beta_version );

		$transient = (object) [
			'checked' => [
				static::PLUGIN_BASE => $checked_version,
			],
		];

		$result = $this->beta_check( $transient );

		$remove_http_mock();

		$this->assertEmpty( $result->response );
	}

	public function test_update_when_checked_version_is_older_than_beta_tag() {
		$beta_version = $this->increase_version( ELEMENTOR_VERSION );
		$remove_http_mock = $this->mock_beta_readme( $beta_version );

		$transient = (object) [
			'checked' => [
				static::PLUGIN_BASE => ELEMENTOR_VERSION,
			],
		];

		$result = $this->beta_check( $transient );

		$remove_http_mock();

		$this->assertSame( $beta_version, $result->response[ static::PLUGIN_BASE ]->new_version );
	}

	private function beta_check( $transient ) {
		$beta_testers = new Beta_Testers();

		return $beta_testers->check_version( $transient );
	}

	private function increase_version( $version ) {
		return $version . '1';
	}

	private function mock_beta_readme( $beta_tag ) {
		$filter = function( $preempt, $args, $url ) use ( $beta_tag ) {
			if ( false === strpos( $url, 'plugins.svn.wordpress.org/elementor/trunk/readme.txt' ) ) {
				return $preempt;
			}

			return [
				'headers' => [],
				'response' => [
					'code' => 200,
					'message' => 'OK',
				],
				'cookies' => [],
				'filename' => '',
				'body' => "Stable tag: 1.0.0\nBeta tag: {$beta_tag}\n",
			];
		};

		add_filter( 'pre_http_request', $filter, 10, 3 );

		return function() use ( $filter ) {
			remove_filter( 'pre_http_request', $filter, 10 );
		};
	}
}
