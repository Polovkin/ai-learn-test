import "./style.css";

const data = [12, 28, 20, 45, 38, 60, 52, 111, 90, 75, 100, 80, 95, 110, 120];

const line = document.querySelector("#chart-line");
const points = document.querySelector("#points");

if (!line || !points) {
  throw new Error("Chart elements not found");
}

const width = 590;
const height = 300;
const left = 70;
const bottom = 330;
const max = Math.max(...data);

const coordinates = data.map((value, index) => {
  const x = left + (index * width) / (data.length - 1);
  const y = bottom - (value / max) * height;

  return { x, y, value };
});

line.setAttribute(
  "points",
  coordinates.map(({ x, y }) => `${x},${y}`).join(" "),
);

points.innerHTML = coordinates
  .map(
    ({ x, y, value }, index) => `
      <g class="data-point" tabindex="0">
        <title>Значення: ${value}</title>
        <circle class="point-halo" cx="${x}" cy="${y}" r="16" />
        <circle class="point" cx="${x}" cy="${y}" r="7" />
        <text class="value-label" x="${x}" y="${y - 18}" text-anchor="middle">
          ${value}
        </text>
      </g>
      <text class="axis-label" x="${x}" y="358" text-anchor="middle">
        ${index + 1}
      </text>
    `,
  )
  .join("");
