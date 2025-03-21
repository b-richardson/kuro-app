// This is a simple test to verify that vue-draggable-next is working correctly
import { createApp } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next';

const app = createApp({
  data() {
    return {
      list: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ],
    };
  },
  methods: {
    log(evt) {
      console.log(evt);
    }
  },
  template: `
    <div>
      <h2>Test Draggable</h2>
      <div>
        <vue-draggable
          v-model="list"
          item-key="id"
          group="people"
          @start="log('start')"
          @end="log('end')"
          @change="log($event)"
        >
          <template #item="{element}">
            <div class="item">
              {{ element.name }}
            </div>
          </template>
        </vue-draggable>
      </div>
    </div>
  `,
});

app.component('vue-draggable', VueDraggableNext);
app.mount('#app');

console.log('Vue-draggable-next test loaded');
