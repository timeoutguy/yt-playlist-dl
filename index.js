const readline = require('readline')
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { EventEmitter } = require('stream');

ffmpeg.setFfmpegPath(ffmpegPath);


if(!process.argv[2]){
    console.log(new Error("O link da playlist deve ser passado como argumento."));
}

if(!process.argv[3]){
    console.log(new Error("Bitrate precisa ser passado como argumento. ex: 128"));
}

const playlistLink = String(process.argv[2]);
const bitrate = String(process.argv[3]);
const eventEmitter = new EventEmitter()
let i = 0

eventEmitter.on('musicdownload', async () => {
    let playlist = await ytpl(playlistLink);

    let musicToDownload = playlist.items[i].url;
    let nameMusic = playlist.items[i].title;

    let stream = await ytdl(musicToDownload);

    ffmpeg(stream)
        .audioBitrate(bitrate)
        .save(`musics/${nameMusic.replace(/[^\w\s]/gi, '')}.mp3`)
        .on('progress', (p) => {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`${p.targetSize}kb downloaded`);
        })
        .on('end', () => {
            console.log(`\nDownloaded ${nameMusic}`)
            eventEmitter.emit('musicdownload')
            i++
        })

})

eventEmitter.emit('musicdownload')




// https://www.youtube.com/playlist?list=PLYvawJGu1FppWG4JV-VcqP1g0RSLV3UDl