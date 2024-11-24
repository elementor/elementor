const fs = require( 'fs' );
const path = require( 'path' );
const { InfluxDB, Point } = require( '@influxdata/influxdb-client' );

// Конфигурация InfluxDB
const url = 'http://localhost:8086'; // URL InfluxDB
const token = 'HS1jkb8L8sEMUEwPMFAr3jPExTrt3jZRHRd_3Hje2pP6uhqem1f-tFgurYeagnJcqDqhB-vzfqh-roU6WUsOKw=='; // Замените на ваш токен
const org = 'elementor'; // Замените на вашу организацию
const bucket = 'elementor'; // Замените на вашу корзину

const influxDB = new InfluxDB( { url, token } );
const writeApi = influxDB.getWriteApi( org, bucket, 'ms' ); // 'ms' - единица времени

// Путь к файлу с результатами тестов
const resultsPath = path.resolve( __dirname, '/Users/svitlanadykun/WebstormProjects/elementor-at1/test-results.json' );

// Проверка существования файла
if ( ! fs.existsSync( resultsPath ) ) {
	console.error( `Файл ${ resultsPath } не найден.` );
	process.exit( 1 );
}

// Чтение и парсинг файла
let results;
try {
	const rawData = fs.readFileSync( resultsPath, 'utf-8' );
	results = JSON.parse( rawData );
} catch ( err ) {
	console.error( `Ошибка при чтении или парсинге файла ${ resultsPath }:`, err );
	process.exit( 1 );
}

const failedTests = [];

// Функция для проверки неудачных статусов
const isFailedStatus = ( status ) => {
	const failedStatuses = [ 'failed', 'timedOut', 'interrupted', 'unexpected' ];
	return failedStatuses.includes( status );
};

// Проход по всем тестам и сбор неудачных
if ( results.suites && Array.isArray( results.suites ) ) {
	results.suites.forEach( ( suite ) => {
		if ( suite.specs && Array.isArray( suite.specs ) ) {
			suite.specs.forEach( ( spec ) => {
				if ( spec.status && isFailedStatus( spec.status ) ) {
					spec.tests.forEach( ( test ) => {
						test.results.forEach( ( result ) => {
							if ( result.status && isFailedStatus( result.status ) ) {
								failedTests.push( {
									title: `${ spec.title } - ${ test.title }`,
									status: result.status,
									duration: result.duration,
									file: result.error?.location?.file || spec.file,
									line: result.error?.location?.line || spec.line,
									column: result.error?.location?.column || spec.column,
									error: result.error?.message || 'Unknown error',
								} );
							}
						} );
					} );
				}
			} );
		}
	} );
} else {
	console.warn( 'В JSON нет раздела "suites" или он не является массивом.' );
}

// Вывод и отправка данных в InfluxDB
if ( 0 === failedTests.length ) {
	console.log( 'Неудачные тесты:' );
	failedTests.forEach( ( test ) => {
		console.log( `- ${ test.title }` );
		console.log( `  Статус: ${ test.status }` );
		console.log( `  Время выполнения: ${ test.duration }ms` );
		console.log( `  Файл: ${ test.file }:${ test.line }:${ test.column }` );
		if ( test.error ) {
			console.log( `  Ошибка: ${ test.error }` );
		}
		console.log( '' ); // Пустая строка для разделения тестов

		// Создание точки данных для InfluxDB
		const point = new Point( 'test_result' )
			.tag( 'test', test.title )
			.tag( 'status', test.status )
			.floatField( 'duration', test.duration )
			.tag( 'file', test.file )
			.intField( 'line', test.line )
			.intField( 'column', test.column )
			.stringField( 'error', test.error || '' );

		writeApi.writePoint( point );
	} );

	// Отправка данных
	writeApi
		.close()
		.then( () => {
			console.log( 'Данные успешно отправлены в InfluxDB.' );
		} )
		.catch( ( e ) => {
			console.error( 'Ошибка при отправке данных в InfluxDB', e );
		} );
} else {
	console.log( 'Все тесты прошли успешно.' );
}
