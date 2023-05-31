// ==UserScript==
// @name         Piped Buffering Crap Permafix
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       sibi361
// @match        https://piped.video/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=piped.video
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const INITIAL_WAIT_TIME = 3; // seconds;
    const CHECK_DELAY = 500;
    const BUFFERING_WAIT_FOR_LOAD_FOR = 10; // seconds;
    const FAIL_COUNT_VALIDITY_THRESHOLD = 2;

    let max_fail_count = (BUFFERING_WAIT_FOR_LOAD_FOR * 1000) / CHECK_DELAY;
    let init_wait = INITIAL_WAIT_TIME * 1000;
    let mostRecentBuffer = 0;

    function readLs(key) {
        const localStorageTemp = localStorage.getItem(key);
        // using JSON ensures false is read/write as Boolean false and not as "false"
        if (localStorageTemp !== null) return JSON.parse(localStorageTemp);
        else return false;
    }

    function writeLs(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function eraseLs(key) {
        delete localStorage[key];
    }

    function cleanStateIfDifferentVideo() {
        // make sure that the cookies were set for the video that's currently playing
        const prevVideo = readLs("BufferFixer-videoCode");
        let currentVideo;
        window.location.search.split("&").forEach((code) => {
            if (code.includes("v=")) currentVideo = code;
        });
        if (prevVideo != currentVideo && currentVideo !== null) {
            eraseLs("BufferFixer-brokenTimestamp");
            eraseLs("BufferFixer-failCount");
            console.log(
                "### BufferFixer: Old video localStorage values cleared"
            );

            writeLs("BufferFixer-videoCode", currentVideo);
            return false;
        }
        return true;
    }

    function isBuffering() {
        const videoEle = document.querySelector("video");
        const timeCur = videoEle.currentTime;
        try {
            const loadedTill = videoEle.buffered.end(0);
            const aheadBy = loadedTill - timeCur;
            if (aheadBy < 1) return timeCur;
            return false;
        } catch (e) {
            // const loadedTill = videoEle.buffered.end(0);
            // errors out when fetch request goes to server
            // for about 3 seconds
            return timeCur;
        }
    }

    function runner() {
        const wasBufferingTimestamp = readLs("BufferFixer-brokenTimestamp");
        if (wasBufferingTimestamp) {
            console.log(
                `### BufferFixer: Recovering from recent failure, video time: ${wasBufferingTimestamp}`
            );
            const videoEle = document.querySelector("video");
            try {
                videoEle.currentTime = wasBufferingTimestamp;
                videoEle.play();
                eraseLs("BufferFixer-brokenTimestamp");
                console.log("### BufferFixer: Recovery done");
            } catch (DOMException) {
                console.log("### BufferFixer: DOM not loaded");
                window.location.reload();
            }
            return false;
        }

        const status = isBuffering();
        if (status) {
            let failCount;
            let fcDelta = status - mostRecentBuffer;

            // if x amount of time passed after last buffer, reset failCount
            if (fcDelta > FAIL_COUNT_VALIDITY_THRESHOLD) failCount = 0;
            else failCount = Number(readLs("BufferFixer-failCount"));

            mostRecentBuffer = status;
            if (failCount > max_fail_count) {
                console.log(
                    "### BufferFixer: Refreshing webpage due to prolonged buffering"
                );
                writeLs("BufferFixer-brokenTimestamp", status);
                eraseLs("BufferFixer-failCount");
                window.location.reload();
            } else {
                if (failCount !== null) {
                    failCount += 1;
                    console.log(`### BufferFixer: Fail count: ${failCount}`);
                } else {
                    console.log("### BufferFixer: Detected buffering");
                    failCount = 0;
                }
                writeLs("BufferFixer-failCount", failCount);
            }
        }
    }

    function main() {
        try {
            // checking if player has loaded
            if (document.querySelector(".shaka-current-time") == null)
                throw new Error("DOMnotLoaded");
            console.log("### BufferFixer: Running");
            cleanStateIfDifferentVideo();
            setInterval(runner, CHECK_DELAY);
        } catch (e) {
            if (e.toString().replace("Error: ", "") === "DOMnotLoaded") {
                console.log("### BufferFixer: DOM not loaded yet, waiting...");
                delay(init_wait).then(() => main());
            } else {
                throw e;
            }
        }
    }

    function delay(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    delay(init_wait).then(() => main());
})();
