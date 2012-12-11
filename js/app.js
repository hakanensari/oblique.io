try {
  Typekit.load();
} catch(e) {}

$(function() {
  // The browser's location.
  var Location = Backbone.Model.extend({
    url: 'http://freegeoip.net/json/?callback=?'
  });

  // A random strategy.
  var Strategy = Backbone.Model.extend({
    url: '//api.oblique.io?callback=?',

    parse: function(response) {
      return { phrase: response }
    }
  });

  // A Flickr image.
  var Image = Backbone.Model.extend({
    // Returns the URL of the image.
    //
    // size - An optional size (m, s, t, z, or b).
    url: function(size) {
      var host = 'farm' + this.get('farm') + '.staticflickr.com',
          path = '/' + this.get('server') + '/';

      var filename = this.get('id') + '_' + this.get('secret');
      if(size) {
        filename += '_' + size;
      }
      filename += '.jpg';

      return '//' + host + path + filename;
    }
  });

  // A crude wrapper around Flickr photo search.
  var Flickr = Backbone.Collection.extend({
    model: Image,

    parse: function(response) {
      return response.photos.photo;
    },
  }, {
    // Searches Flickr for a phrase, scoping query by browser's location.
    //
    // phrase -   A search phrase.
    // callback - A function which is called with a random image.
    search: function(phrase, callback) {
      (new Location).fetch({
        success: function(location) {
          var flickr = new Flickr,
              lat    = location.get('latitude'),
              lon    = location.get('longitude');

          var query = phrase
            .split(' ')
            .sort(function(a, b) {
              return b.toString().length - a.toString().length;
            })
            .splice(0, 1)
            .join();

          flickr.url = '//api.flickr.com/services/rest/?jsoncallback=?&' +
            $.param({
              api_key: "22e9685a8bef1253e96ffd92ebc6c676",
              format:  "json",
              method:  "flickr.photos.search",
              sort:    "interestingness-desc",
              text:    query
            });

          flickr.fetch({
            success: function(flickr) {
              var index = Math.floor(Math.random() * flickr.models.length);
              callback(flickr.models[index]);
            }
          });
        }
      });
    },
  });

  // Fetch a random strategy.
  (new Strategy).fetch({
    success: function(strategy) {
      var $container = $('.container');
      $container.html('<p>' + strategy.get('phrase') + '</p>');

      // Add a random background image.
      Flickr.search(strategy.get('phrase'), function(image) {
        $('.cover')
          .css({
            'background-image': 'url(' + image.url() + ')',
          })
      });
    }
  });
});
