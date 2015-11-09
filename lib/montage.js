var Img = require('./image')
  , gm = require('gm').subClass({ imageMagick: true })
  , util = require('util')
  , fs = require('fs')
  , crypto = require('crypto')
  ;

/**
 * Montage creator - arranges images in a layout/grid
 * @class
 * @param {Array<image>} imgs List of images from which to construct the montage
 * @param {Number} [tileSize=120] Pixel width for each tile
 */
var Montage = function (imgs, tileSize) {
  this.imgs = imgs;
  this.tileSize = typeof tileSize !== 'undefined' ? tileSize : 120;
};

/**
 * Builds the montage
 * @callback done Called with the path to the montaged file
 */
Montage.prototype.construct = function (done) {
  imageFileNames = this.imgs.map(function (img) {
    return img.url;
  });
  var imagesFileNamesHashed = crypto.createHash('md5').update(imageFileNames.join('__')).digest('hex');
  var outfile = util.format('%s/montages/%s.%s', process.cwd(), imagesFileNamesHashed, this.imgs[0].extension);
  // Start with the first image...
  var g = gm(imageFileNames[0]);
  // ...then add the rest
  imageFileNames.slice(1).forEach(function (imgFileName) {
    g.montage(imgFileName);
  });
  g.geometry(this.tileSize+'>');
  // Write file (@todo figure out why streams don't work with montage)
  g.write(outfile, function (err) {
    done(err, outfile);
  });
};

// Export class
module.exports = Montage;
