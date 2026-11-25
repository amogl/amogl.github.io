$(document).ready(function() {
    var lastfmKey = '13b29c7c9664ac4eb57a61b39713ee80';
    var lastfmUsername = 'amogl';
    var lastfmApiUrl = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" + lastfmUsername + "&api_key=" + lastfmKey + "&format=json&limit=1";
    var traktKey = 'joR3XWhgpP38DhLjqDitVb9i0NXFEOCh0Op1ylAoEkU';
    var traktWatchingUrl = 'https://api.trakt.tv/users/amogl/watching';
    var tmdbKey = 'ff6121cd1177652d2ed772bf66933d02';
    var media = $('.media');
    var artwork = media.find('.artwork img, .bg img');
    var pollInterval = 5000;
    var requestTimeout = 8000;
    var traktRetryDelay = pollInterval;
    var traktRetryAt = 0;
    var lastPosterEndpoint;
    var lastPoster;

    async function fetchLastfmTrack() {
        try {
            var data = await $.ajax({
                url: lastfmApiUrl,
                dataType: 'json',
                timeout: requestTimeout
            });
            var track = data.recenttracks?.track?.[0];
            if (track?.['@attr']?.nowplaying === 'true') {
                return track;
            }
        } catch {
            // Trakt can still report playback when Last.fm is unavailable.
        }
    }

    async function fetchTraktPlayback() {
        if (Date.now() < traktRetryAt) {
            return;
        }

        try {
            var playback = await $.ajax({
                url: traktWatchingUrl,
                dataType: 'json',
                timeout: requestTimeout,
                headers: {
                    'trakt-api-version': '2',
                    'trakt-api-key': traktKey
                }
            });
            traktRetryDelay = pollInterval;
            traktRetryAt = 0;
            return playback;
        } catch (xhr) {
            traktRetryDelay = Math.min(traktRetryDelay * 2, 300000);
            var retryAfter = xhr.getResponseHeader?.('Retry-After');
            var retryAfterMs = /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now();
            traktRetryAt = Date.now() + Math.max(traktRetryDelay, retryAfterMs || 0);
            console.warn('Trakt playback request failed', xhr.status);
        }
    }

    function renderMedia(intro, title, subtitle, url, image) {
        media.find('.media-item').attr('href', url || null);
        artwork.attr('src', image || null).toggle(Boolean(image));
        media.find('.intro').text(intro);
        media.find('.title').text(title);
        media.find('.subtitle').text(subtitle ?? '');
        media.toggleClass('playing', Boolean(title)).toggleClass('stopped', !title);
    }

    async function updateArtwork(endpoint) {
        if (endpoint === lastPosterEndpoint) {
            return;
        }

        try {
            var data = await $.ajax({
                url: 'https://api.themoviedb.org/3/' + endpoint,
                dataType: 'json',
                timeout: requestTimeout,
                data: { api_key: tmdbKey }
            });
            var path = data.backdrop_path || data.poster_path;
            lastPoster = path ? 'https://image.tmdb.org/t/p/w300' + path : null;
            lastPosterEndpoint = endpoint;
            artwork.attr('src', lastPoster).toggle(Boolean(lastPoster));
        } catch {
            // The playback title and link remain available without artwork.
        }
    }

    async function refreshMedia() {
        try {
            var track = await fetchLastfmTrack();
            if (track) {
                renderMedia("I'm currently listening to", track.name, track.artist?.['#text'], track.url, track.image?.[3]?.['#text']);
                return;
            }

            var playback = await fetchTraktPlayback();
            var isEpisode = playback?.type === 'episode';
            var item = isEpisode ? playback.show : playback?.movie;
            if (!item?.title) {
                renderMedia('', '', '', null, null);
                return;
            }

            var episode = playback.episode;
            var subtitle = isEpisode && episode
                ? ['S' + episode.season + 'E' + episode.number, episode.title].filter(Boolean).join(' ')
                : item.year;
            var ids = item.ids;
            var slug = ids?.slug || ids?.trakt;
            var url = slug ? 'https://trakt.tv/' + (isEpisode ? 'shows/' : 'movies/') + encodeURIComponent(slug) : null;
            var endpoint = ids?.tmdb ? (isEpisode ? 'tv/' : 'movie/') + ids.tmdb : null;
            renderMedia("I'm currently watching", item.title, subtitle, url, endpoint === lastPosterEndpoint ? lastPoster : null);
            if (endpoint) {
                await updateArtwork(endpoint);
            }
        } finally {
            setTimeout(refreshMedia, pollInterval);
        }
    }

    setTimeout(refreshMedia, 2500);
});
