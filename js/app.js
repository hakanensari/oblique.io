try {
  Typekit.load();
} catch(e) {}

$(function() {
  // This is a random oblique strategy.
  var Strategy = Backbone.Model.extend({
    url: '//api.oblique.io?jsoncallback=?',
  });

  // Fetch some random images from Flickr.
  var Image = Backbone.Model.extend({
    src: function() {
      return "//farm"             + this.get('farm') +
             ".staticflickr.com/" + this.get('server') +
             "/"                  + this.get('id') +
             "_"                  + this.get('secret') +
             ".jpg"
    }
  });

  var Images = Backbone.Collection.extend({
    model: Image,

    initialize: function(phrase) {
      var sortByLength = function(a, b) {
        return(b.toString().length - a.toString().length);
      }

      var query = phrase
        .split(' ')
        .sort(sortByLength)
        .splice(0, 1)
        .join()

      this.url = '//api.flickr.com/services/rest/?jsoncallback=?&' +
        $.param({
          api_key:      "22e9685a8bef1253e96ffd92ebc6c676",
          content_type: 1,
          format:       "json",
          method:       "flickr.photos.search",
          sort:         "interestingness-desc",
          text:         query
        });
    },

    parse: function(response) {
      return(response.photos.photo);
    },

    sample: function(success, error) {
      this.fetch({
        success: function(collection, _, _) {
          image = collection.models[Math.floor(Math.random() * collection.models.length)]
          success(image);
        },

        error: error
      });
    }
  });

  var strategy = new Strategy;

  strategy.fetch({
    success: function(strategy, _, _) {
      var $container = $('.container');
      $container.html('<p>' + strategy.get('phrase') + '</p>');

      var images = new Images(strategy.get('phrase'));
      images.sample(
        function(image, _, _) {
          $('.cover')
            .css({
              'background-image': 'url(' + image.src() + ')',
              opacity: 1
            })
        }
      );
    }
  });
});
