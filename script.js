"use strict";

// Music Information"s Elements
const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const like = document.getElementById("like");

// Time and Progress Elements
const currentTimeElement = document.getElementById("current-time");
const durationElement = document.getElementById("duration");
const visualizerContainerElement = document.getElementById("visualizer-container");
const progressElement = document.getElementById("progress");
const visualizerElements = document.getElementsByTagName("ellipse");

// Controller Elements
const nextButton = document.getElementById("next");
const previousButton = document.getElementById("previous");
const playButton = document.getElementById("play");
const shuffleButton = document.getElementById("shuffle");
const repeatButton = document.getElementById("repeat");
const repeatOnceElement = document.getElementById("repeat-once");
const dialogElement = document.getElementById("dialog");
const bigCover = document.getElementById("big-cover");

// Events
window.addEventListener("load", loadPage);
like.addEventListener("click", changeMusicLikedStatus);
nextButton.addEventListener("click", goNextMusic);
previousButton.addEventListener("click", goPreviousMusic);
progressElement.addEventListener("click", changeMusicProgress);
repeatButton.addEventListener("click", changeRepeatMode);
shuffleButton.addEventListener("click", changeShuffleMode);
audio.addEventListener("ended", handleMusicEnded)
audio.addEventListener("timeupdate", handleMusicTimeUpdate);
audio.addEventListener("loadedmetadata", handleMusicLoadedMetadata);
currentTimeElement.addEventListener("click", changeTimingShowState);
dialogElement.addEventListener("click", handleShowHideCoverDialog);
cover.addEventListener("click", handleShowHideCoverDialog);
playButton.addEventListener("click", () => playState ? pauseMusic() : playMusic());


// Musics Data
const musicsData = [
    {
        title: "Ghazi",
        artist: "Shadmehr Aghili",
        isLiked: false,
        audioSource: "./audios/1.mp3",
        coverSource: "./covers/1.jpg",
    },
    {
        title: "Cheshme To",
        artist: "Mehdi Yarahi",
        isLiked: false,
        audioSource: "./audios/2.mp3",
        coverSource: "./covers/2.jpg",
    },
    {
        title: "Har Rooz Paeize",
        artist: "Mohsen Chavoshi",
        isLiked: false,
        audioSource: "./audios/3.mp3",
        coverSource: "./covers/3.jpg",
    },
    {
        title: "Nescafe",
        artist: "Rastaak Hallaj",
        isLiked: false,
        audioSource: "./audios/4.mp3",
        coverSource: "./covers/4.jpg",
    },
    {
        title: "Pepperoni",
        artist: "Bomrani Band",
        isLiked: false,
        audioSource: "./audios/5.mp3",
        coverSource: "./covers/5.jpg",
    }
];

// Global Variables
let playState = false;
let shuffleState = false;
let repeatState = "OFF";
let currentIndex = 0;
let shuffleIndexes = [];
let isTimeModeReverse = false;
let lastProgressPercentage = 0;


async function loadMusic() {
    const currentMusicData = shuffleState ? musicsData[shuffleIndexes[currentIndex]] : musicsData[currentIndex];
    
    if (currentMusicData.isLiked) {
        like.setAttribute("src", "./images/like.svg");
        like.setAttribute("title", "Dislike");
    }
    else {
        like.setAttribute("src", "./images/dislike.svg");
        like.setAttribute("title", "Like");
    }
    title.textContent = currentMusicData.title;
    artist.textContent = currentMusicData.artist;
    audio.setAttribute("src", currentMusicData.audioSource);
    cover.setAttribute("src", currentMusicData.coverSource);
    bigCover.setAttribute("src", currentMusicData.coverSource);
    visualizerContainerElement.innerHTML = "";
    const wave = await getAudioWave(currentMusicData.audioSource);
    visualizerContainerElement.innerHTML = wave;

    for (const visualizerElement of visualizerElements) {
        visualizerElement.style.stroke = "#ffffff";
    }

    if (playState === true) {
        audio.play();
    }
}

function changeTimingShowState() {
    isTimeModeReverse = !isTimeModeReverse;
    handleMusicTimeUpdate();
}

function handleShowHideCoverDialog() {
    dialogElement.hidden = !dialogElement.hidden;
}

function handleMusicLoadedMetadata() {
    const durationTime = Math.floor(audio.duration);
    const durationMinutes = Math.floor(durationTime / 60);
    const durationSeconds = durationTime % 60;
    durationElement.textContent = `${durationMinutes}:${durationSeconds}`;

    isTimeModeReverse ?
        currentTimeElement.textContent = `-${durationMinutes}:${durationSeconds}`
        : currentTimeElement.textContent = "0:00";
}

function changeShuffleMode() {
    shuffleState = shuffleState ? false : true;
    shuffleButton.setAttribute("title", shuffleState ? "Shuffle Off" : "Shuffle On");
    shuffleButton.parentElement.style.filter = shuffleState ?
        "invert(17%) sepia(0%) saturate(1937%) hue-rotate(137deg) brightness(97%) contrast(94%)"
        : "invert(48%) sepia(5%) saturate(11%) hue-rotate(343deg) brightness(93%) contrast(85%)";

    if (shuffleState) {
        shuffleIndexes = [currentIndex];
        currentIndex = 0;
        while (shuffleIndexes.length < musicsData.length) {
            const randomIndex = Math.floor(Math.random() * musicsData.length);
            if (!shuffleIndexes.includes(randomIndex)) {
                shuffleIndexes.push(randomIndex);
            }
        }
    }
    else {
        currentIndex = shuffleIndexes[currentIndex];
    }
}

function changeRepeatMode() {
    if (repeatState === "OFF") {
        repeatState = "SINGLE";
        repeatButton.parentElement.style.filter = "invert(17%) sepia(0%) saturate(1937%) hue-rotate(137deg) brightness(97%) contrast(94%)";
        repeatButton.classList.remove("fas", "fa-repeat-alt");
        repeatOnceElement.style.display = "block";
        repeatButton.setAttribute("title", "Repeat Playlist");
    }
    else if (repeatState === "SINGLE") {
        repeatState = "ALL";
        repeatButton.parentElement.style.filter = "invert(17%) sepia(0%) saturate(1937%) hue-rotate(137deg) brightness(97%) contrast(94%)";
        repeatOnceElement.style.display = "none";
        repeatButton.classList.add("fas", "fa-repeat-alt");
        repeatButton.setAttribute("title", "Repeat Off");
    }
    else if (repeatState === "ALL") {
        repeatState = "OFF";
        repeatButton.parentElement.style.filter = "invert(48%) sepia(5%) saturate(11%) hue-rotate(343deg) brightness(93%) contrast(85%)";
        repeatButton.setAttribute("title", "Repeat This Tracks");
    }
}

function playMusic() {
    playState = true;
    playButton.setAttribute("src", "./images/pause.svg");
    playButton.setAttribute("title", "Pause");
    audio.play();
}

function pauseMusic() {
    playState = false;
    playButton.setAttribute("src", "./images/play.svg");
    playButton.setAttribute("title", "Play");
    audio.pause();
}

function changeMusicLikedStatus() {
    let likeState = null;
    if (shuffleState) {
        musicsData[shuffleIndexes[currentIndex]].isLiked = !musicsData[shuffleIndexes[currentIndex]].isLiked;
        likeState = musicsData[shuffleIndexes[currentIndex]].isLiked;
    }
    else {
        musicsData[currentIndex].isLiked = !musicsData[currentIndex].isLiked;
        likeState = musicsData[currentIndex].isLiked;
    }

    like.setAttribute("title", likeState ? "Dislike" : "Like");

    like.setAttribute("src", likeState ? "./images/like.svg" : "./images/dislike.svg");

    const likedMusics = JSON.stringify(musicsData.map(({title, artist, isLiked}) => (
        {title, artist, isLiked}
    )));

    localStorage.setItem("musics", likedMusics);
}

function goPreviousMusic() {
    currentIndex--;
    if (currentIndex === -1) {
        currentIndex = musicsData.length - 1;
    }
    loadMusic();
}

function goNextMusic() {
    currentIndex++;
    if (currentIndex === musicsData.length) {
        currentIndex = 0;
    }
    loadMusic();
}

function handleMusicEnded() {
    if (repeatState === "OFF") {
        pauseMusic();
        goNextMusic();
    }
    else if (repeatState === "SINGLE") {
        audio.currentTime = "0";
        audio.play();
    }
    else if (repeatState === "ALL") {
        goNextMusic();
    }
}

function handleMusicTimeUpdate() {
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const currentAndDurationDiff = duration - currentTime;

    const minutes = Math.floor((isTimeModeReverse ? currentAndDurationDiff : currentTime) / 60);
    const seconds = Math.floor((isTimeModeReverse ? currentAndDurationDiff : currentTime) % 60).toString().padStart(2, "0");
    const showingTime = `${minutes}:${seconds}`;
    currentTimeElement.textContent = isTimeModeReverse ? `-${showingTime}` :`${showingTime}`;

    const progressPercent = Math.round(currentTime / duration * 100);

    if (progressPercent != lastProgressPercentage) {
        changeProgress(progressPercent);
    }
}

function changeMusicProgress(event) {
    const width = this.clientWidth;
    const horizontalMousePosition = event.offsetX;
    const durationTime = audio.duration;
    const newCurrentTime = horizontalMousePosition / width * durationTime;
    audio.currentTime = newCurrentTime;

    changeProgress(Math.round(newCurrentTime / durationTime * 100));
}

function loadPage() {
    playButton.setAttribute("title", "Play");
    shuffleButton.setAttribute("title", "Shuffle On");
    repeatButton.setAttribute("title", "Repeat This Track");
    dialogElement.hidden = true;
    if (localStorage.getItem("musics")) {
        const likedMusicsData = JSON.parse(localStorage.getItem("musics"));
        for (const musicData of musicsData) {
            musicData.isLiked = likedMusicsData.find(item => (
                item.title === musicData.title && item.artist === musicData.artist
            )).isLiked;
        }
    }
    loadMusic();
}

function changeProgress(progressPercent) {
    for (const visualizerElement of visualizerElements) {
        parseInt(visualizerElement.id.split("_")[1]) <= progressPercent
            ? visualizerElement.style.stroke = "#ffcc00"
            : visualizerElement.style.stroke = "#ffffff";
    }

    lastProgressPercentage = progressPercent;
}



async function getAudioBuffer(audioSource) {
    const audioContext = new AudioContext();
    const response = await fetch(audioSource);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    return audioBuffer;
} 

function filterAudioBuffer(audioBuffer) {
    const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
    const samples = 100; // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i; // the location of the first sample in the block
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the samples in the block
      }
      filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }

    return filteredData;
}

function normalizeAudioBuffer(filteredData) {
    const multiplier = Math.pow(Math.max(...filteredData), -1);

    return filteredData.map(n => Math.round(n * multiplier * 100).toFixed(2) / 100);
}

function createAudioWaveSVG(audioBuffers) {
    let waveVisualizerSVG = "";

    for (let index = 1; index <= audioBuffers.length; ++index) {
        const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        ellipse.setAttributeNS(null, "rx", "1");
        ellipse.setAttributeNS(null, "cy", "200");
        ellipse.setAttributeNS(null, "stroke-width", "10");
        ellipse.setAttributeNS(null, "stroke", "#ffffff");
        ellipse.setAttributeNS(null, "id", `svg_${index.toString().padStart(3, "0")}`);
        ellipse.setAttributeNS(null, "cx", index * 20 - 10);
        ellipse.setAttributeNS(null, "ry", Math.floor(audioBuffers[index - 1] * 160) + 3);
        waveVisualizerSVG += ellipse.outerHTML + "\n";
    }
    return waveVisualizerSVG;
}

async function getAudioWave(audioSorce) {
    try {
        const audioBuffer = await getAudioBuffer(audioSorce);
        const filteredAudioBuffer = filterAudioBuffer(audioBuffer) ;
        const normalizedAudioBuffer = normalizeAudioBuffer(filteredAudioBuffer);
        const audioWaveSVG = createAudioWaveSVG(normalizedAudioBuffer);

        return audioWaveSVG;
    }
    catch (error) {
        console.log(error);
    }
}