<template>
  <main class="container">
    <h1>JWT Concurrent Refresh Learning</h1>

    <section v-if="!isLoggedIn" class="card">
      <h2>Login</h2>
      <label>
        Email
        <input v-model="email" type="email" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" />
      </label>
      <button @click="onLogin">Login</button>
      <p v-if="authError" class="error">{{ authError }}</p>
    </section>

    <section v-else class="card">
      <h2>Dashboard</h2>
      <p><strong>Login state:</strong> authenticated</p>
      <p><strong>Access token:</strong> {{ tokenPreview }}</p>

      <div class="actions">
        <button @click="loadProfile">Load profile</button>
        <button @click="loadAll">Load all protected data</button>
        <button @click="onClearToken">Clear access token</button>
        <button @click="onLogout">Logout</button>
      </div>

      <h3>API responses</h3>
      <pre>{{ JSON.stringify(apiResults, null, 2) }}</pre>

      <h3>Errors</h3>
      <pre>{{ JSON.stringify(apiErrors, null, 2) }}</pre>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  clearAccessToken,
  getAccessToken,
  getNotifications,
  getOrders,
  getProfile,
  getSettings,
  login,
  logout,
  setAccessToken
} from './api';

const email = ref('demo@example.com');
const password = ref('password123');
const isLoggedIn = ref(Boolean(getAccessToken()));
const authError = ref('');

const apiResults = ref<Record<string, unknown>>({});
const apiErrors = ref<Record<string, string>>({});

const tokenPreview = computed(() => {
  const token = getAccessToken();
  if (!token) return '(empty)';
  if (token.length <= 20) return token;
  return `${token.slice(0, 10)}...${token.slice(-10)}`;
});

function handleAuthFailure(error: unknown): string {
  const message = String(error);
  if (message.includes('Refresh failed')) {
    isLoggedIn.value = false;
    authError.value = 'Session expired. Please login again.';
  }
  return message;
}

async function onLogin() {
  authError.value = '';

  try {
    const data = await login(email.value, password.value);
    setAccessToken(data.accessToken);
    isLoggedIn.value = true;
  } catch (error) {
    authError.value = String(error);
  }
}

async function loadProfile() {
  try {
    apiResults.value.profile = await getProfile();
    delete apiErrors.value.profile;
  } catch (error) {
    apiErrors.value.profile = handleAuthFailure(error);
  }
}

async function loadAll() {
  const tasks = {
    profile: getProfile(),
    orders: getOrders(),
    notifications: getNotifications(),
    settings: getSettings()
  };

  const entries = Object.entries(tasks);
  const settled = await Promise.allSettled(entries.map(([, promise]) => promise));

  settled.forEach((result, index) => {
    const key = entries[index][0];
    if (result.status === 'fulfilled') {
      apiResults.value[key] = result.value;
      delete apiErrors.value[key];
    } else {
      apiErrors.value[key] = handleAuthFailure(result.reason);
    }
  });
}

function onClearToken() {
  clearAccessToken();
}

async function onLogout() {
  try {
    await logout();
  } finally {
    isLoggedIn.value = false;
    clearAccessToken();
  }
}
</script>
