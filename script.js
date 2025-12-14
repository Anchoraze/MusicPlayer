console.log('Lets Write JS');

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentIndex = 0;

/* ------------------ Utils ------------------ */
function getOnlyName(path) {
    return path.split(/[/\\]/).pop();
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    seconds = Math.floor(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

/* ------------------ Load Songs ------------------ */
async function loadSongs(folder) {
    currFolder = folder;

    try {
        const res = await fetch('songs.json');
        const manifest = await res.json();

        songs = manifest[folder] || [];
        console.log('FOUND SONGS:', songs);

        currentIndex = 0;

        updatePlaylistUI();
        if(songs.length > 0) playMusic(songs[0]);

    } catch (err) {
        console.error("Failed to load songs:", err);
        songs = [];
        document.querySelector(".songList ul").innerHTML = "";
    }
}

/* ------------------ Update Playlist UI ------------------ */
function updatePlaylistUI() {
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        songUL.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg" />
            <div class="info">
                <div>${getOnlyName(song)}</div>
            </div>
            <div class="playnow">
                <div>Play Now</div>
                <img class="invert" src="img/play.svg" />
            </div>
        </li>`;
    }

    // Attach click events
    Array.from(songUL.getElementsByTagName("li")).forEach((li, i) => {
        li.addEventListener("click", () => {
            currentIndex = i;
            playMusic(songs[currentIndex]);
        });
    });
}

/* ------------------ Play Music ------------------ */
function playMusic(track, pause=false) {
    if(!track) return;
    currentSong.src = `songs/${currFolder}/${encodeURIComponent(track)}`;

    if(!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerText = getOnlyName(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

/* ------------------ Animate Circle ------------------ */
function animateCircle() {
    if (!currentSong.paused && !isNaN(currentSong.duration)) {
        const percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
    }
    requestAnimationFrame(animateCircle);
}

/* ------------------ Main ------------------ */
async function main() {

    // Attach folder cards
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (event) => {
            const folder = event.currentTarget.dataset.folder;
            await loadSongs(folder);
        });
    });

    // Play / Pause button
    play.addEventListener("click", () => {
        if(currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Next / Previous
    previous.addEventListener("click", () => {
        if(currentIndex > 0) {
            currentIndex--;
            playMusic(songs[currentIndex]);
        }
    });

    next.addEventListener("click", () => {
        if(currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex]);
        }
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width);
        currentSong.currentTime = currentSong.duration * percent;
        document.querySelector(".circle").style.left = (percent*100) + "%";
    });

    // Volume
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value)/100;
    });

    // Hamburger / close menu
    document.querySelector(".hamburger").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "-200%";
    });


    currentSong.addEventListener("timeupdate", () => {
    const current = formatTime(currentSong.currentTime);
    const duration = formatTime(currentSong.duration);
    document.querySelector(".songtime").innerText = `${current} / ${duration}`;

    // update the circle on seekbar
    if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
        const percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
    }
});


    requestAnimationFrame(animateCircle);
}

main();
