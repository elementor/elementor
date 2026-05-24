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
	private function assets() {
		return new \Elementor\Modules\AssetsManager\Assets();
	}

	public function test_assets_with_no_dependencies_appear_at_the_start() {
		$assets = $this->assets();

		$assets->append( 'react' );
		$assets->append( 'jquery', [] );

		$this->assertEquals( [
			'react',
			'jquery',
		], $assets->priority_queue() );
	}

	public function test_assets_with_direct_dependencies_appear_in_order() {
		$assets = $this->assets();

		$assets->append( 'jquery', [] );
		$assets->append( 'fancybox', [ 'jquery' ] );

		$result = $assets->priority_queue();

		$this->assertEquals( [
			'jquery',
			'fancybox',
		], $result );
	}

	public function test_assets_with_indirect_dependencies_appear_in_order() {
		$assets = $this->assets();

		$assets->append( 'react' );
		$assets->append( 'react-dom', [ 'react' ] );
		$assets->append( 'elementor-ui', [ 'react-dom' ] );
		$assets->append( 'date-picker', [ 'react', 'elementor-ui' ] );
		$assets->append( 'screen', [ 'react-dom', 'date-picker' ] );

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

