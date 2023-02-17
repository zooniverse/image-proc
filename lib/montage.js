var Img = require('./image')
  , gm = require('gm').subClass({ imageMagick: true })
  , util = require('util')
  , fs = require('fs')
  , crypto = require('crypto')
  ;

var img_path = __dirname + '/montages/';
if (!fs.existsSync(img_path)) {
  fs.mkdirSync(img_path);
}

/**
 * Montage creator - arranges images in a layout/grid
 * @class
 * @param {Array<image>} imgs List of images from which to construct the montage
 * @param {Number} [tileSize=120] Pixel width for each tile
 * @param {Number} [maxWidth=120] Maximum pixel width for final image. Will determine the layout used by the montage.
 */
var Montage = function (imgs, tileSize, maxWidth) {
  this.imgs = imgs;
  this.tileSize = typeof tileSize !== 'undefined' ? tileSize : 120;
  this.maxWidth = maxWidth || 120;
};

Montage.prototype = {

  /**
   * Grid layout to use
   * @type {String}
   */
  get layout () {
    var numCols = Math.floor(this.maxWidth / this.tileSize);
    var numRows = Math.ceil(this.imgs.length / numCols);
    return util.format('%sx%s', numCols, numRows);
  },

  /**
   * Builds the montage
   * @public
   * @callback done Called with the path to the montaged file
   */
  construct: function (done) {
    imageFileNames = this.imgs.map(function (img) {
      return img.destHashed;
    });
    var imagesFileNamesHashed = crypto.createHash('md5').update(imageFileNames.join('__')).digest('hex');
    var outfile = util.format('%s/%s.%s', img_path, imagesFileNamesHashed, this.imgs[0].extension);
    // Start with the first image...
    var g = gm(imageFileNames[0]);
    // ...then add the rest
    imageFileNames.slice(1).forEach(function (imgFileName) {
      g.montage(imgFileName);
    });
    g.geometry(this.tileSize+'>');
    // If max width set, apply layout to satisfy
    g.tile(this.layout);
    // Write file (@todo figure out why streams don't work with montage)
    g.write(outfile, function (err) {
      done(err, outfile);
    });
  }
};

// Export class
module.exports = Montage;
