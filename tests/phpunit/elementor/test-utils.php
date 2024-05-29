<?php
namespace Elementor\Testing;

use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Utils extends Elementor_Test_Base {

	public function test_getYoutubeId() {
		$youtube_id = '9uOETcuFjbE';
		$youtube_urls = [
			'https://www.youtube.com/watch?v=' . $youtube_id,
			'https://www.youtube.com/watch?v=' . $youtube_id . '&feature=player_embedded',
			'https://youtu.be/' . $youtube_id,
		];

		foreach ( $youtube_urls as $youtube_url ) {
			$video_properties = \Elementor\Embed::get_video_properties( $youtube_url );

			$this->assertEquals( $youtube_id, $video_properties['video_id'] );
		}

		$this->assertNull( \Elementor\Embed::get_video_properties( 'https://www.youtube.com/' ) );
	}

	public function test_array_util() {
		$array = [ 'a' => 1, 'b' => 2, 'd' => 4 ];

		$new_array = \Elementor\Core\Utils\Arr::insert_element_after_key( $array, 'b', 'c', 3 );

		$this->assertEquals( [ 'a' => 1, 'b' => 2, 'c' => 3, 'd' => 4 ], $new_array );

		$new_array = \Elementor\Core\Utils\Arr::insert_element_after_key( $array, 'e', 'c', 3 );

		$this->assertEquals( [ 'a' => 1, 'b' => 2, 'd' => 4, 'c' => 3 ], $new_array );
	}
}
