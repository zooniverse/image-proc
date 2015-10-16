/**
 * Module dependencies.
 */
var fs = require('fs')
  , http_client = require('http')
  , url = require('url')
  , im = require('imagemagick')
  , crypto = require('crypto')
  ;

/**
 * Expose object.
 */
var image = function(url,path) {
    this.url = url
  , this.path = path
  , this.filename = this.url.split('/').slice(-1).toString()
  , this.filenameHashed = null
  , this.destHashed = null
  , this.extension = this.filename.split('.').slice(-1).toString()
  , this.dest = this.path + this.filename
  , this.w = null
  , this.h = null
  , this.resized = null;
  this.hashFilename();
  return this; // to chain
};
module.exports = image;

/**
 * Hash the filename
 *
 */
image.prototype.hashFilename = function() {
  this.filenameHashed = crypto.createHash('md5').update(this.url).digest("hex");
  this.destHashed     = this.path + this.filenameHashed + '.' + this.extension;
}

/**
 * Check if the image exists in our directory
 *   - if exists: load
 *   - otherwise: download
 *
 * @param {opt} options with url and file destination
 * @callback callback(err,file)
 * @api public
 */
image.prototype.load = function(callback) {
  var that = this;
	fs.exists(this.destHashed, function(exists) {
		if (exists) { // no need to download
      that.getSize(callback);
		}
		else { // download
			that.getImg(function(err,res) {
        that.getSize(callback);
      });
		}
	});
}

/**
 * Get the image from URL
 *
 * @callback callback(err,file)
 * @api public
 */
image.prototype.getImg = function(callback) {
  var that = this;
	var u = url.parse(this.url);

  var options = {
    host: u.hostname,
    port: 80,
    path: u.pathname
  };

  http_client.get(options, function(res) {
    res.setEncoding('binary')
    var imagedata = '';
    res.on('data', function(chunk){
      imagedata += chunk;
    });
    res.on('end', function(){
      fs.writeFile(that.destHashed, imagedata, 'binary', function(err) {
        callback(err,that);
      });
    });
  }).on('error', function(err) {
    callback(err,that);
  });
}


/**
 * Get image size.
 *
 * @callback callback
 * @api public
 */
image.prototype.getSize = function(callback) {
  var that = this;
  im.identify(['-format', '%w,%h',this.destHashed], function(err,features) {
    if (err) return callback(err,that);
    features = features.split(',');
      that.w = features[0]   // Original width
    , that.h = features[1] // Original height
    callback(null,that);
  });
}


/**
 * Resize image.
 *
 * @param {Number} w
 * @param {Number} h
 * @callback callback(err,binary)
 * @api public
 */
image.prototype.resize = function(w,h,callback) {
  var that = this;
  var w_ratio = this.w/w
    , h_ratio = this.h/h;
  var ratio = w_ratio
    , crop_  = false; // crop boolean
  if (w_ratio !== h_ratio) {
    crop_ = true;
    ratio = Math.min(w_ratio,h_ratio);
  }
  var options = {
      srcPath : this.destHashed
    , width : this.w/ratio
    , height : this.h/ratio
  };
  im.resize(options, function(err, stdout, stderr) {
    if (err) return callback(err,that);
    that.resized = stdout;
    if (!crop_) callback(err,that);
    else that.crop(w,h,callback);
  });
}

/**
 * Crop image
 *
 * @param {Number} w
 * @param {Number} h
 * @callback callback(err,binary)
 * @api public
 */
image.prototype.crop = function(w,h,callback) {
  var that = this;
  var options = {
      srcData : this.resized
    , width : w
    , height : h
  };
  im.crop(options, function(err, stdout, stderr) {
    that.resized = stdout;
    callback(err,that);
  });
}
