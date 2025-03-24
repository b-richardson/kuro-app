import { EditorView } from '@codemirror/view';

// Toggle bold formatting
export function toggleBold({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "**Bold text**" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already bold
      if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(2, selectedText.length - 2) 
        });
      } else {
        changes.push({ from, to, insert: `**${selectedText}**` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle italic formatting
export function toggleItalic({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "*Italic text*" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already italic
      if (selectedText.startsWith('*') && selectedText.endsWith('*')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(1, selectedText.length - 1) 
        });
      } else {
        changes.push({ from, to, insert: `*${selectedText}*` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle strikethrough
export function toggleStrikethrough({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "~~Strikethrough text~~" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already strikethrough
      if (selectedText.startsWith('~~') && selectedText.endsWith('~~')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(2, selectedText.length - 2) 
        });
      } else {
        changes.push({ from, to, insert: `~~${selectedText}~~` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle highlight
export function toggleHighlight({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "==Highlighted text==" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already highlighted
      if (selectedText.startsWith('==') && selectedText.endsWith('==')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(2, selectedText.length - 2) 
        });
      } else {
        changes.push({ from, to, insert: `==${selectedText}==` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle wiki link
export function toggleWikiLink({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "[[Link]]" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already a wiki link
      if (selectedText.startsWith('[[') && selectedText.endsWith(']]')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(2, selectedText.length - 2) 
        });
      } else {
        changes.push({ from, to, insert: `[[${selectedText}]]` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle external link
export function toggleExternalLink({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "[Link text](https://example.com)" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already an external link
      const linkMatch = selectedText.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        changes.push({ from, to, insert: linkMatch[1] });
      } else {
        changes.push({ from, to, insert: `[${selectedText}](https://example.com)` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle task list item
export function toggleTaskList({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    
    // Get the current line
    const line = state.doc.lineAt(from);
    const lineText = line.text;
    
    // Check if it's already a task list item
    if (lineText.trim().match(/^- \[[ xX]\]/)) {
      // Toggle task state
      if (lineText.includes('- [ ]')) {
        const newLine = lineText.replace('- [ ]', '- [x]');
        changes.push({
          from: line.from,
          to: line.to,
          insert: newLine
        });
      } else {
        const newLine = lineText.replace(/- \[[xX]\]/, '- [ ]');
        changes.push({
          from: line.from,
          to: line.to,
          insert: newLine
        });
      }
    } else if (lineText.trim().startsWith('- ')) {
      // Convert bullet to task
      const newLine = lineText.replace(/^(\s*)- /, '$1- [ ] ');
      changes.push({
        from: line.from,
        to: line.to,
        insert: newLine
      });
    } else {
      // Add new task
      changes.push({
        from: line.from,
        to: line.from,
        insert: '- [ ] '
      });
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle inline code
export function toggleInlineCode({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "`code`" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already inline code
      if (selectedText.startsWith('`') && selectedText.endsWith('`')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(1, selectedText.length - 1) 
        });
      } else {
        changes.push({ from, to, insert: `\`${selectedText}\`` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle code block
export function toggleCodeBlock({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "```\nCode block\n```" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already a code block
      if (selectedText.startsWith('```') && selectedText.endsWith('```')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(3, selectedText.length - 3).trim() 
        });
      } else {
        changes.push({ from, to, insert: `\`\`\`\n${selectedText}\n\`\`\`` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Helper to create heading toggle functions
export function setHeading(level: number) {
  return ({ state, dispatch }: EditorView) => {
    const selection = state.selection;
    let changes = [];
    
    for (const range of selection.ranges) {
      const from = range.from;
      
      // Get the current line
      const line = state.doc.lineAt(from);
      const lineText = line.text;
      
      // Check if already a heading
      const headingMatch = lineText.match(/^(#{1,6})\s/);
      
      if (headingMatch) {
        // Replace existing heading
        const newLine = lineText.replace(/^#{1,6}\s/, '#'.repeat(level) + ' ');
        changes.push({
          from: line.from,
          to: line.to,
          insert: newLine
        });
      } else {
        // Add new heading
        changes.push({
          from: line.from,
          to: line.from,
          insert: '#'.repeat(level) + ' '
        });
      }
    }
    
    if (dispatch) {
      dispatch({ changes });
    }
    
    return true;
  };
}