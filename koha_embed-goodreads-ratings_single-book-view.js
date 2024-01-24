// ==UserScript==
// @name         Koha Goodreads Fetch Ratings Single Book View
// @namespace    http://tampermonkey.net/
// @version      2024-01-24
// @description  Fetch and display Goodreads rating for a book using a self-hosted Goodreads scraping API
// @description  Biblioreads: https://github.com/nesaku/BiblioReads
// @description  As Biblioreads is not configured to send CORS headers use the modified search API script:
// @description  koha_embed-goodreads-ratings_biblioreads-modified_search
// @author       sibi361
// @match        https://insert-you-college-koha-portal-base-url-here.edu/cgi-bin/koha/opac-search.pl*
// @grant        none
// ==/UserScript==

// CHANGE THIS
const BIBLIOREADS_CORS_ALLOWED_API_URL =
    "https://your-self-hosted-biblioreads-instance-url.vercel.app";

(function () {
    "use strict";

    (async function () {
        const titleText = document.querySelector(".title").textContent.trim();
        const authorText = document
            .querySelector(".resource_list")
            .firstChild.textContent.replaceAll(";", " ")
            .trim();

        await fetch(`${BIBLIOREADS_CORS_ALLOWED_API_URL}/api/search/books`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                queryURL: `https://www.goodreads.com/search?q=${titleText}%20${authorText}`,
            }),
            redirect: "follow",
        })
            .then((r) => r.json())
            .then((r) => {
                const rating = r?.result[0]?.rating
                    .trim()
                    .replace("avg rating —", "-");
                if (rating) {
                    const ele = document
                        .querySelector(".resource_list")
                        .firstChild.cloneNode(true);
                    ele.setAttribute(
                        "style",
                        "font-size:1.1rem;font-weight:normal;"
                    );
                    ele.textContent = ` ${rating}`;

                    document.querySelector(".resource_list").append(ele);
                }
            })
            .catch((err) => console.log(`api fetch ERROR: ${err}`));
    })();
})();
