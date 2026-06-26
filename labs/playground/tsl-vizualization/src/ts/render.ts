import { dialConfig, modulus } from "./constants";
import { getDialPoint } from "./math";
import type { DomElements, TslState } from "./types";

function createSvgElement<K extends keyof SVGElementTagNameMap>(
    name: K,
): SVGElementTagNameMap[K] {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function renderHistory(historyElement: HTMLOListElement, history: number[]): void {
    historyElement.innerHTML = "";

    history.forEach((position, index) => {
        const item = document.createElement("li");
        item.textContent = `${index}: ${position}`;
        historyElement.append(item);
    });
}

function renderDial(dialElement: SVGSVGElement, state: TslState): void {
    dialElement.innerHTML = "";

    for (let index = 1; index < state.history.length; index += 1) {
        const from = getDialPoint(state.history[index - 1]);
        const to = getDialPoint(state.history[index]);
        const line = createSvgElement("line");

        line.setAttribute("x1", String(from.x));
        line.setAttribute("y1", String(from.y));
        line.setAttribute("x2", String(to.x));
        line.setAttribute("y2", String(to.y));
        line.classList.add("dial-line");

        dialElement.append(line);
    }

    for (let value = 0; value < modulus; value += 1) {
        const point = getDialPoint(value);
        const wasVisited = state.history.includes(value);
        const isCurrent = value === state.current;
        const circle = createSvgElement("circle");
        const label = createSvgElement("text");

        circle.setAttribute("cx", String(point.x));
        circle.setAttribute("cy", String(point.y));
        circle.setAttribute("r", String(dialConfig.pointRadius));
        circle.classList.add("dial-point");

        if (wasVisited) {
            circle.classList.add("visited");
        }

        if (isCurrent) {
            circle.classList.add("current");
        }

        label.setAttribute("x", String(point.x));
        label.setAttribute("y", String(point.y));
        label.textContent = String(value);
        label.classList.add("dial-label");

        if (isCurrent) {
            label.classList.add("current");
        }

        dialElement.append(circle, label);
    }
}

function renderCycleStatus(cycleStatusElement: HTMLElement, state: TslState): void {
    const previousVisitIndex = state.history.findIndex((position, index) => (
        position === state.current && index !== state.history.length - 1
    ));

    if (previousVisitIndex === -1) {
        cycleStatusElement.textContent = "Цикл ще не замкнувся.";
        cycleStatusElement.classList.remove("cycle");
        return;
    }

    cycleStatusElement.textContent =
        `Цикл замкнувся: позиція ${state.current} вже була на кроці ${previousVisitIndex}. Довжина циклу: ${state.steps - previousVisitIndex}.`;
    cycleStatusElement.classList.add("cycle");
}

export function renderApp(elements: DomElements, state: TslState): void {
    elements.current.textContent = String(state.current);
    elements.steps.textContent = String(state.steps);
    elements.calculation.textContent = state.calculation;

    renderCycleStatus(elements.cycleStatus, state);
    renderHistory(elements.history, state.history);
    renderDial(elements.dial, state);
}
