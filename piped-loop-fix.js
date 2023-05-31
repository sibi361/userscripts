// ==UserScript==
// @name         Piped Loop Fix
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

    const INIT_WAIT = 3000;
    const CHECK_DELAY = 500;
    const RESTART_AT_TIME_LEFT = 0.5;

    function readLs(key) {
        const localStorageTemp = localStorage.getItem(key);
        // using JSON ensures false is read/write as Boolean false and not as "false"
        if (localStorageTemp !== null) return JSON.parse(localStorageTemp);
        else return false;
    }

    function writeLs(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    let loopSwitch = false;
    function initLoopCheckbox() {
        const checkbox = document.querySelector("#chkAutoLoop");
        loopSwitch = readLs("loopFixer-loop");
        checkbox.checked = loopSwitch;

        checkbox.addEventListener("click", (event) => {
            writeLs("loopFixer-loop", event.target.checked);
            loopSwitch = event.target.checked;
        });
    }

    function isOver() {
        const videoEle = document.querySelector("video");
        try {
            const timeCur = videoEle.currentTime;
            const maxTime = videoEle.duration;
            const delta = maxTime - timeCur;
            if (delta < RESTART_AT_TIME_LEFT) return true;
            return false;
        } catch (e) {}
        return false;
    }

    function runner() {
        if (isOver() && loopSwitch) {
            const videoEle = document.querySelector("video");
            videoEle.currentTime = 0;
            videoEle.play();
        }
    }

    function main() {
        try {
            // checking if player has loaded
            if (document.querySelector(".shaka-current-time") == null)
                throw new Error("DOMnotLoaded");
            console.log("### Loop Fixer: Running");
            initLoopCheckbox();
            setInterval(runner, CHECK_DELAY);
        } catch (e) {
            if (e.toString().replace("Error: ", "") === "DOMnotLoaded") {
                console.log("### Loop Fixer: DOM not loaded yet, waiting...");
                delay(INIT_WAIT).then(() => main());
            } else {
                throw e;
            }
        }
    }

    function delay(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    delay(INIT_WAIT).then(() => main());
})();
