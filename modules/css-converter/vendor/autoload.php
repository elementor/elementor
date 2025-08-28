<?php

spl_autoload_register(function ($class) {
    if (strpos($class, 'Sabberworm\\CSS\\') === 0) {
        $relative_class = str_replace('\\', '/', substr($class, 14));
        
        $file = __DIR__ . '/sabberworm/php-css-parser/src/' . $relative_class . '.php';
        
        if (file_exists($file)) {
            require_once $file;
        }
    }
});