/**
 * LettersForLater Background Music Playlist
 * 
 * To add a new song:
 * 1. Place your .mp3 file into the `/public/songs/` folder (e.g. `/public/songs/SongName.mp3`)
 * 2. Add an entry to the DEFAULT_PLAYLIST array below:
 *    {
 *      id: 'unique-id',
 *      title: 'Song Title',
 *      artist: 'Artist Name',
 *      src: '/songs/YourFileName.mp3'
 *    }
 */

export const DEFAULT_PLAYLIST = [
  {
    id: 'tugon-wedding',
    title: 'Tugon (The Wedding Version)',
    artist: 'Project Romeo',
    src: '/songs/Tugon (The Wedding Version).mp3'
  },
  {
    id: 'ito-lamang',
    title: 'Ito Lamang',
    artist: 'Project Romeo',
    src: '/songs/Project_ Romeo - Ito Lamang (Lyrics).mp3'
  },
  {
    id: 'ikaw-at-ako',
    title: 'Ikaw at Ako',
    artist: 'Johnoy Danao',
    src: '/songs/Johnoy Danao - Ikaw at Ako (official music video).mp3'
  },
  {
    id: 'celeste',
    title: 'Celeste',
    artist: 'Tothapi',
    src: '/songs/Tothapi - Celeste (Official Lyric Video).mp3'
  }
];
