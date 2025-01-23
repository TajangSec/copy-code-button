/* global clipboard */
/* eslint-disable no-console */
/* Original Author：dannyguo */
/* Modifier：Tajang */

function addCopyButtons(clipboard) {
    document.querySelectorAll("pre > code").forEach(function (codeBlock) {
        var button = document.createElement("button");
        button.className = "copy-code-button";
        button.type = "button";
        button.innerText = "Copy";

        button.addEventListener("click", function () {

           // 获取代码块的所有子节点
           const children = codeBlock.childNodes;
           let codeText = "";

           // 遍历子节点，过滤掉行号
           children.forEach(function (node) {
               if (node.nodeType === Node.TEXT_NODE) {
                   // 如果是文本节点，直接添加
                   codeText += node.textContent;
               } else {
                   // 如果是元素节点(其实是SPAN)，那就取他子节点中span的值，由于子节点span是第二个，所以索引为1
                   codeText += node.childNodes[1].textContent;
               }
           });

            clipboard.writeText(codeText).then(
                function () {
                    /* Chrome doesn't seem to blur automatically, leaving the button
                       in a focused state */
                    button.blur();

                    button.innerText = "Copied!";
                    setTimeout(function () {
                        button.innerText = "Copy";
                    }, 2000);
                },
                function (error) {
                    button.innerText = "Error";
                    console.error(error);
                }
            );
        });

        var pre = codeBlock.parentNode;
        if (pre.parentNode.classList.contains("highlight")) {
            var highlight = pre.parentNode;
            highlight.parentNode.insertBefore(button, highlight);
        } else {
            pre.parentNode.insertBefore(button, pre);
        }
    });
}

if (navigator && navigator.clipboard) {
    addCopyButtons(navigator.clipboard);
} else {
    var script = document.createElement("script");
    script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/clipboard-polyfill/2.7.0/clipboard-polyfill.promise.js";
    script.integrity = "sha256-waClS2re9NUbXRsryKoof+F9qc1gjjIhc2eT7ZbIv94=";
    script.crossOrigin = "anonymous";

    script.onload = function () {
        addCopyButtons(clipboard);
    };

    document.body.appendChild(script);
}