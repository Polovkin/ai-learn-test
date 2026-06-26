import { dialConfig, modulus, parties } from "./constants";
import { getDialPoint } from "./math";
import {
    canStepPublic,
    canStepShared,
    getPartyProgress,
    getSharedMatch,
} from "./state";
import type {
    DhState,
    DialTrace,
    DomElements,
    PartyDomElements,
    PartyId,
    Phase,
} from "./types";

const partyIds: PartyId[] = ["alice", "bob"];

function createSvgElement<K extends keyof SVGElementTagNameMap>(
    name: K,
): SVGElementTagNameMap[K] {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function createTraceId(partyId: PartyId, phase: Phase): string {
    return `${partyId}-${phase}`;
}

function getDialTraces(state: DhState): DialTrace[] {
    return partyIds.flatMap((partyId) => {
        const party = state.parties[partyId];

        return [
            {
                id: createTraceId(partyId, "public"),
                party: partyId,
                phase: "public",
                history: party.publicHistory,
            },
            {
                id: createTraceId(partyId, "shared"),
                party: partyId,
                phase: "shared",
                history: party.sharedHistory,
            },
        ];
    });
}

function renderTrace(dialElement: SVGSVGElement, trace: DialTrace): void {
    for (let index = 1; index < trace.history.length; index += 1) {
        const from = getDialPoint(trace.history[index - 1]);
        const to = getDialPoint(trace.history[index]);
        const line = createSvgElement("line");

        line.setAttribute("x1", String(from.x));
        line.setAttribute("y1", String(from.y));
        line.setAttribute("x2", String(to.x));
        line.setAttribute("y2", String(to.y));
        line.classList.add("dial-line", `dial-line-${trace.party}`, `dial-line-${trace.phase}`);

        dialElement.append(line);
    }
}

function getVisitedValues(traces: DialTrace[]): Set<number> {
    return new Set(traces.flatMap((trace) => trace.history));
}

function isCurrentValue(state: DhState, value: number): boolean {
    return partyIds.some((partyId) => {
        const party = state.parties[partyId];

        return party.publicPosition === value || party.sharedPosition === value;
    });
}

function renderDial(dialElement: SVGSVGElement, state: DhState): void {
    const traces = getDialTraces(state);
    const visitedValues = getVisitedValues(traces);
    const alicePublic = state.parties.alice.publicPosition;
    const bobPublic = state.parties.bob.publicPosition;
    const sharedKey = state.parties.alice.sharedPosition === state.parties.bob.sharedPosition
        ? state.parties.alice.sharedPosition
        : null;

    dialElement.innerHTML = "";
    traces.forEach((trace) => renderTrace(dialElement, trace));

    for (let value = 0; value < modulus; value += 1) {
        const point = getDialPoint(value);
        const circle = createSvgElement("circle");
        const label = createSvgElement("text");

        circle.setAttribute("cx", String(point.x));
        circle.setAttribute("cy", String(point.y));
        circle.setAttribute("r", String(dialConfig.pointRadius));
        circle.classList.add("dial-point");

        if (visitedValues.has(value)) {
            circle.classList.add("visited");
        }

        if (isCurrentValue(state, value)) {
            circle.classList.add("current");
        }

        if (value === alicePublic) {
            circle.classList.add("alice-public");
        }

        if (value === bobPublic) {
            circle.classList.add("bob-public");
        }

        if (sharedKey !== null && value === sharedKey) {
            circle.classList.add("shared-key");
        }

        label.setAttribute("x", String(point.x));
        label.setAttribute("y", String(point.y));
        label.textContent = String(value);
        label.classList.add("dial-label");

        if (isCurrentValue(state, value)) {
            label.classList.add("current");
        }

        dialElement.append(circle, label);
    }
}

function renderHistory(
    historyElement: HTMLOListElement,
    publicHistory: number[],
    sharedHistory: number[],
): void {
    historyElement.innerHTML = "";

    publicHistory.forEach((position, index) => {
        const item = document.createElement("li");
        item.textContent = `секретний шлях ${index}: ${position}`;
        historyElement.append(item);
    });

    sharedHistory.forEach((position, index) => {
        const item = document.createElement("li");
        item.textContent = `ключ ${index}: ${position}`;
        item.classList.add("shared-history-item");
        historyElement.append(item);
    });
}

function renderParty(
    elements: PartyDomElements,
    state: DhState,
    partyId: PartyId,
): void {
    const party = state.parties[partyId];
    const progress = getPartyProgress(state, partyId);
    const otherPartyId = parties[partyId].sharedFromParty;
    const otherParty = state.parties[otherPartyId];

    elements.publicSteps.textContent = String(party.publicSteps);
    elements.publicPosition.textContent = String(party.publicPosition);
    elements.publicFormula.textContent = party.publicFormula;
    elements.publicButton.disabled = !canStepPublic(state, partyId);

    elements.sharedSteps.textContent = String(party.sharedSteps);
    elements.sharedPosition.textContent = party.sharedPosition === null
        ? "-"
        : String(party.sharedPosition);
    if (party.sharedSteps === 0 && otherParty.publicSteps < parties[otherPartyId].secretSteps) {
        elements.sharedFormula.textContent =
            `Чекає публічне число від ${parties[otherPartyId].name}`;
    } else if (party.sharedSteps === 0) {
        elements.sharedFormula.textContent =
            `Вхід: ${otherParty.publicPosition}. Обчислення ключа ще не почалось.`;
    } else {
        elements.sharedFormula.textContent = party.sharedFormula;
    }
    elements.sharedButton.disabled = !canStepShared(state, partyId);
    elements.sharedKey.textContent = party.sharedPosition === null
        ? "?"
        : String(party.sharedPosition);

    elements.publicButton.textContent = progress.publicDone
        ? "Публічне число готове"
        : `Крок ${parties[partyId].name}`;
    elements.sharedButton.textContent = progress.sharedDone
        ? "Спільний ключ готовий"
        : "Наступний крок ключа";

    renderHistory(elements.history, party.publicHistory, party.sharedHistory);
}

function renderSharedStatus(sharedStatusElement: HTMLElement, state: DhState): void {
    const alice = state.parties.alice;
    const bob = state.parties.bob;
    const bothPublicReady = alice.publicSteps === parties.alice.secretSteps
        && bob.publicSteps === parties.bob.secretSteps;
    const bothSharedReady = alice.sharedSteps === parties.alice.secretSteps
        && bob.sharedSteps === parties.bob.secretSteps;

    sharedStatusElement.classList.remove("success", "waiting");

    if (!bothPublicReady) {
        sharedStatusElement.textContent =
            "Секретні лічильники ще крутяться. Публічними стануть тільки фінальні числа: 8 від Аліси і 19 від Колі.";
        sharedStatusElement.classList.add("waiting");
        return;
    }

    if (!bothSharedReady) {
        sharedStatusElement.textContent =
            "Публічні числа вже відомі: Аліса сказала 8, Коля сказав 19. Тепер кожен рахує ключ зі своїм секретним лічильником.";
        sharedStatusElement.classList.add("waiting");
        return;
    }

    if (getSharedMatch(state)) {
        sharedStatusElement.textContent =
            `Збіглось: Аліса і Коля отримали ${alice.sharedPosition}. Це і є спільний секрет.`;
        sharedStatusElement.classList.add("success");
        return;
    }

    sharedStatusElement.textContent = "Не збіглось. Десь у кроках помилка.";
}

export function renderApp(elements: DomElements, state: DhState): void {
    renderParty(elements.alice, state, "alice");
    renderParty(elements.bob, state, "bob");
    renderSharedStatus(elements.sharedStatus, state);
    renderDial(elements.dial, state);
}
