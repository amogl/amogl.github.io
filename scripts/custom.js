

//-----Last fm
$(document).ready(function(){

    // Function to fetch and update track data
    function updateTrackData() {
        $.ajax({
            url: 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=amogl&api_key=13b29c7c9664ac4eb57a61b39713ee80&format=json&limit=1',
            dataType: 'json',
            success: function(data) {
                //console.log(data); // Debugging statement to see the structure of the response

                // Check if the 'track' array exists and is not empty
                if (data.recenttracks && data.recenttracks.track && data.recenttracks.track.length > 0) {
                    var track = data.recenttracks.track[0];

                    // Check if the track is currently playing
                    if (track["@attr"] && track["@attr"].nowplaying === "true") {
                        var artist = track.artist['#text'];
                        var trackName = track.name;
                        var imageUrl = track.image.find(function(image) {
                            return image.size === 'large';
                        })['#text'];

                        // Populating HTML elements
                        $('.media-item-lastfm img').attr('src', imageUrl);
                        $('.media-item-lastfm .title').text(trackName);
                        $('.media-item-lastfm .subtitle').text(artist);
                        $('.media-item-lastfm .intro').text("I'm currently listening to");

                        $('.media').addClass("playing");
                        $('.media').removeClass("stopped");

                        $('.media-item-lastfm').fillColor();
                        //changeTextColor();

                    } else {
                        // Clear HTML elements if no track is currently playing

                        $('.media').addClass("stopped");

                        setTimeout(function (){
                            $('.media-item-lastfm img').attr('src', '');
                            $('.media-item-lastfm .title').text('');
                            $('.media-item-lastfm .subtitle').text('');
                            $('.media-item-lastfm .intro').text('');
                        }, 2000);

                        console.log("No track is currently playing.");
                    }
                } else {
                    console.log("No track data found in the response.");
                }
            },
            error: function(xhr, status, error) {
                //console.log("Error:", error); // Debugging statement to see any error message
            }
        });
    }


    // Initial call to update track data
    setTimeout(function (){
        updateTrackData();
    }, 2000);
    

    // Set interval to update track data every 30 seconds
    setInterval(updateTrackData, 30000); // 30 seconds
});