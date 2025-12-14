console.log('Lets Write JS');

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentIndex = 0;


function animateCircle() {
    if (!currentSong.paused && !isNaN(currentSong.duration)) {
        const percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
    }
    requestAnimationFrame(animateCircle);
}


function getOnlyName(path) {
    return path.split(/[/\\]/).pop();
}


/* ------------------ Utils ------------------ */

function sanitizeFileName(input) {
    if (!input) return null;

    // remove any folder path ( / or \ )
    const match = input.match(/([^\\/]+\.mp3)$/i);
    if (!match) return null;

    return decodeURIComponent(match[1]);
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";

    seconds = Math.floor(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/* ------------------ Fetch Songs ------------------ */

async function getSongs(folder) {
    currFolder = folder;

    const res = await fetch(`http://127.0.0.1:3000/${folder}/`);
    const html = await res.text();

    const div = document.createElement("div");
    div.innerHTML = html;

    const links = div.getElementsByTagName("a");
    const list = [];

    for (const a of links) {
        const raw = a.getAttribute("href");
        if (!raw || !raw.toLowerCase().endsWith(".mp3")) continue;

        const clean = sanitizeFileName(raw);
        if (clean) list.push(clean);
    }

    console.log("FOUND SONGS:", list);
    return list;
}

/* ------------------ Play Music ------------------ */

function playMusic(track, pause = false) {
    const cleanTrack = sanitizeFileName(track);
    if (!cleanTrack) return;

    // ❌ DON'T overwrite currentIndex here
    // currentIndex = songs.indexOf(cleanTrack);

    currentSong.src = `/${currFolder}/${encodeURIComponent(cleanTrack)}`;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerText = getOnlyName(cleanTrack);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}



/* ------------------ Main ------------------ */

async function main() {
    songs = await getSongs("songs/valo");

    if (songs.length === 0) return;

    playMusic(songs[0], true);

    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg" />
            <div class="info">
                <div>${getOnlyName(song)}</div>

                <div></div>
            </div>
            <div class="playnow">
                <div>Play Now</div>
                <img class="invert" src="img/play.svg" />
            </div>
        </li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach((li, i) => {
        li.addEventListener("click", () => {
            currentIndex = i;  // 🔥 IMPORTANT
            playMusic(songs[currentIndex]);
        });
    });


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    });
    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{

        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
       document.querySelector(".circle").style.left = percent + "%";

       currentSong.currentTime = (currentSong.duration * percent)/100;
        
    })

    //Add an event listener for Hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0";
    });

    //Add an event listener for close
    document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left = "-200%";
    console.log("clickedd");
    });


    previous.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            playMusic(songs[currentIndex]);
        }
    });

    next.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex]);
        }
    });


    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{

        currentSong.volume = parseInt(e.target.value)/100;


    })


    //Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (event) => {
            const folderName = event.currentTarget.dataset.folder;

            // fetch songs from this folder
            songs = await getSongs(`songs/${folderName}`);
            currFolder = `songs/${folderName}`; // make sure current folder is updated

            // reset currentIndex
            currentIndex = 0;

            // update the playlist UI
            const songUL = document.querySelector(".songList ul");
            songUL.innerHTML = ""; // clear old list

            for (const song of songs) {
                songUL.innerHTML += `
                <li>
                    <img class="invert" src="img/music.svg" />
                    <div class="info">
                        <div>${getOnlyName(song)}</div>
                        <div></div>
                    </div>
                    <div class="playnow">
                        <div>Play Now</div>
                        <img class="invert" src="img/play.svg" />
                    </div>
                </li>`;
            }

            // attach click listeners for the new songs
            Array.from(songUL.getElementsByTagName("li")).forEach((li, i) => {
                li.addEventListener("click", () => {
                    currentIndex = i;
                    playMusic(songs[currentIndex]);
                });
            });

            // automatically play the first song in the folder
            if (songs.length > 0) playMusic(songs[0]);
        });
    });










    requestAnimationFrame(animateCircle);





}

main();
