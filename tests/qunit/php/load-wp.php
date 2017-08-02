<?php

define('WP_MEMORY_LIMIT', '256M');

$_SERVER['HTTP_HOST'] = 'localhost';
$_SERVER['SERVER_NAME'] = 'localhost';

require __DIR__ . '/../../../../../../wp-load.php';

wp_set_current_user( 1 );

$post_id = 1;