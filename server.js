/**
 * Module dependencies.
 */
var express = require('express')
	, fs = require('fs')
	, Img = require('./lib/image.js')
	, gm = require('gm')
	, morgan = require('morgan')
	;

/**
 * Options.
 */
var img_path = __dirname + '/img/';
if (!fs.existsSync(img_path)) {
	fs.mkdirSync(img_path);
}
var resize_message = 'Specify an url \'u\', width \'w\' and height \'h\'';
var crop_message = 'Specify an url \'u\', width \'w\', height \'h\', x-offset \'x\' and y-offset \'y\'';
/**
 * Express server.
 */
var app = express()
  .use(morgan('dev'))
	.set('static_server', process.env.NODE_STATIC_SERVER || "http://zooniverse-static.s3-website-us-east-1.amazonaws.com/")
  .set('port', process.env.NODE_PORT || 8080)
  .set('env', process.env.NODE_ENV || "development")
  .set('debug', process.env.NODE_DEBUG || false);

// server to find the images on
var static_host = app.settings.static_server;


/**
 * Express routes.
 */
app.get('/resize', function(req, res, next){
	var u = req.query.u // URL
		, w = req.query.w // width
		, h = req.query.h // height
		, o = req.query.o // opts, support http://www.graphicsmagick.org/GraphicsMagick.html#details-resize
		;
	if (!u || !w || !h) res.send(400, {error: resize_message});

	var img = new Img(static_host + u,img_path).load(function(err,im) {
		if (err) res.status(500).send({ error: err })
		else {
			gm(im.destHashed)
			  .resize(w, h, o)
		    .stream(function streamOut (err, stdout, stderr) {
					if (err) res.status(500).send({ error: err })
		      stdout.pipe(res); //pipe to response
		      stdout.on('error', next);
		    });
		}
	});
});

app.get('/resize_crop', function(req, res, next){
	var u = req.query.u // URL
		, w = req.query.w // width
		, h = req.query.h // height
		;
	if (!u || !w || !h) res.send(400, {error: resize_message});

	var img = new Img(static_host + u,img_path).load(function(err,im) {
		if (err) res.status(500).send({ error: err })
		else {
			im.resize(w,h,function(err,im) {
				if (err) res.status(500).send({ error: err })
				else {
					res.writeHead(200, {"Content-Type": "image/" + im.extension});
      		res.end(im.resized, "binary");
				}
			})
		}
	});
});

app.get('/crop', function(req, res, next){
	var u = req.query.u // URL
		, w = req.query.w // width
		, h = req.query.h // height
		, x = req.query.x // x-offset
		, y = req.query.y // y-offset
		;
	if (!u || !w || !h || !x || !y) res.send(400, {error: crop_message});

	var img = new Img(static_host + u,img_path).load(function(err,im) {
		if (err) res.status(500).send({ error: err })
		else {
			if (app.get("debug")) {
				console.log("\nCrop image:");
				console.log(im);
			}
			res.writeHead(200, {"Content-Type": "image/" + im.extension});
			gm(im.destHashed)
		    .crop(w, h, x, y)
		    .stream(function streamOut (err, stdout, stderr) {
					if (err) res.status(500).send({ error: err })
		      stdout.pipe(res);
		      stdout.on('error', next);
		    });
		}
	});
});


/**
 * Start server.
 */
app.listen(app.get("port"), function() {
	console.log("Express server listening on port %d in %s mode", app.settings.port || 3000, app.settings.env);
});
