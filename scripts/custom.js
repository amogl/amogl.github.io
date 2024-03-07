$(document).ready(function() {
    var lastfmKey = '13b29c7c9664ac4eb57a61b39713ee80';
    var lastfmUsername = 'amogl';
    var lastfmApiUrl = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" + lastfmUsername + "&api_key=" + lastfmKey + "&format=json&limit=1";
    var traktKey = '0d0477ed0e9cf3fdca652206c98c2adf513ad01199daa9418b2b233a7cb84f15';
    var traktUsername = 'amogl';
    var traktApiUrl = 'https://api.trakt.tv/users/' + traktUsername + '/history?limit=1';
    // var traktApiUrl = '/test-trakt-data-movie.json';
    var traktUrl = "//trakt.tv/";
    var tmdbKey = 'ff6121cd1177652d2ed772bf66933d02';


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

                    if(timeDifference < 45 && itemAction == "checkin"){
                        var itemShowNumbers = "";
                        if (itemType === 'episode') {
                            itemName = lastWatchedItem.show.title;
                            itemUrl = traktUrl + 'shows/' + lastWatchedItem.show.ids.slug;
                            itemSubtitle = "S" + lastWatchedItem.episode.season + "E" + lastWatchedItem.episode.number + " " + lastWatchedItem.episode.title;
                            getPoster('show',lastWatchedItem.show.ids.tmdb); 

                        } else if (itemType === 'movie') {
                            itemName = lastWatchedItem.movie.title;
                            itemUrl = traktUrl + 'movies/' + lastWatchedItem.movie.ids.slug;
                            itemSubtitle = lastWatchedItem.movie.year;
                            getPoster('movie',lastWatchedItem.movie.ids.tmdb); 
                        }
                        $('.media').removeClass('stopped');
                        $('.media').addClass('playing');
                        populateHTML(null,'I\'m currently watching', itemName, itemSubtitle, itemUrl);
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


    // Populate HTML
    function populateHTML(itemImage, introText, titleText, subtitleText, url) {
        $('.media-item').attr('href', url);
        $('.artwork img').attr('src', itemImage);
        $('.intro').text(introText);
        $('.title').text(titleText);
        $('.subtitle').text(subtitleText);
        $('.media-item').fillColor();
    }

    // Clear html
    function clearHTML(){
        $('.media-item').attr('href', '');
        $('.artwork img').attr('src', '');
        $('.intro').text('');
        $('.title').text('');
        $('.subtitle').text('');
    }

    // Get poster from tmdb
    function getPoster(mediaType,showOrMovieId){
        var tmdbUrl = 'https://api.themoviedb.org/3/';
        var imageUrl = 'https://image.tmdb.org/t/p/w300';
    
        var endpoint = '';
        if(mediaType == "show"){
            endpoint = 'tv/' + showOrMovieId;
        }
        else{
            endpoint = 'movie/' + showOrMovieId;
        }
        
        $.ajax({
            url: tmdbUrl + endpoint,
            type: 'GET',
            data: {
                api_key: tmdbKey
            },
            success: function(data) {
                if (data.poster_path) {
                    var itemImage = imageUrl + data.backdrop_path;
                    $('.artwork img').attr('src', itemImage);
                }
            },
            error: function(err) {
                console.log('Error: ' + err.responseText);
            }
        });
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