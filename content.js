let snippets = {};

chrome.storage.local.get(['snippets'], (result) => {
  snippets = result.snippets || {};
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.snippets) {
    snippets = changes.snippets.newValue;
  }
});

function handleRichText(target) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const node = range.endContainer;
  const offset = range.endOffset;

  // Only look at text nodes to avoid breaking HTML structures
  if (node.nodeType === Node.TEXT_NODE) {
    const textSoFar = node.textContent.substring(0, offset);
    
    // Check if the typed text ends with any trigger
    for (const [trigger, content] of Object.entries(snippets)) {
      if (textSoFar.endsWith(trigger)) {
        replaceRichTextContent(node, range, trigger, content);
        break; 
      }
    }
  }
}

function replaceRichTextContent(node, range, trigger, replacement) {
  // 1. Remove the trigger text
  const endOffset = range.endOffset;
  const startOffset = endOffset - trigger.length;
  range.setStart(node, startOffset);
  range.setEnd(node, endOffset);
  range.deleteContents();

  // 2. Handle Smart Cursor (|)
  let finalContent = replacement;
  let cursorOffset = -1;
  const cursorMarker = "|";
  
  if (replacement.includes(cursorMarker)) {
    const parts = replacement.split(cursorMarker);
    // Calc plain text length for cursor position
    cursorOffset = parts[0].replace(/<[^>]*>/g, "").length;
    finalContent = parts.join(""); 
  }

  // 3. Insert the new HTML safely using a temporary marker
  if (cursorOffset >= 0) {
    const spanId = "quack-cursor-marker";
    const tempHtml = finalContent.substring(0, cursorOffset) + 
                     `<span id="${spanId}"></span>` + 
                     finalContent.substring(cursorOffset);
                     
    document.execCommand('insertHTML', false, tempHtml);
    
    // Find marker, place cursor, remove marker
    const marker = document.getElementById(spanId);
    if (marker) {
      const newRange = document.createRange();
      newRange.setStart(marker, 0);
      newRange.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(newRange);
      marker.remove();
    }
  } else {
    document.execCommand('insertHTML', false, finalContent);
  }
}

// Universal Input Listener
document.addEventListener('input', handleInput, true);

function handleInput(event) {
  const target = event.target;
  
  // CASE A: Rich Text Editors (Outlook, Gmail, Word Online)
  if (target.isContentEditable) {
    handleRichText(target);
  } 
  // CASE B: Standard Inputs (Search bars, Forms)
  else if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
    handlePlainText(target);
  }
}

function handlePlainText(target) {
  const text = target.value;
  const cursorPosition = target.selectionEnd;
  const textBeforeCursor = text.substring(0, cursorPosition);

  for (const [trigger, content] of Object.entries(snippets)) {
    if (textBeforeCursor.endsWith(trigger)) {
      // Strip HTML tags for plain text fields
      let plainReplacement = content.replace(/<[^>]*>/g, "");
      
      // Handle Smart Cursor (|)
      const cursorMarker = "|";
      let finalCursorPos = plainReplacement.length;
      
      if (plainReplacement.includes(cursorMarker)) {
        const markerIndex = plainReplacement.indexOf(cursorMarker);
        plainReplacement = plainReplacement.replace(cursorMarker, "");
        finalCursorPos = markerIndex;
      }

      // Calculate replacement
      const beforeTrigger = textBeforeCursor.slice(0, -trigger.length);
      const afterCursor = text.substring(cursorPosition);
      
      // Update value and cursor
      target.value = beforeTrigger + plainReplacement + afterCursor;
      const newPos = beforeTrigger.length + finalCursorPos;
      target.setSelectionRange(newPos, newPos);
      
      break;
    }
  }
}