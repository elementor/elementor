<?php
namespace Elementor\Tests\Phpunit\Elementor\Core;

use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Test_Documents_Manager extends Elementor_Test_Base {

	public function test_create() {
		$documents_manager = $this->elementor()->documents;

		$titles = [
			'An - happy - title :)' => 'An - happy - title :)',
			"One more title <script>alert('Hello buddy')</script>" => 'One more title &lt;script&gt;alert(&#039;Hello buddy&#039;)&lt;/script&gt;',
			'Title with image? Why not? <img src="x" onerror="alert(\'XSS\')">. It sounds great for me!!' => 'Title with image? Why not? &lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;. It sounds great for me!!',
		];

		foreach( $titles as $title => $desired_title ) {
			$document = $documents_manager->create( 'post', [ 'post_title' => $title ] );

			$post_title = $document->get_post()->post_title;

			$this->assertEquals( $desired_title, $post_title );
		}
	}
}
