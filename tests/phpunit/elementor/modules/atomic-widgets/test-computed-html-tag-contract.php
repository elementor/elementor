<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PHPUnit\Framework\TestCase;

class Test_Computed_Html_Tag_Contract extends TestCase {

	public function test_every_concrete_atomic_element_declares_get_computed_html_tag(): void {
		$elements_root = dirname( __DIR__, 5 ) . '/modules/atomic-widgets/elements';

		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $elements_root, FilesystemIterator::SKIP_DOTS )
		);

		/** @var SplFileInfo $file */
		foreach ( $iterator as $file ) {
			if ( 'php' !== $file->getExtension() ) {
				continue;
			}

			$path = $file->getPathname();
			$contents = file_get_contents( $path );

			if ( false === $contents ) {
				continue;
			}

			if ( ! preg_match( '/extends\s+Atomic_(?:Widget|Element)_Base/', $contents ) ) {
				continue;
			}

			if ( preg_match( '/abstract\s+class\s+/', $contents ) ) {
				continue;
			}

			$this->assertMatchesRegularExpression(
				'/public\s+static\s+function\s+get_computed_html_tag\s*\(/',
				$contents,
				"Atomic element file must declare get_computed_html_tag(): $path"
			);
		}
	}
}
