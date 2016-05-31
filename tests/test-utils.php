<?php

class Elementor_Test_Utils extends WP_UnitTestCase {

	public function test_getYoutubeId() {
		$youtube_id = '9uOETcuFjbE';
		$youtube_urls = [
			'https://www.youtube.com/watch?v=' . $youtube_id,
			'https://www.youtube.com/watch?v=' . $youtube_id . '&feature=player_embedded',
			'https://youtu.be/' . $youtube_id,
		];
		
		foreach ( $youtube_urls as $youtube_url ) {
			$this->assertEquals( $youtube_id, \Elementor\Utils::get_youtube_id_from_url( $youtube_url ) );
		}
		
		$this->assertFalse( \Elementor\Utils::get_youtube_id_from_url( 'https://www.youtube.com/' ) );
	}
}
