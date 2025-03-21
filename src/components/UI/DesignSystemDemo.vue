<template>
  <section class="design-system-demo">
    <div class="glass-card demo-section">
      <h1>Glassmorphism Design System</h1>
      <p>This is a visual showcase of the new design system components and styles.</p>
      
      <h2>Color Palette</h2>
      <div class="color-palette">
        <div class="color-swatch">
          <div class="swatch" style="background-color: var(--color-primary)"></div>
          <div class="swatch-info">
            <div class="swatch-name">Primary</div>
            <div class="swatch-value">#FFAB58</div>
          </div>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background-color: var(--color-primary-light)"></div>
          <div class="swatch-info">
            <div class="swatch-name">Primary Light</div>
            <div class="swatch-value">#FFCC70</div>
          </div>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background-color: var(--color-primary-dark)"></div>
          <div class="swatch-info">
            <div class="swatch-name">Primary Dark</div>
            <div class="swatch-value">#FF9633</div>
          </div>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background-color: var(--color-secondary)"></div>
          <div class="swatch-info">
            <div class="swatch-name">Secondary</div>
            <div class="swatch-value">#4ECDC4</div>
          </div>
        </div>
      </div>
      
      <div class="functional-colors">
        <div class="color-swatch">
          <div class="swatch" style="background-color: var(--color-success)"></div>
          <div class="swatch-info">
            <div class="swatch-name">Success</div>
          </div>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background-color: var(--color-warning)"></div>
          <div class="swatch-info">
            <div class="swatch-name">Warning</div>
          </div>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background-color: var(--color-error)"></div>
          <div class="swatch-info">
            <div class="swatch-name">Error</div>
          </div>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background-color: var(--color-info)"></div>
          <div class="swatch-info">
            <div class="swatch-name">Info</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="glass-card demo-section">
      <h2>Typography</h2>
      <div class="typography-demo">
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>This is a paragraph with standard text. Our design system uses Inter as the main font. Text is optimized for readability on all devices.</p>
        <p><small>This is small text, useful for captions and secondary information.</small></p>
        <p><code>This is code text using JetBrains Mono</code></p>
      </div>
    </div>
    
    <div class="glass-card demo-section">
      <h2>Buttons</h2>
      <div class="button-demo">
        <button class="btn">Default Button</button>
        <button class="btn btn-primary">Primary Button</button>
        <button class="btn btn-outline">Outline Button</button>
        <button class="btn btn-circle"><i class="fas fa-plus"></i></button>
      </div>
    </div>
    
    <div class="glass-card demo-section">
      <h2>Form Elements</h2>
      <div class="form-demo">
        <div class="form-group">
          <label for="demo-input">Text Input</label>
          <input id="demo-input" type="text" placeholder="Enter some text">
        </div>
        
        <div class="form-group">
          <label for="demo-select">Select</label>
          <select id="demo-select">
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
            <option value="3">Option 3</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="demo-textarea">Textarea</label>
          <textarea id="demo-textarea" placeholder="Enter multiple lines of text"></textarea>
        </div>
      </div>
    </div>
    
    <div class="glass-card demo-section">
      <h2>Card Components</h2>
      <div class="card-demo">
        <div class="card template-card">
          <div class="template-header">
            <h3>Template Example</h3>
            <div class="template-badge">New</div>
          </div>
          <p>This is a template card with glassmorphism effects applied.</p>
          <div class="card-actions">
            <button class="btn btn-outline"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-primary"><i class="fas fa-download"></i> Export</button>
          </div>
        </div>
        
        <div class="card template-card">
          <div class="template-header">
            <h3>Another Template</h3>
            <div class="template-badge">Popular</div>
          </div>
          <p>Templates have a consistent design with hover effects for feedback.</p>
          <div class="card-actions">
            <button class="btn btn-outline"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-primary"><i class="fas fa-download"></i> Export</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// This component is purely for demonstration purposes
</script>

<style scoped>
.design-system-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.demo-section {
  padding: var(--spacing-lg);
}

/* Color palette styling */
.color-palette, .functional-colors {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin: var(--spacing-md) 0;
}

.color-swatch {
  display: flex;
  flex-direction: column;
  width: 100px;
}

.swatch {
  height: 60px;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.swatch-info {
  margin-top: var(--spacing-xs);
}

.swatch-name {
  font-size: 0.8rem;
  font-weight: 500;
}

.swatch-value {
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

/* Typography demo styling */
.typography-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.typography-demo h1, 
.typography-demo h2, 
.typography-demo h3 {
  margin-bottom: 0;
}

/* Button demo styling */
.button-demo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  align-items: center;
}

/* Form demo styling */
.form-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 500px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* Card demo styling */
.card-demo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.template-card {
  width: 300px;
  display: flex;
  flex-direction: column;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.template-header h3 {
  margin: 0;
}

.template-badge {
  background-color: var(--color-primary);
  color: var(--color-text-dark);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: auto;
  padding-top: var(--spacing-md);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-demo {
    flex-direction: column;
    align-items: center;
  }
  
  .template-card {
    width: 100%;
  }
  
  .button-demo {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .button-demo .btn {
    width: 100%;
  }
}
</style>