import { computed, ref } from 'vue';
import { clearAccessToken, getAccessToken, getNotifications, getOrders, getProfile, getSettings, login, logout, setAccessToken } from './api';
const email = ref('demo@example.com');
const password = ref('password123');
const isLoggedIn = ref(Boolean(getAccessToken()));
const authError = ref('');
const apiResults = ref({});
const apiErrors = ref({});
const logs = ref([]);
const tokenPreview = computed(() => {
    const token = getAccessToken();
    if (!token)
        return '(empty)';
    if (token.length <= 20)
        return token;
    return `${token.slice(0, 10)}...${token.slice(-10)}`;
});
function uiLog(message) {
    logs.value.push(`${new Date().toLocaleTimeString()} - ${message}`);
}
async function onLogin() {
    authError.value = '';
    uiLog('login started');
    try {
        const data = await login(email.value, password.value);
        setAccessToken(data.accessToken);
        isLoggedIn.value = true;
        uiLog('login success');
    }
    catch (error) {
        authError.value = String(error);
        uiLog('login failed');
    }
}
async function loadProfile() {
    try {
        apiResults.value.profile = await getProfile(uiLog);
        delete apiErrors.value.profile;
    }
    catch (error) {
        apiErrors.value.profile = String(error);
    }
}
async function loadAll() {
    uiLog('load all protected data started');
    const tasks = {
        profile: getProfile(uiLog),
        orders: getOrders(uiLog),
        notifications: getNotifications(uiLog),
        settings: getSettings(uiLog)
    };
    const entries = Object.entries(tasks);
    const settled = await Promise.allSettled(entries.map(([, promise]) => promise));
    settled.forEach((result, index) => {
        const key = entries[index][0];
        if (result.status === 'fulfilled') {
            apiResults.value[key] = result.value;
            delete apiErrors.value[key];
        }
        else {
            apiErrors.value[key] = String(result.reason);
        }
    });
}
function onClearToken() {
    clearAccessToken();
    uiLog('access token cleared');
}
async function onLogout() {
    try {
        await logout();
    }
    finally {
        isLoggedIn.value = false;
        clearAccessToken();
        uiLog('logged out');
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
if (!__VLS_ctx.isLoggedIn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "email",
    });
    (__VLS_ctx.email);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "password",
    });
    (__VLS_ctx.password);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.onLogin) },
    });
    if (__VLS_ctx.authError) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "error" },
        });
        (__VLS_ctx.authError);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.tokenPreview);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.loadProfile) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.loadAll) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.onClearToken) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.onLogout) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.apiResults, null, 2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.apiErrors, null, 2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (__VLS_ctx.logs.join('\n'));
}
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            email: email,
            password: password,
            isLoggedIn: isLoggedIn,
            authError: authError,
            apiResults: apiResults,
            apiErrors: apiErrors,
            logs: logs,
            tokenPreview: tokenPreview,
            onLogin: onLogin,
            loadProfile: loadProfile,
            loadAll: loadAll,
            onClearToken: onClearToken,
            onLogout: onLogout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
