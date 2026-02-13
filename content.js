let snippets = {};

chrome.storage.local.get(['snippets'], (result) => {
  snippets = result.snippets || {};
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.snippets) {
    snippets = changes.snippets.newValue;
  }
});

function replaceInContentEditable(trigger, replacement) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const node = range.startContainer;

    if (node.nodeType === Node.TEXT_NODE && node.textContent.endsWith(trigger)) {
        const cursorMarker = "|";
        let finalText = replacement;
        let movesBack = 0;

        if (replacement.includes(cursorMarker)) {
            const markerIndex = replacement.indexOf(cursorMarker);
            finalText = replacement.replace(cursorMarker, "");
            movesBack = finalText.replace(/<[^>]*>/g, "").length - markerIndex;
        }

        const rangeToReplace = document.createRange();
        rangeToReplace.setStart(node, node.textContent.length - trigger.length);
        rangeToReplace.setEnd(node, node.textContent.length);
        
        selection.removeAllRanges();
        selection.addRange(rangeToReplace);
        
        document.execCommand('insertHTML', false, finalText);
        
        if (movesBack > 0) {
            for (let i = 0; i < movesBack; i++) {
                selection.modify("move", "backward", "character");
            }
        }
    }
}

document.addEventListener('input', (event) => {
    const target = event.target;
    if (target.isContentEditable) {
        Object.keys(snippets).forEach(trigger => {
            replaceInContentEditable(trigger, snippets[trigger]);
        });
    }
});