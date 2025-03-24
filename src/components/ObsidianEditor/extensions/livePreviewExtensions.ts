import { Extension } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, ViewPlugin, WidgetType, Range } from '@codemirror/view';
import MarkdownIt from 'markdown-it';

// Custom widget for rendering markdown elements inline
class MarkdownWidget extends WidgetType {
  constructor(
    readonly content: string,
    readonly type: string,
    readonly originalText: string,
  ) {
    super();
  }

  eq(other: MarkdownWidget) {
    return other.content === this.content && other.type === this.type;
  }

  toDOM() {
    const element = document.createElement('span');
    element.className = `cm-rendered-markdown cm-${this.type}`;
    element.dataset.originalText = this.originalText;
    element.innerHTML = this.content;
    
    // Add event listeners for interactive elements
    if (this.type === 'task') {
      const checkbox = element.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation();
          const event = new CustomEvent('toggleTask', { 
            bubbles: true, 
            detail: { originalText: this.originalText } 
          });
          element.dispatchEvent(event);
        });
      }
    }
    
    // For callouts, add toggle functionality
    if (this.type === 'callout') {
      const title = element.querySelector('.callout-title');
      if (title) {
        title.addEventListener('click', () => {
          const content = element.querySelector('.callout-content');
          if (content) {
            content.classList.toggle('collapsed');
          }
        });
      }
    }
    
    return element;
  }

  ignoreEvent() {
    // Allow certain events for interactivity
    return false;
  }
}

// Custom widget for headings
class HeadingWidget extends WidgetType {
  constructor(
    readonly level: number,
    readonly content: string,
    readonly originalText: string
  ) {
    super();
  }

  eq(other: HeadingWidget) {
    return other.level === this.level && other.content === this.content;
  }

  toDOM() {
    const element = document.createElement(`h${this.level}`);
    element.className = `cm-rendered-heading cm-heading-${this.level}`;
    element.dataset.originalText = this.originalText;
    element.innerHTML = this.content;
    
    // Add collapse/expand functionality
    element.addEventListener('click', (e) => {
      if (e.target === element) {
        // Toggle folding
        const event = new CustomEvent('toggleHeadingFold', { 
          bubbles: true, 
          detail: { level: this.level, element }
        });
        element.dispatchEvent(event);
      }
    });
    
    return element;
  }

  ignoreEvent() {
    return false;
  }
}

// Custom widget for checkboxes
class CheckboxWidget extends WidgetType {
  constructor(
    readonly checked: boolean,
    readonly originalText: string,
  ) {
    super();
  }

  eq(other: CheckboxWidget) {
    return other.checked === this.checked;
  }

  toDOM() {
    const wrapper = document.createElement('span');
    wrapper.className = 'cm-task-checkbox-wrapper';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'cm-task-checkbox';
    checkbox.checked = this.checked;
    
    // When checkbox is clicked, dispatch a custom event to handle the state change
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      const event = new CustomEvent('toggleCheckbox', { 
        bubbles: true, 
        detail: { checked: checkbox.checked, originalText: this.originalText } 
      });
      wrapper.dispatchEvent(event);
    });
    
    wrapper.appendChild(checkbox);
    return wrapper;
  }

  ignoreEvent() {
    return false;
  }
}

// Factory function for creating live preview extensions
export function createLivePreviewExtensions(md: MarkdownIt): Extension[] {
  return [
    // Enhanced decorations for live preview rendering
    ViewPlugin.fromClass(class {
      decorations: DecorationSet
      
      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }
      
      update(update: { docChanged: boolean; view: EditorView }) {
        if (update.docChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }
      
      buildDecorations(view: EditorView) {
        const decorations: Range<Decoration>[] = [];
        const doc = view.state.doc;
        
        // Process the document for block elements
        this.processBlockElements(doc.toString(), decorations);
        
        // Process document line by line for inline elements
        for (let i = 1; i <= doc.lines; i++) {
          const line = doc.line(i);
          const text = line.text;
          
          // Process headings
          const headingMatch = text.match(/^(#{1,6})\s+(.*?)$/);
          if (headingMatch) {
            const level = headingMatch[1].length;
            const content = headingMatch[2];
            const renderedContent = md.renderInline(content);
            
            // Create heading widget decoration
            decorations.push(
              Decoration.replace({
                widget: new HeadingWidget(level, renderedContent, text),
                inclusive: true,
                block: true
              }).range(line.from, line.to)
            );
            continue; // Skip further processing for this line
          }
          
          // Process task lists
          const taskMatch = text.match(/^(\s*)- \[([ xX])\]\s+(.*?)$/);
          if (taskMatch) {
            const indent = taskMatch[1];
            const checked = taskMatch[2] !== ' ';
            const content = taskMatch[3];
            const renderedContent = md.renderInline(content);
            
            // Create checkbox widget for the checkbox part
            const checkboxPos = line.from + indent.length;
            decorations.push(
              Decoration.replace({
                widget: new CheckboxWidget(checked, text),
                inclusive: true
              }).range(checkboxPos, checkboxPos + 4) // "- [ ]" or "- [x]"
            );
            
            // Create a widget for the task text
            const contentStart = checkboxPos + 5; // After "- [ ] "
            decorations.push(
              Decoration.replace({
                widget: new MarkdownWidget(renderedContent, 'task-content', content),
                inclusive: true
              }).range(contentStart, line.to)
            );
            continue;
          }
          
          // Process inline formatting
          this.processInlineElements(text, line.from, decorations);
        }
        
        return Decoration.set(decorations, true);
      }
      
      // Process entire document for block elements like callouts, code blocks, etc.
      processBlockElements(docText: string, decorations: Range<Decoration>[]) {
        // Process callouts
        const calloutRegex = />\s*\[!([\w-]+)\](.*?)(?:\n>.*?)*(?:\n\n|$)/gs;
        let calloutMatch;
        
        while ((calloutMatch = calloutRegex.exec(docText)) !== null) {
          const type = calloutMatch[1];
          const start = calloutMatch.index;
          const end = start + calloutMatch[0].length;
          
          // Extract and render the callout content
          const calloutContent = calloutMatch[0].replace(/>\s*\[![\w-]+\].*?\n/, '').replace(/>\s*/g, '');
          const calloutTitle = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
          
          const renderedCallout = `
            <div class="callout ${type.toLowerCase()}">
              <div class="callout-title">${calloutTitle}</div>
              <div class="callout-content">${md.render(calloutContent)}</div>
            </div>
          `;
          
          decorations.push(
            Decoration.replace({
              widget: new MarkdownWidget(renderedCallout, 'callout', calloutMatch[0]),
              inclusive: true,
              block: true
            }).range(start, end)
          );
        }
        
        // Process code blocks
        const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g;
        let codeMatch;
        
        while ((codeMatch = codeBlockRegex.exec(docText)) !== null) {
          const lang = codeMatch[1] || '';
          const code = codeMatch[2];
          const start = codeMatch.index;
          const end = start + codeMatch[0].length;
          
          // Handle special code blocks
          if (lang === 'mermaid') {
            const renderedMermaid = `
              <div class="mermaid-diagram" data-content="${code}">
                <div class="mermaid-block-header">Mermaid Diagram</div>
                <pre><code class="language-mermaid">${code}</code></pre>
              </div>
            `;
            
            decorations.push(
              Decoration.replace({
                widget: new MarkdownWidget(renderedMermaid, 'mermaid', codeMatch[0]),
                inclusive: true,
                block: true
              }).range(start, end)
            );
          } else if (lang === 'dataview') {
            const renderedDataview = `
              <div class="dataview-block">
                <div class="dataview-block-header">Dataview Query</div>
                <pre><code class="language-dataview">${code}</code></pre>
              </div>
            `;
            
            decorations.push(
              Decoration.replace({
                widget: new MarkdownWidget(renderedDataview, 'dataview', codeMatch[0]),
                inclusive: true,
                block: true
              }).range(start, end)
            );
          } else {
            // Regular code block
            const renderedCode = `
              <div class="code-block-wrapper">
                <div class="code-block-language">${lang}</div>
                <pre><code class="language-${lang}">${code}</code></pre>
              </div>
            `;
            
            decorations.push(
              Decoration.replace({
                widget: new MarkdownWidget(renderedCode, 'code-block', codeMatch[0]),
                inclusive: true,
                block: true
              }).range(start, end)
            );
          }
        }
      }
      
      // Process inline formatting elements within a line
      processInlineElements(text: string, lineStart: number, decorations: Range<Decoration>[]) {
        // Process Obsidian WikiLinks [[Link]]
        const wikiLinkRegex = /\[\[(.*?)\]\]/g;
        let wikiMatch;
        while ((wikiMatch = wikiLinkRegex.exec(text)) !== null) {
          const start = lineStart + wikiMatch.index;
          const end = start + wikiMatch[0].length;
          const linkText = wikiMatch[1];
          
          // Handle links with pipe for different display text: [[Link|Display Text]]
          let displayText = linkText;
          let linkTarget = linkText;
          
          if (linkText.includes('|')) {
            const [link, display] = linkText.split('|');
            linkTarget = link.trim();
            displayText = display.trim();
          }
          
          const renderedLink = `<a href="#" class="internal-link" data-link="${linkTarget}">${displayText}</a>`;
          
          decorations.push(
            Decoration.replace({
              widget: new MarkdownWidget(renderedLink, 'wikilink', wikiMatch[0]),
              inclusive: true
            }).range(start, end)
          );
        }
        
        // Process tags #tag
        const tagRegex = /(^|\s)#([a-zA-Z0-9_/-]+)/g;
        let tagMatch;
        while ((tagMatch = tagRegex.exec(text)) !== null) {
          const start = lineStart + tagMatch.index + tagMatch[1].length; // Skip the space before
          const end = start + tagMatch[2].length + 1; // Include the # symbol
          const tag = tagMatch[2];
          
          const renderedTag = `<a href="#" class="tag-link" data-tag="${tag}">#${tag}</a>`;
          
          decorations.push(
            Decoration.replace({
              widget: new MarkdownWidget(renderedTag, 'tag', '#' + tag),
              inclusive: true
            }).range(start, end)
          );
        }
        
        // Process highlights ==highlight==
        const highlightRegex = /==(.*?)==/g;
        let highlightMatch;
        while ((highlightMatch = highlightRegex.exec(text)) !== null) {
          const start = lineStart + highlightMatch.index;
          const end = start + highlightMatch[0].length;
          const content = highlightMatch[1];
          
          const renderedHighlight = `<mark>${content}</mark>`;
          
          decorations.push(
            Decoration.replace({
              widget: new MarkdownWidget(renderedHighlight, 'highlight', highlightMatch[0]),
              inclusive: true
            }).range(start, end)
          );
        }
        
        // Process comments %% comment %%
        const commentRegex = /%%(.+?)%%/g;
        let commentMatch;
        while ((commentMatch = commentRegex.exec(text)) !== null) {
          const start = lineStart + commentMatch.index;
          const end = start + commentMatch[0].length;
          const content = commentMatch[1];
          
          const renderedComment = `<span class="obsidian-comment" title="Obsidian Comment">${content}</span>`;
          
          decorations.push(
            Decoration.replace({
              widget: new MarkdownWidget(renderedComment, 'comment', commentMatch[0]),
              inclusive: true
            }).range(start, end)
          );
        }
        
        // Process dataview inline queries `=query`
        const dataviewRegex = /`=(.+?)`/g;
        let dataviewMatch;
        while ((dataviewMatch = dataviewRegex.exec(text)) !== null) {
          const start = lineStart + dataviewMatch.index;
          const end = start + dataviewMatch[0].length;
          const query = dataviewMatch[1];
          
          const renderedDataview = `<span class="dataview-inline-query">${query}</span>`;
          
          decorations.push(
            Decoration.replace({
              widget: new MarkdownWidget(renderedDataview, 'dataview-inline', dataviewMatch[0]),
              inclusive: true
            }).range(start, end)
          );
        }
        
        // Process bold **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        let boldMatch;
        while ((boldMatch = boldRegex.exec(text)) !== null) {
          const start = lineStart + boldMatch.index;
          const end = start + boldMatch[0].length;
          const content = boldMatch[1];
          
          const renderedBold = `<strong>${content}</strong>`;
          
          decorations.push(
            Decoration.replace({
              widget: new MarkdownWidget(renderedBold, 'bold', boldMatch[0]),
              inclusive: true
            }).range(start, end)
          );
        }
        
        // Process italic *text*
        const italicRegex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g;
        let italicMatch;
        while ((italicMatch = italicRegex.exec(text)) !== null) {
          const start = lineStart + italicMatch.index;
          const end = start + italicMatch[0].length;
          const content = italicMatch[1];
          
          const renderedItalic = `<em>${content}</em>`;
          
          decorations.push(
            Decoration.replace({
              widget: new MarkdownWidget(renderedItalic, 'italic', italicMatch[0]),
              inclusive: true
            }).range(start, end)
          );
        }
        
        // Process inline code `code`
        const inlineCodeRegex = /`([^`]+)`/g;
        let inlineCodeMatch;
        while ((inlineCodeMatch = inlineCodeRegex.exec(text)) !== null) {
          // Skip dataview queries which we already processed
          if (text.substring(inlineCodeMatch.index - 1, inlineCodeMatch.index) === '=') continue;
          
          const start = lineStart + inlineCodeMatch.index;
          const end = start + inlineCodeMatch[0].length;
          const content = inlineCodeMatch[1];
          
          const renderedCode = `<code>${content}</code>`;
          
          decorations.push(
            Decoration.replace({
              widget: new MarkdownWidget(renderedCode, 'inline-code', inlineCodeMatch[0]),
              inclusive: true
            }).range(start, end)
          );
        }
      }
    }, {
      decorations: v => v.decorations,
      eventHandlers: {
        toggleCheckbox: (view, event: CustomEvent) => {
          const { checked, originalText } = event.detail;
          
          // Toggle the checkbox in the markdown
          const newText = originalText.replace(
            /- \[[ xX]\]/, 
            checked ? '- [x]' : '- [ ]'
          );
          
          // Find the line with this text
          const doc = view.state.doc;
          for (let i = 1; i <= doc.lines; i++) {
            const line = doc.line(i);
            if (line.text === originalText) {
              view.dispatch({
                changes: {
                  from: line.from,
                  to: line.to,
                  insert: newText
                }
              });
              break;
            }
          }
          
          return true;
        },
        
        toggleHeadingFold: (view, event: CustomEvent) => {
          // In a full implementation, this would toggle the visibility
          // of content under this heading until the next heading of
          // the same or higher level
          console.log('Toggle heading fold:', event.detail);
          return true;
        }
      }
    })
  ];
}