// ==UserScript==
// @name        Stash Video JS CopySave Screenshot
// @namespace   https://github.com/elkorol/Stash-App-Script-Video-JS-CopySave
// @description Adds copy current scene screenshot to clipboard or save to disk
// @version     0.1.0
// @author      Echoman
// @match       http://localhost:9999/*
// @grant       GM_getResourceText
// @grant       GM_addStyle
// @grant       GM_setClipboard
// @grant       GM_download
// @include     *
// @require     https://raw.githubusercontent.com/elkorol/Stash-User-scripts/develop/src\StashUserscriptLibrary.js
// @run-at      document-idle
// ==/UserScript==

(function () {
  "use strict";
  const {
    stash,
    Stash,
    waitForElementId,
    waitForElementClass,
    waitForElementByXpath,
    getElementByXpath,
    getClosestAncestor,
    updateTextInput,
  } = unsafeWindow.stash;

  GM_addStyle(`
.vjs-copySave-menu {
  width: min-content;
  height: min-content;
}
#vjs-menu-text{
  user-select: none;
  text-transform: capitalize;
}
.vjs-copySave-button {
  display: flex;
  justify-content: center;
  text-transform: capitalize !important;
}
`);

  // https://www.svgrepo.com/svg/431258/screenshot
  // https://www.svgrepo.com/svg/471181/clipboard-download
  // https://www.svgrepo.com/svg/432286/save-down-2
  let svg_screenhot =
    '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"  width="2em" height="2em"><g fill="none"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01-.184-.092Z"/><path d="M17 5a2 2 0 0 1 1.995 1.85L19 7v10h2a1 1 0 0 1 .117 1.993L21 19h-2v2a1 1 0 0 1-1.993.117L17 21V7H9V5h8ZM6 2a1 1 0 0 1 .993.883L7 3v14h8v2H7a2 2 0 0 1-1.995-1.85L5 17V7H3a1 1 0 0 1-.117-1.993L3 5h2V3a1 1 0 0 1 1-1Z" fill="#fff"/></g></svg>';
  let svg_save =
    '<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" width="1em" height="1em"><style>.s0 { fill: #000000 } </style><filter id="f0"><feFlood flood-color="#ffffff" flood-opacity="1" /><feBlend mode="normal" in2="SourceGraphic"/><feComposite in2="SourceAlpha" operator="in" /></filter><g id="Save_Down_2" filter="url(#f0)"><g id="Layer"><path id="Layer" class="s0" d="m18.4 20.9h-12.8q-0.5 0.1-0.9-0.1-0.5-0.1-0.8-0.4-0.4-0.4-0.6-0.8-0.2-0.4-0.2-0.9v-11q0-0.4 0.2-0.9 0.2-0.4 0.6-0.7 0.3-0.3 0.8-0.4 0.4-0.2 0.9-0.2h0.4q0.2 0 0.4 0.2 0.1 0.1 0.1 0.3 0 0.2-0.1 0.4-0.2 0.1-0.4 0.1h-0.4q-0.3 0-0.6 0.1-0.2 0.1-0.4 0.2-0.2 0.2-0.4 0.4-0.1 0.3-0.1 0.5v11q0 0.3 0.1 0.5 0.2 0.3 0.4 0.4 0.2 0.2 0.4 0.3 0.3 0.1 0.6 0h12.8q0.3 0.1 0.6 0 0.2-0.1 0.4-0.3 0.2-0.1 0.4-0.4 0.1-0.2 0.1-0.5v-11q0-0.2-0.1-0.5-0.2-0.2-0.4-0.4-0.2-0.1-0.4-0.2-0.3-0.1-0.6-0.1h-0.4q-0.2 0-0.4-0.1-0.1-0.2-0.1-0.4 0-0.2 0.1-0.3 0.2-0.2 0.4-0.2h0.4q0.5 0 0.9 0.2 0.5 0.1 0.8 0.4 0.4 0.3 0.6 0.7 0.2 0.5 0.2 0.9v11q0 0.5-0.2 0.9-0.2 0.4-0.6 0.8-0.3 0.3-0.8 0.4-0.4 0.2-0.9 0.1z"/><path id="Layer" class="s0" d="m15.4 10.6l-3 3q-0.1 0-0.1 0.1-0.1 0-0.1 0-0.1 0-0.1 0 0 0-0.1 0 0 0-0.1 0 0 0-0.1 0 0 0-0.1 0 0-0.1-0.1-0.1l-3-3q-0.1-0.2-0.1-0.4 0-0.2 0.1-0.3 0.2-0.2 0.4-0.2 0.2 0 0.4 0.2l2.1 2.1v-8.4q0-0.1 0-0.2 0.1-0.1 0.1-0.2 0.1-0.1 0.2-0.1 0.1 0 0.2 0 0.1 0 0.2 0 0.1 0 0.1 0.1 0.1 0.1 0.2 0.2 0 0.1 0 0.2v8.4l2.1-2.1q0.2-0.2 0.4-0.2 0.2 0 0.4 0.2 0.1 0.1 0.1 0.3 0 0.2-0.1 0.4z"/></g></g></svg>';
  let svg_clipboard =
    '<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" width="1em" height="1em"><style>.s0 { fill: none;stroke: #ffffff;stroke-linecap: round;stroke-linejoin: round;stroke-width: 2 } </style><path id="Layer" class="s0" d="m16 4c0.9 0 1.4 0 1.8 0.1 1 0.3 1.8 1.1 2.1 2.1 0.1 0.4 0.1 0.9 0.1 1.8v9.2c0 1.7 0 2.5-0.3 3.2-0.3 0.5-0.8 1-1.3 1.3-0.7 0.3-1.5 0.3-3.2 0.3h-6.4c-1.7 0-2.5 0-3.2-0.3-0.5-0.3-1-0.8-1.3-1.3-0.3-0.7-0.3-1.5-0.3-3.2v-9.2c0-0.9 0-1.4 0.1-1.8 0.3-1 1.1-1.8 2.1-2.1 0.4-0.1 0.9-0.1 1.8-0.1m4 13l-3-3m3 3l3-3m-3-3v6m-3.5-11.1q-0.2-0.2-0.4-0.4c-0.1-0.3-0.1-0.5-0.1-1.1v-0.8c0-0.6 0-0.8 0.1-1.1q0.2-0.2 0.4-0.4c0.3-0.1 0.5-0.1 1.1-0.1h4.8c0.6 0 0.8 0 1.1 0.1q0.2 0.2 0.4 0.4c0.1 0.3 0.1 0.5 0.1 1.1v0.8c0 0.6 0 0.8-0.1 1.1q-0.2 0.2-0.4 0.4c-0.3 0.1-0.5 0.1-1.1 0.1h-4.8c-0.6 0-0.8 0-1.1-0.1z"/></svg>';
  let debounceTimeoutSaveVideoFrame;

  stash.addEventListener("page:scene", async function () {
    await waitForElementClass(
      "vjs-control-bar",
      async function (className, el) {
        if (!document.getElementById("vjs-copySave")) {
          const node = document.createElement("div");
          const control = document.querySelector(".vjs-control-bar");
          node.setAttribute("id", "vjs-copySaves");
          node.setAttribute(
            "class",
            "vjs-menu-button vjs-menu-button-popup vjs-control vjs-button"
          );
          const button = document.createElement("button");
          button.setAttribute(
            "class",
            "vjs-menu-button vjs-menu-button-popup vjs-button"
          );
          button.setAttribute("type", "button");
          button.setAttribute("aria-disabled", "false");
          button.setAttribute("aria-haspopup", "true");
          button.setAttribute("aria-expanded", "false");
          button.innerHTML = svg_screenhot;
          node.appendChild(button);
          // Create the options menu to save or copy the image
          let menu = document.createElement("div");
          menu.setAttribute("class", "vjs-menu vjs-copySave-menu");
          // Create the options menu to save or copy the image
          let menu_content = document.createElement("ul");
          menu_content.setAttribute("class", "vjs-menu-content");
          menu_content.setAttribute("role", "menu");
          let menu_text = document.createElement("li");
          menu_text.setAttribute("class", "vjs-copySave-button vjs-menu-item");
          menu_text.setAttribute("id", "vjs-menu-text");
          menu_text.innerHTML = "Screenshot";
          menu_text.setAttribute("role", "heading");
          // Create the save button
          let saveButton = document.createElement("li");
          saveButton.setAttribute("class", "vjs-copySave-button vjs-menu-item");
          saveButton.setAttribute("tabindex", "-1");
          saveButton.setAttribute("role", "menuitem");
          saveButton.setAttribute("aria-disabled", "false");
          saveButton.innerHTML = svg_save + " Save";
          let copyButton = document.createElement("li");
          copyButton.setAttribute("class", "vjs-copySave-button vjs-menu-item");
          copyButton.setAttribute("tabindex", "-1");
          copyButton.setAttribute("role", "menuitem");
          copyButton.setAttribute("aria-disabled", "false");
          copyButton.innerHTML = svg_clipboard + " Clipboard";
          control.appendChild(node);
          control.insertBefore(node, control.childNodes[14]);
          menu.appendChild(menu_content);
          menu_content.appendChild(menu_text);
          menu_content.appendChild(saveButton);
          menu_content.appendChild(copyButton);
          // Append the options menu to the body
          button.appendChild(menu);
          var copySave = function (event) {
            if (!node.classList.contains("vjs-hover")) {
              node.classList.add("vjs-hover");
            } else {
              node.classList.toggle("vjs-hover");
            }
            // Get all video elements on the page
            const videos = document.getElementsByTagName("video");
            // Check if there are any videos playing
            for (let i = 0; i < videos.length; i++) {
              if (!videos[i].paused || videos.length > 0) {
                // Get the canvas element to draw the current video frame
                const canvas = document.createElement("canvas");
                canvas.width = videos[i].videoWidth;
                canvas.height = videos[i].videoHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videos[i], 0, 0, canvas.width, canvas.height);
                function debouncedFunctionSaveVideoFrame() {
                  GM_download({
                    url: canvas.toDataURL(),
                    name: "video_frame.png",
                    saveAs: true,
                  });
                  node.classList.remove("vjs-hover");
                }
                saveButton.addEventListener("click", function () {
                  clearTimeout(debounceTimeoutSaveVideoFrame);
                  debounceTimeoutSaveVideoFrame = setTimeout(() => {
                    debouncedFunctionSaveVideoFrame();
                  }, 0);
                });
                // Create the copy button
                copyButton.addEventListener("click", function () {
                  setTimeout(function () {
                    var canvas = document.createElement("canvas");
                    var video = document.querySelector("video");
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas
                      .getContext("2d")
                      .drawImage(video, 0, 0, canvas.width, canvas.height);
                    if (navigator.clipboard) {
                      navigator.clipboard
                        .writeText(canvas.toDataURL("image/jpeg"))
                        .then(
                          function () {
                            console.log(
                              "Image copied to clipboard successfully"
                            );
                          },
                          function (error) {
                            console.error(
                              "Failed to copy image to clipboard: " + error
                            );
                          }
                        );
                    } else if (
                      document.queryCommandSupported &&
                      document.queryCommandSupported("copy")
                    ) {
                      var imageData = canvas.toDataURL("image/jpeg");
                      var tempInput = document.createElement("input");
                      tempInput.style =
                        "position: absolute; left: -1000px; top: -1000px";
                      tempInput.value = imageData;
                      document.body.appendChild(tempInput);
                      tempInput.select();
                      document.execCommand("copy");
                      document.body.removeChild(tempInput);
                      console.log("Image copied to clipboard successfully");
                      // Display success toast notification
                    } else {
                      console.error("Clipboard API not supported");
                      // Use GM_setClipboard as a last resort
                    }
                  }, 50);
                  node.classList.remove("vjs-hover");
                });
                break;
              }
            }
          };
          function copySaveRemove() {
            if (node.classList.contains("vjs-hover")) {
              node.classList.remove("vjs-hover");
            }
          }
          // Listen for clicks on the button
          button.addEventListener("click", copySave, false);
          button.addEventListener("mouseenter", copySave, false);
          button.addEventListener("mouseleave", copySaveRemove, false);
        }
      }
    );
  });
})();
