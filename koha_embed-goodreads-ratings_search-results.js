// ==UserScript==
// @name         Koha Goodreads Fetch Ratings Search Results
// @namespace    http://tampermonkey.net/
// @version      2024-01-24
// @description  Fetch and display Goodreads ratings for all search results using a self-hosted Goodreads
// @description  scraping API: Biblioreads: https://github.com/nesaku/BiblioReads
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
    document.querySelectorAll(".bibliocol").forEach(async (row) => {
        const title = row.querySelector(".title");

        const titleText = row.querySelector(".title").textContent.trim();
        const authorText = row
            .querySelector(".author.resource_list")
            .textContent.replaceAll(";", " ")
            .trim();

        await fetch(BIBLIOREADS_CORS_ALLOWED_API_URL, {
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
                    title.textContent += ` | ${rating}`;
                }
            })
            .catch((err) => console.log(`api fetch ERROR: ${err}`));
    });
})();
