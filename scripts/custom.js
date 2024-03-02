$(document).ready(function() {
    var lastfmKey = '13b29c7c9664ac4eb57a61b39713ee80';
    var lastfmUsername = 'amogl';
    var lastfmApiUrl = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" + lastfmUsername + "&api_key=" + lastfmKey + "&format=json&limit=1";
    var traktKey = '0d0477ed0e9cf3fdca652206c98c2adf513ad01199daa9418b2b233a7cb84f15';
    var traktUsername = 'amogl';
    var traktApiUrl = 'https://api.trakt.tv/users/' + traktUsername + '/history?limit=1';
    // var traktApiUrl = '/test-trakt-data.json';
    var traktUrl = "//trakt.tv/";
    // var tvdbKey = "2ada08a7-aab2-4164-8317-3b8a299c1d6e";
    // var tvdbPosterUrl = "https://artworks.thetvdb.com/banners/";


    //--Last fm
    function fetchLastfmData() {
        $.getJSON(lastfmApiUrl, function(data) {
            if (data.recenttracks.track.length > 0 && data.recenttracks.track[0]['@attr'] && data.recenttracks.track[0]['@attr'].nowplaying === 'true') {
                // console.log(data);
                var track = data.recenttracks.track[0];
                populateHTML(track.image[3]['#text'], 'I\'m currently listening to', track.name, track.artist['#text'], track.url);
                $('.media').removeClass('stopped');
                $('.media').addClass('playing');
            } else {
                fetchTraktData();
            }
        });
    }


    //--Trakt
    function fetchTraktData() {
        $.ajax({
            url: traktApiUrl,
            type: 'GET',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('trakt-api-version', '2');
                xhr.setRequestHeader('trakt-api-key', traktKey);
            },
            success: function(data) {
                // console.log(data);
                if (data.length > 0) {
                    var lastWatchedItem = data[0];
                    var itemType = lastWatchedItem.type;
                    var itemName, itemSubtitle;
                    var itemAction = lastWatchedItem.action;

                    var currentDateTime  = moment(new Date());
                    var lastWatchedItemDateTime  = moment(new Date(lastWatchedItem.watched_at));
                    var timeDifference = moment.duration(currentDateTime.diff(lastWatchedItemDateTime)).asMinutes();

                    // console.log("watched time: " + lastWatchedItemDateTime);
                    // console.log("current time: " + currentDateTime);
                    // console.log("difference: " + timeDifference);

                    if(timeDifference < 45 && itemAction == "checkin"){
                        var itemShowNumbers = "";
                        if (itemType === 'episode') {
                            itemName = lastWatchedItem.show.title;
                            itemUrl = traktUrl + 'shows/' + lastWatchedItem.show.ids.slug;
                            itemSubtitle = "S" + lastWatchedItem.episode.season + "E" + lastWatchedItem.episode.number + " " + lastWatchedItem.episode.title;
                            itemImage = "https://artworks.thetvdb.com/banners/posters/" + lastWatchedItem.show.ids.tvdb + "-1.jpg";

                        } else if (itemType === 'movie') {
                            itemName = lastWatchedItem.movie.title;
                            itemUrl = traktUrl + 'movies/' + lastWatchedItem.movie.ids.slug;
                            itemSubtitle = lastWatchedItem.movie.year;
                            itemImage = "/images/movie-placeholder.jpg";
                        }
                        $('.media').removeClass('stopped');
                        $('.media').addClass('playing');
                        populateHTML(itemImage, 'I\'m currently watching', itemName, itemSubtitle, itemUrl);
                    }
                    else
                    {
                        $('.media').removeClass('playing');
                        $('.media').addClass('stopped');

                        setTimeout(function (){
                            clearHTML();
                        }, 2000);
                        
                    }
                    
                }
            },
            // error: function(xhr, status, error) {
            //     console.log('Error: ' + error);
            // }
        });
    }


    // Function to populate HTML
    function populateHTML(imageSrc, introText, titleText, subtitleText, url) {
        $('.media-item').attr('href', url);
        $('.artwork img').attr('src', imageSrc);
        $('.intro').text(introText);
        $('.title').text(titleText);
        $('.subtitle').text(subtitleText);
        $('.media-item').fillColor();
    }

    function clearHTML(){
        $('.media-item').attr('href', '');
        $('.artwork img').attr('src', '');
        $('.intro').text('');
        $('.title').text('');
        $('.subtitle').text('');
    }


    // Initally load the data
    setTimeout(function (){
        fetchLastfmData();
    }, 2500);
    
    // Check for new data
    setInterval(function() {
        fetchLastfmData();
    }, 15000);


});