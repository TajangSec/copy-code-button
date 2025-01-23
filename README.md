# copy-code-button
给Hugo代码块添加复制按钮

（en：Add a Copy Button to Hugo Code Blocks）

修改自 https://www.dannyguo.com/blog/how-to-add-copy-to-clipboard-buttons-to-code-blocks-in-hugo
他的代码非常完美，但是当我设置显示行号时，导致复制代码会把行号一起复制
原因是显示行号会增加子节点
我的修改增加了对html标签的判断，如果是文本节点就直接复制，如果不是文本节点就复制子元素中的值

（en：Modified from https://www.dannyguo.com/blog/how-to-add-copy-to-clipboard-buttons-to-code-blocks-in-hugo
His code is flawless, but when I enabled line numbers, copying the code also copied the line numbers along with it
The reason is that displaying line numbers will increase child nodes
My modification added a check for HTML tags; if it is a text node, it directly copies the content, and if it is not a text node, it copies the value from the child elements）

效果图Rendering：
![Clip_2025-01-23_22-18-12](https://github.com/user-attachments/assets/e83b8a02-7d31-424c-a1e6-65f4a96b26c3)


步骤 Step：
1、首先在资源文件夹里添加js文件
（en：First, add the js file to the resources folder）
```javascript
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
```
2、在single.html(或者其他调用代码块的页面)中引入js

（en：Introduce the js in single.html (or other pages that call the code block)）
```javascript
{{ if (findRE "<pre" .Content 1) }}
    {{ $js := resources.Get "js/copy-code-button.js" | minify | fingerprint }}
    <script defer src="{{ $js.RelPermalink }}" integrity="{{ $js.Data.Integrity }}" crossorigin="anonymous"></script>
{{ end }}
```
如果你的代码块上下方空隙很多，可以参考我的CSS和hugo.toml

（en：If there is a lot of space above and below your code block, you can refer to my CSS and hugo.toml.）
CSS:
```css
    code{
        line-height: 2rem;
        margin: 0;
        background-color: rgba(14, 210, 247, .05);
        word-wrap: break-word;
        // white-space: pre-wrap;
        overflow-x: auto;
        // padding: .1rem .3rem;
        border-radius: .3rem;
        color: #96c5ff !important;
        font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace !important;
    }
.highlight{
    // 取消代码块的边框
    td{
        border: none !important;
    }
    pre{
        /* Avoid pushing up the copy buttons. */
        //margin: 0;
        overflow-x: auto;
        font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace !important;
    }
}
// 设置代码块复制按钮样式
.copy-code-button {
    color: #272822;
    background-color: #FFF;
    border-color: #272822;
    border: 2px solid;
    border-radius: 3px 3px 0px 0px;

    /* right-align */
    display: block;
    margin-left: auto;
    margin-right: 0;

    margin-bottom: -2px;
    padding: 3px 8px;
    font-size: 0.8em;

    font-family: none;
    line-height: normal;
}

.copy-code-button:hover {
    cursor: pointer;
    background-color: #F2F2F2;
}

.copy-code-button:focus {
    /* Avoid an ugly focus outline on click in Chrome,
       but darken the button for accessibility.
       See https://stackoverflow.com/a/25298082/1481479 */
    background-color: #E6E6E6;
    outline: 0;
}

.copy-code-button:active {
    background-color: #D9D9D9;
}
```
Hugo.toml

```toml
[markup.highlight]
        anchorLineNos = true #将每个行号渲染为HTML锚元素
        codeFences = true
        guessSyntax = true
        lineAnchors = ""
        lineNoStart =1
        lineNos = true
        lineNumbersInTable = false
        noClasses = true
        style = "doom-one2"
        tabWidth = 4
```
