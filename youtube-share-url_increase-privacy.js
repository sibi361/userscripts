// ==UserScript==
// @name         Youtube Share Link Remove si
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Removes the "si" tracking parameter if it is present in a youtube video's share URL
// @author       sibi361
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    setInterval(main, 100);

    function main() {
        try {
            const shareUrlInput = document.querySelector("#share-url");
            const val = shareUrlInput.value;

            const start_i = val.indexOf("si=");
            if (start_i == -1) return; // no code present

            // check for other params such as &t=10
            const end_i = val.slice(start_i).indexOf("&");

            if (end_i == -1) shareUrlInput.value = val.slice(0, start_i - 1);
            else {
                const firstSeparator = val.indexOf("&");

                shareUrlInput.value = `${val.slice(0, start_i)}${val.slice(
                    firstSeparator + 1
                )}`;
            }
        } catch (e) {
            if (!e.message.includes("shareUrlInput is null"))
                console.log(`ERROR: ${e}`);
        }
    }
})();

