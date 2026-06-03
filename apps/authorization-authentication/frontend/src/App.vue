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

    <section class="card wallet-demo">
      <h2>Wallet race condition demo</h2>
      <p><strong>Current balance:</strong> {{ walletBalanceText }}</p>

      <div class="actions">
        <button :disabled="isWalletBusy" @click="onResetWallet">Reset wallet</button>
        <button :disabled="isWalletBusy" @click="runWithoutMutexDemo">
          Run without mutex demo
        </button>
      </div>

      <p>
        Expected sequential result for three withdraw requests is 10, but this
        intentionally unsafe implementation can finish with 70 because all
        requests may read the same balance before writing.
      </p>

      <h3>Wallet log</h3>
      <pre>{{ walletLogText }}</pre>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  clearAccessToken,
  getAccessToken,
  getWalletBalance,
  getNotifications,
  getOrders,
  getProfile,
  getSettings,
  login,
  logout,
  resetWalletBalance,
  setAccessToken,
  withdrawWithoutMutex
} from './api';

const email = ref('demo@example.com');
const password = ref('password123');
const isLoggedIn = ref(Boolean(getAccessToken()));
const authError = ref('');

const apiResults = ref<Record<string, unknown>>({});
const apiErrors = ref<Record<string, string>>({});
const walletBalance = ref<number | null>(null);
const walletLog = ref<string[]>([]);
const isWalletBusy = ref(false);

const tokenPreview = computed(() => {
  const token = getAccessToken();
  if (!token) return '(empty)';
  if (token.length <= 20) return token;
  return `${token.slice(0, 10)}...${token.slice(-10)}`;
});

const walletBalanceText = computed(() => {
  return walletBalance.value === null ? '(not loaded)' : walletBalance.value;
});

const walletLogText = computed(() => {
  return walletLog.value.length > 0 ? walletLog.value.join('\n') : 'No wallet actions yet.';
});

function handleAuthFailure(error: unknown): string {
  const message = String(error);
  if (message.includes('Refresh failed')) {
    isLoggedIn.value = false;
    authError.value = 'Session expired. Please login again.';
  }
  return message;
}

function appendWalletLog(message: string) {
  walletLog.value.push(message);
}

async function refreshWalletBalance() {
  const data = await getWalletBalance();
  walletBalance.value = data.balance;
  return data.balance;
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

async function onResetWallet() {
  isWalletBusy.value = true;
  walletLog.value = [];

  try {
    const data = await resetWalletBalance();
    walletBalance.value = data.balance;
    appendWalletLog(`Wallet reset to ${data.balance}`);
  } catch (error) {
    appendWalletLog(`Reset failed: ${String(error)}`);
  } finally {
    isWalletBusy.value = false;
  }
}

async function runWithoutMutexDemo() {
  isWalletBusy.value = true;
  walletLog.value = [];

  try {
    const reset = await resetWalletBalance();
    walletBalance.value = reset.balance;
    appendWalletLog(`Wallet reset to ${reset.balance}`);
    appendWalletLog('Starting 3 parallel withdrawWithoutMutex(30) requests');

    const settled = await Promise.allSettled([
      withdrawWithoutMutex(30),
      withdrawWithoutMutex(30),
      withdrawWithoutMutex(30)
    ]);

    settled.forEach((result, index) => {
      const requestNumber = index + 1;

      if (result.status === 'fulfilled') {
        appendWalletLog(
          `Request ${requestNumber} fulfilled with balance ${result.value.balance}`
        );
      } else {
        appendWalletLog(`Request ${requestNumber} rejected: ${String(result.reason)}`);
      }
    });

    const finalBalance = await refreshWalletBalance();
    appendWalletLog(`Final balance: ${finalBalance}`);
    appendWalletLog('Correct sequential result would be 10.');
    appendWalletLog('Without mutex, the intentionally unsafe result can be 70.');
  } catch (error) {
    appendWalletLog(`Demo failed: ${String(error)}`);
  } finally {
    isWalletBusy.value = false;
  }
}

async function onLogout() {
  try {
    await logout();
  } finally {
    isLoggedIn.value = false;
    clearAccessToken();
  }
}

onMounted(() => {
  refreshWalletBalance().catch((error) => {
    appendWalletLog(`Initial balance load failed: ${String(error)}`);
  });
});
</script>
