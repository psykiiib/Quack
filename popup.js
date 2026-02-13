
const quackSound = new Audio('asset/quack.mp3');

const quill = new Quill('#editor-container', {
  theme: 'snow',
  modules: {
    toolbar: [['bold', 'italic'], ['image', 'link']]
  }
});

document.addEventListener('DOMContentLoaded', () => {
    quackSound.play().catch(error => {
        console.log("Audio waiting for user interaction:", error);
    });

    const bugBtn = document.getElementById('bug-btn');
    if (bugBtn) {
        bugBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://github.com/psykiiib/Quack/issues' });
        });
    }

    loadSnippets();
});

function sanitizeHTML(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const forbiddenTags = ['script', 'object', 'embed', 'iframe', 'frame'];
  forbiddenTags.forEach(tag => {
    const elements = tempDiv.getElementsByTagName(tag);
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].parentNode.removeChild(elements[i]);
    }
  });

  const allElements = tempDiv.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const attrs = allElements[i].attributes;
    for (let j = attrs.length - 1; j >= 0; j--) {
      if (attrs[j].name.startsWith('on')) {
        allElements[i].removeAttribute(attrs[j].name);
      }
    }
  }

  return tempDiv.innerHTML;
}

document.getElementById('save').addEventListener('click', () => {
  const trigger = document.getElementById('trigger').value;
  let replacement = quill.root.innerHTML;

  if (!trigger || replacement === '<p><br></p>') {
    alert("Oops! Add a trigger and some content first.");
    return;
  }

  replacement = sanitizeHTML(replacement);

  chrome.storage.local.get(['snippets'], (result) => {
    const snippets = result.snippets || {};
    snippets[trigger] = replacement;
    
    chrome.storage.local.set({ snippets }, () => {
      if (chrome.runtime.lastError) {
        alert("Save failed: The content might be too large.");
        console.error(chrome.runtime.lastError);
      } else {
        document.getElementById('trigger').value = '';
        quill.setContents([]);
        loadSnippets();
      }
    });
  });
});

function loadSnippets() {
  chrome.storage.local.get(['snippets'], (result) => {
    const list = document.getElementById('snippet-list');
    const emptyState = document.getElementById('empty-state');
    
    list.innerHTML = '';
    const snippets = result.snippets || {};
    const keys = Object.keys(snippets);

    if (keys.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    } else {
      if (emptyState) emptyState.style.display = 'none';
    }

    for (const [key, value] of Object.entries(snippets)) {
      const div = document.createElement('div');
      div.className = 'snippet-item';
      
      const plainText = value.replace(/<[^>]*>/g, '').substring(0, 35);
      
      div.innerHTML = `
        <div class="snippet-info">
          <span class="snippet-trigger">${key}</span>
          <span class="snippet-preview">${plainText}...</span>
        </div>
        <div class="delete-btn" data-key="${key}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </div>
      `;
      list.appendChild(div);
    }

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.currentTarget.closest('.snippet-item');
        const keyToDelete = e.currentTarget.getAttribute('data-key');
        
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
          delete snippets[keyToDelete];
          chrome.storage.local.set({ snippets }, loadSnippets);
        }, 200);
      });
    });
  });
}