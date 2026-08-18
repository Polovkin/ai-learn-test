Node.js Runtime
│
├── JavaScript Engine
│ └── V8
│
├── Runtime APIs
│ ├── fs
│ ├── http
│ ├── process
│ ├── Buffer
│ ├── timers
│ └── crypto
│
├── Async Runtime Layer
│ └── libuv
│ ├── Event Loop
│ ├── Thread Pool
│ ├── Async I/O
│ ├── Timers
│ └── OS bindings
│
├── Module System
│ ├── CommonJS
│ └── ES Modules
│
└── Operating System

Browser Runtime
│
├── JavaScript Engine
│ ├── V8 (Chrome)
│ ├── SpiderMonkey (Firefox)
│ └── JavaScriptCore (Safari)
│
├── Runtime APIs (Web APIs)
│ ├── DOM
│ ├── fetch
│ ├── setTimeout
│ ├── localStorage
│ ├── WebSocket
│ └── Geolocation
│
├── Async Runtime Layer
│ ├── Event Loop
│ ├── Task Queues
│ ├── Network Stack
│ ├── Timers
│ └── Browser Internals
│
├── Rendering System
│ ├── HTML Parser
│ ├── CSS Parser
│ ├── Layout
│ ├── Paint
│ └── Compositing
│
└── Operating System
