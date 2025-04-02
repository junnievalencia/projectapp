<template>
  <q-item
    clickable
    :to="to"
    :active="active"
    :active-class="activeClass"
    v-if="!click"
  >
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption v-if="caption">{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>

  <q-item clickable @click="click" v-else>
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption v-if="caption">{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "EssentialLink",
  props: {
    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: "",
    },

    to: {
      type: String,
      default: "#",
    },

    icon: {
      type: String,
      default: "",
    },

    click: {
      type: Function,
      default: null,
    },

    active: {
      type: Boolean,
      default: false,
    },

    activeClass: {
      type: String,
      default: "text-primary",
    },
  },
});
</script>
