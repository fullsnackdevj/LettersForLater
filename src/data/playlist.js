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
  },
  {
    id: 'cant-help-falling-in-love',
    title: "Can't Help Falling In Love",
    artist: 'Dave Fenley (Elvis Presley Cover)',
    src: "/songs/Dave Fenley - Can't Help Falling In Love by Elvis Presley (Cover) - Dave Fenley (128k).mp3"
  },
  {
    id: 'i-will-always-love-you',
    title: 'I Will Always Love You',
    artist: 'Dave Fenley (Dolly Parton Cover)',
    src: '/songs/Dave Fenley - I Will Always Love You by Dolly Parton (Cover) - Dave Fenley (128k).mp3'
  },
  {
    id: 'nothings-gonna-change-my-love',
    title: "Nothing's Gonna Change My Love For You",
    artist: 'Harold Lumandaz (George Benson Cover)',
    src: "/songs/Nothing's Gonna Change My Love For - George Benson  Harold Lumandaz (Acoustic Cover).mp3"
  },
  {
    id: 'ordinary-song',
    title: 'Ordinary Song',
    artist: 'Marc Velasco (Neyosi Acoustic Cover)',
    src: '/songs/Ordinary Song - Marc Velasco (Acoustic Cover _ Neyosi) [iUcCGQB055M].mp3'
  }
];
