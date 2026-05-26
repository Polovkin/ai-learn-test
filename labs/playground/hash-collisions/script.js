const BUCKET_COUNT = 5;
const HASH_MULTIPLIER = 31;

const buckets = Array.from({ length: BUCKET_COUNT }, () => []);

function hash(key) {
  let hashValue = 0;

  for (let i = 0; i < key.length; i++) {
    hashValue = hashValue * HASH_MULTIPLIER + key.charCodeAt(i);
  }

  return Math.abs(hashValue) % BUCKET_COUNT;
}

function getHashWithSteps(key, steps) {
  steps.push(`key = "${key}"`);
  steps.push(`bucket count = ${BUCKET_COUNT}`);
  steps.push("hash starts from 0");

  let hashValue = 0;

  for (let i = 0; i < key.length; i++) {
    const char = key[i];
    const code = key.charCodeAt(i);
    const previousHash = hashValue;

    hashValue = hashValue * HASH_MULTIPLIER + code;

    steps.push(
      `hash = ${previousHash} * ${HASH_MULTIPLIER} + charCode("${char}") ${code} = ${hashValue}`
    );
  }

  const bucketIndex = Math.abs(hashValue) % BUCKET_COUNT;
  steps.push(`${Math.abs(hashValue)} % ${BUCKET_COUNT} = ${bucketIndex}`);
  steps.push(`go to bucket[${bucketIndex}]`);

  return bucketIndex;
}

function addKeyToHashMap(rawKey) {
  const key = rawKey.trim();
  const steps = [];

  if (!key) {
    return {
      ok: false,
      explain: "Please enter a key first.",
      steps: ["No key provided."],
      highlightedBucket: null,
      collisionBucket: null,
    };
  }

  const bucketIndex = getHashWithSteps(key, steps);
  const bucket = buckets[bucketIndex];

  let explain = `No collision. "${key}" goes to bucket[${bucketIndex}].`;
  let collisionBucket = null;

  if (bucket.length > 0) {
    const firstExisting = bucket[0];
    collisionBucket = bucketIndex;
    steps.push(`bucket[${bucketIndex}] already contains "${firstExisting}"`);
    steps.push("collision detected");
    explain = `Collision: ${firstExisting} and ${key} are in the same bucket.`;
  }

  bucket.push(key);
  steps.push(`add "${key}" to bucket[${bucketIndex}]`);

  return {
    ok: true,
    explain,
    steps,
    highlightedBucket: bucketIndex,
    collisionBucket,
  };
}

function findKeyInHashMap(rawKey) {
  const key = rawKey.trim();
  const steps = [];

  if (!key) {
    return {
      ok: false,
      explain: "Please enter a key first.",
      steps: ["No key provided."],
      highlightedBucket: null,
      collisionBucket: null,
    };
  }

  const bucketIndex = getHashWithSteps(key, steps);
  const bucket = buckets[bucketIndex];
  steps.push("do NOT scan all buckets");
  steps.push(`scan only values inside bucket[${bucketIndex}]`);

  let found = false;

  for (let i = 0; i < bucket.length; i += 1) {
    steps.push(`check bucket[${bucketIndex}][${i}] = "${bucket[i]}"`);

    if (bucket[i] === key) {
      found = true;
      steps.push(`found "${key}"`);
      break;
    }
  }

  if (!found) {
    steps.push(`"${key}" not found`);
  }

  return {
    ok: true,
    explain: found
      ? `Found "${key}" in bucket[${bucketIndex}].`
      : `"${key}" not found in bucket[${bucketIndex}].`,
    steps,
    highlightedBucket: bucketIndex,
    collisionBucket: null,
  };
}

const keyInput = document.getElementById("keyInput");
const addBtn = document.getElementById("addBtn");
const findBtn = document.getElementById("findBtn");
const bucketsEl = document.getElementById("buckets");
const stepsLogEl = document.getElementById("stepsLog");
const explainBox = document.getElementById("explainBox");
const exampleBtns = document.querySelectorAll(".example-btn");

let highlightedBucket = null;
let collisionBucket = null;

function renderBuckets() {
  bucketsEl.innerHTML = "";

  buckets.forEach((bucket, index) => {
    const card = document.createElement("div");
    card.className = "bucket";

    if (highlightedBucket === index) {
      card.classList.add("active");
    }

    if (collisionBucket === index) {
      card.classList.add("collision");
    }

    const title = document.createElement("div");
    title.className = "bucket-title";
    title.textContent = `bucket[${index}]`;

    const list = document.createElement("ul");
    list.className = "keys-list";

    if (bucket.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = "(empty)";
      list.appendChild(empty);
    } else {
      bucket.forEach((key) => {
        const item = document.createElement("li");
        item.textContent = key;
        list.appendChild(item);
      });
    }

    card.appendChild(title);
    card.appendChild(list);
    bucketsEl.appendChild(card);
  });
}

function renderSteps(steps) {
  stepsLogEl.innerHTML = "";

  steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsLogEl.appendChild(li);
  });
}

function applyResult(result) {
  explainBox.textContent = result.explain;
  highlightedBucket = result.highlightedBucket;
  collisionBucket = result.collisionBucket;
  renderSteps(result.steps);
  renderBuckets();
}

function getInputKey() {
  return keyInput.value;
}

addBtn.addEventListener("click", () => {
  applyResult(addKeyToHashMap(getInputKey()));
});

findBtn.addEventListener("click", () => {
  applyResult(findKeyInHashMap(getInputKey()));
});

exampleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;
    keyInput.value = key;
    applyResult(addKeyToHashMap(key));
  });
});

renderBuckets();
