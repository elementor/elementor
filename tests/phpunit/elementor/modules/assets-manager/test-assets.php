<?php

use PHPUnit\Framework\TestCase;

/**
 *
 * @group \Elementor
 * @group \Elementor\Modules
 * @group \Elementor\Modules\AssetsManager
 *
 */
class Test_Assets extends TestCase {
	private function uri( $handle ) {
		return 'https://ex.com/' . $handle . '.min.js';
	}

	private function assets() {
		return new \Elementor\Modules\AssetsManager\Assets();
	}

	public function test_assets_with_no_dependencies_appear_at_the_start() {
		$assets = $this->assets();

		$assets->append( 'react', $this->uri( 'react' ) );
		$assets->append( 'jquery', $this->uri( 'jquery' ), [] );

		$this->assertEquals( [
			'react',
			'jquery',
		], $assets->priority_queue() );
	}

	public function test_assets_with_direct_dependencies_appear_in_order() {
		$assets = $this->assets();

		$assets->append( 'jquery', $this->uri( 'jquery' ), [] );
		$assets->append( 'fancybox', $this->uri( 'fancybox' ), [ 'jquery' ] );

		$result = $assets->priority_queue();

		$this->assertEquals( [
			'jquery',
			'fancybox',
		], $result );
	}

	public function test_assets_with_indirect_dependencies_appear_in_order() {
		$assets = $this->assets();

		$assets->append( 'react', $this->uri( 'react' ) );
		$assets->append( 'react-dom', $this->uri( 'react-dom' ), [ 'react' ] );
		$assets->append( 'elementor-ui', $this->uri( 'elementor-ui' ), [ 'react-dom' ] );
		$assets->append( 'date-picker', $this->uri( 'date-picker' ), [ 'react', 'elementor-ui' ] );
		$assets->append( 'screen', $this->uri( 'screen' ), [ 'react-dom', 'date-picker' ] );

		$result = $assets->priority_queue();

		$this->assertEquals( [
			'react',
			'react-dom',
			'elementor-ui',
			'date-picker',
			'screen',
		], $result );
	}
}

