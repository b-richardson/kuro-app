import MarkdownIt from 'markdown-it';
import katex from 'katex';
import mermaid from 'mermaid';

// Process Obsidian-specific syntax
export function processObsidianSyntax(content: string): string {
  let processedContent = content;
  
  // Process Obsidian internal links [[Link]]
  processedContent = processedContent.replace(
    /\[\[(.*?)\]\]/g, 
    (match, linkText) => {
      // Handle links with a pipe for different display text: [[Link|Display Text]]
      if (linkText.includes('|')) {
        const [link, display] = linkText.split('|');
        return `<a href="#" class="internal-link" data-link="${link.trim()}">${display.trim()}</a>`;
      }
      return `<a href="#" class="internal-link" data-link="${linkText.trim()}">${linkText.trim()}</a>`;
    }
  );
  
  // Process highlights ==text==
  processedContent = processedContent.replace(
    /==(.*?)==/g,
    '<mark>$1</mark>'
  );
  
  // Process callout blocks
  processedContent = processedContent.replace(
    />\s*\[!([\w-]+)\](.*?)(?:\n>.*?)*(?:\n\n|$)/gs,
    (match, type, content) => {
      const calloutTitle = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      const calloutContent = match.replace(/>\s*\[![\w-]+\].*?\n/, '').replace(/>\s*/g, '');
      
      return `<div class="callout ${type.toLowerCase()}">
        <div class="callout-title">${calloutTitle}</div>
        <div class="callout-content">${calloutContent}</div>
      </div>`;
    }
  );
  
  // Process Obsidian comments %% comment %%
  processedContent = processedContent.replace(
    /%%(.+?)%%/gs,
    '<span class="obsidian-comment">$1</span>'
  );
  
  // Process dynamic dates like {{date}} or {{date:YYYY-MM-DD}}
  processedContent = processedContent.replace(
    /\{\{date(?::([^}]+))?\}\}/g,
    (match, format) => {
      const now = new Date();
      if (format) {
        // This is a simplistic approach - in a full implementation we would use date-fns format
        return format.replace('YYYY', now.getFullYear().toString())
                   .replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
                   .replace('DD', now.getDate().toString().padStart(2, '0'));
      }
      return now.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
  );
  
  // Process Dataview inline queries (simplified version)
  processedContent = processedContent.replace(
    /`=(.+?)`/g,
    '<span class="dataview-inline-query">$1</span>'
  );
  
  // Process Dataview code blocks
  processedContent = processedContent.replace(
    /```dataview\n([\s\S]*?)```/g,
    '<div class="dataview-block"><pre><code class="language-dataview">$1</code></pre></div>'
  );
  
  // Process tag links #tag
  processedContent = processedContent.replace(
    /(^|\s)#([a-zA-Z0-9_/-]+)/g,
    '$1<a href="#" class="tag-link" data-tag="$2">#$2</a>'
  );
  
  return processedContent;
}

// Post-process HTML after markdown rendering
export function postProcessHtml(html: string, md: MarkdownIt): string {
  // Process task list items for interactive checkboxes
  html = html.replace(
    /<li>\s*\[([ xX])\]\s*(.*?)<\/li>/g,
    (match, checkChar, itemText) => {
      const isChecked = checkChar === 'x' || checkChar === 'X';
      const checkboxHtml = `<input type="checkbox" class="task-checkbox" ${isChecked ? 'checked' : ''}>`;
      const itemClass = isChecked ? 'class="task-completed"' : '';
      
      return `<li class="task-list-item">${checkboxHtml} <span ${itemClass}>${itemText}</span></li>`;
    }
  );
  
  // Process math blocks
  html = processKatexBlocks(html);
  
  // Process Mermaid diagrams
  html = processMermaidDiagrams(html);
  
  // Handle Obsidian comments - make them visible but styled as comments
  html = html.replace(
    /<span class="obsidian-comment">([\s\S]*?)<\/span>/g,
    '<span class="obsidian-comment" title="Obsidian Comment">$1</span>'
  );
  
  // Process Dataview blocks to make them look better
  html = html.replace(
    /<div class="dataview-block">([\s\S]*?)<\/div>/g,
    '<div class="dataview-block"><div class="dataview-block-header">Dataview Query</div>$1</div>'
  );
  
  // Process dynamic date placeholders that remain
  const now = new Date();
  html = html.replace(
    /\{\{date(?::[^}]+)?\}\}/g,
    now.toISOString().split('T')[0] // YYYY-MM-DD format
  );
  
  // Add special styling for tag links
  html = html.replace(
    /<a href="#" class="tag-link" data-tag="([^"]+)">(#[^<]+)<\/a>/g,
    '<a href="#" class="tag-link" data-tag="$1">$2</a>'
  );
  
  return html;
}

// Process KaTeX math blocks
export function processKatexBlocks(html: string): string {
  try {
    // Inline math: $...$
    html = html.replace(/\$([^$\n]+?)\$/g, (match, expr) => {
      try {
        return katex.renderToString(expr, { displayMode: false, throwOnError: false });
      } catch (e) {
        console.error('KaTeX error (inline):', e);
        return `<span class="math-error">${expr}</span>`;
      }
    });
    
    // Display math: $$...$$
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
      try {
        return katex.renderToString(expr, { displayMode: true, throwOnError: false });
      } catch (e) {
        console.error('KaTeX error (display):', e);
        return `<div class="math-error">${expr}</div>`;
      }
    });
    
    return html;
  } catch (e) {
    console.error('Error processing math:', e);
    return html;
  }
}

// Process Mermaid diagrams
export function processMermaidDiagrams(html: string): string {
  try {
    // Find code blocks with mermaid class
    const mermaidBlocks = html.match(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g);
    
    if (!mermaidBlocks) return html;
    
    // Process each found diagram
    for (const block of mermaidBlocks) {
      const content = block.match(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/)?.[1];
      
      if (content) {
        try {
          // Generate unique ID for the diagram
          const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
          
          // Replace the code block with a container
          html = html.replace(
            block,
            `<div class="mermaid-diagram" id="${id}"></div>`
          );
          
          // Render the diagram (in actual implementation, this would be better handled after mounting)
          setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
              mermaid.render(id, content).then(result => {
                element.innerHTML = result.svg;
              }).catch(error => {
                element.innerHTML = `<div class="mermaid-error">Error rendering diagram: ${error.message}</div>`;
              });
            }
          }, 0);
        } catch (e) {
          console.error('Mermaid error:', e);
        }
      }
    }
    
    return html;
  } catch (e) {
    console.error('Error processing diagrams:', e);
    return html;
  }
}

// Highlight code blocks using syntax highlighting
export function highlightCodeBlocks(str: string, lang: string): string {
  // Here you would integrate a syntax highlighter like Prism.js
  // For simplicity, we're just returning the code with a language class
  return `<pre class="language-${lang}"><code class="language-${lang}">${str}</code></pre>`;
}

// Enhance markdown parser with Obsidian-specific features
export function enhanceMarkdownParser(md: MarkdownIt): void {
  // Add support for checkbox rendering
  md.use((md) => {
    // Override the renderer for task list items
    const originalRender = md.renderer.rules.list_item_open || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
    
    md.renderer.rules.list_item_open = function(tokens, idx, options, env, self) {
      const token = tokens[idx];
      
      if (idx + 2 < tokens.length && 
          tokens[idx + 1].type === 'inline' && 
          (tokens[idx + 1].content.startsWith('[ ] ') || 
           tokens[idx + 1].content.startsWith('[x] ') || 
           tokens[idx + 1].content.startsWith('[X] '))) {
        token.attrJoin('class', 'task-list-item');
      }
      
      return originalRender(tokens, idx, options, env, self);
    };
  });
  
  // Custom renderer for improved handling of Obsidian-specific syntax
  md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const href = token.attrGet('href') || '';
    
    // Check if it looks like an Obsidian-style wikilink that was converted to HTML
    if (href.startsWith('#') && token.attrGet('data-link')) {
      token.attrSet('class', 'internal-link');
    }
    
    return self.renderToken(tokens, idx, options);
  };
  
  // Enhance code block rendering
  const defaultFence = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const lang = token.info.trim();
    
    // Special handling for mermaid, dataview, etc.
    if (lang === 'mermaid') {
      return `<div class="mermaid-diagram" data-content="${token.content}">${token.content}</div>`;
    } else if (lang === 'dataview') {
      return `<div class="dataview-block"><pre><code class="language-dataview">${token.content}</code></pre></div>`;
    }
    
    return defaultFence(tokens, idx, options, env, self);
  };
}

// Create a configured markdown-it instance 
export function createMarkdownParser(): MarkdownIt {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: highlightCodeBlocks
  });
  
  enhanceMarkdownParser(md);
  
  return md;
}