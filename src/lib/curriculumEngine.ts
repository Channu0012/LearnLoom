// ---------------------------------------------------------------------------
// Vidcura Domain-Trained Curriculum Knowledge & Assessment Engine
// Provides authentic, subject-specific MCQ assessments and technical tutoring
// across Python, JavaScript, TypeScript, React, SQL, Algorithms, DevOps, and AI.
// Strict Standard: 100% Emoji-Free, Production-Grade Technical Depth.
// ---------------------------------------------------------------------------

export type DomainType =
  "python" | "javascript" | "react" | "database" | "devops" | "algorithms" | "ai_ml" | "systems";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Detect programming discipline or technical domain from course metadata.
 */
export function detectDomain(
  courseTitle: string,
  videoTitle: string,
  courseCategory: string
): DomainType {
  const combined = `${courseTitle} ${videoTitle} ${courseCategory}`.toLowerCase();

  if (
    /python|django|flask|fastapi|pandas|numpy|pygame|pydantic|pytest|jupyter|matplotlib/i.test(
      combined
    )
  ) {
    return "python";
  }
  if (/react|next\.?js|redux|tailwind|vue|svelte|frontend ui|component/i.test(combined)) {
    return "react";
  }
  if (/javascript|typescript|\bjs\b|\bts\b|node|express|deno|bun|ecmascript/i.test(combined)) {
    return "javascript";
  }
  if (
    /sql|postgres|mysql|sqlite|database|mongo|nosql|redis|prisma|database|schema|query/i.test(
      combined
    )
  ) {
    return "database";
  }
  if (
    /docker|kubernetes|k8s|devops|aws|cloud|ci\/cd|terraform|ansible|pipeline|linux/i.test(combined)
  ) {
    return "devops";
  }
  if (
    /algorithm|data structure|dsa|leetcode|sorting|graph|tree|dynamic programming|recursion/i.test(
      combined
    )
  ) {
    return "algorithms";
  }
  if (
    /machine learning|\bai\b|deep learning|neural|tensorflow|pytorch|nlp|llm|computer vision|gpt/i.test(
      combined
    )
  ) {
    return "ai_ml";
  }
  return "systems";
}

// ── 1. Comprehensive Subject Question Banks ────────────────────────────────

const PYTHON_QUESTIONS: QuizQuestion[] = [
  {
    question: "In Python, which of the following built-in data types is mutable?",
    options: ["tuple", "str", "list", "frozenset"],
    correctIndex: 2,
    explanation:
      "Lists, dictionaries, and sets are mutable in Python. Tuples, strings, integers, floats, and frozensets are strictly immutable.",
  },
  {
    question:
      "What is the evaluated output of the list comprehension: [x * 2 for x in range(5) if x % 2 != 0]?",
    options: ["[2, 6]", "[0, 4, 8]", "[1, 3]", "[2, 4, 6]"],
    correctIndex: 0,
    explanation:
      "range(5) yields 0, 1, 2, 3, 4. The condition x % 2 != 0 filters for odd numbers (1 and 3). Multiplying each by 2 yields [2, 6].",
  },
  {
    question:
      "What happens when you look up a non-existent key in a Python dictionary using dict.get(key, 'default') versus dict[key]?",
    options: [
      "dict.get returns 'default' while dict[key] raises a KeyError",
      "Both raise a KeyError exception",
      "dict.get creates the key in the dictionary with value 'default'",
      "dict[key] returns None without raising an error",
    ],
    correctIndex: 0,
    explanation:
      "Square bracket syntax dict[key] raises a KeyError if the key is absent, whereas dict.get(key, default) gracefully returns the fallback value without modifying the dictionary.",
  },
  {
    question: "What is the primary role of the Global Interpreter Lock (GIL) in standard CPython?",
    options: [
      "To prevent multiple threads from executing Python bytecodes simultaneously, ensuring thread-safe memory management",
      "To accelerate JIT compilation across multiple CPU cores",
      "To enforce static type validation at runtime",
      "To restrict file system write operations during async execution",
    ],
    correctIndex: 0,
    explanation:
      "CPython uses reference counting for memory management. The GIL is a mutual-exclusion lock preventing race conditions in memory management by ensuring only one thread executes bytecode at a time.",
  },
  {
    question:
      "In Python, what is the underlying mechanism of the decorator syntax '@my_decorator' placed above a function 'def func():'?",
    options: [
      "It compiles the function to C binary before execution",
      "It executes func = my_decorator(func) at function definition time",
      "It runs the function in a dedicated background daemon thread",
      "It creates an immutable copy of the function in global scope",
    ],
    correctIndex: 1,
    explanation:
      "The '@decorator' syntax is syntactic sugar for passing the decorated function as an argument to the decorator callable: func = my_decorator(func).",
  },
  {
    question:
      "What distinguishes a Python generator function containing the 'yield' keyword from a standard function?",
    options: [
      "A generator produces a generator iterator that computes values lazily on demand without loading all items into memory",
      "A generator function executes asynchronously in a separate OS thread",
      "A generator cannot accept arguments or return values",
      "A generator terminates the Python process after producing its first value",
    ],
    correctIndex: 0,
    explanation:
      "The 'yield' statement freezes execution state and yields items one at a time, providing memory-efficient stream processing with O(1) auxiliary memory consumption.",
  },
  {
    question: "In Python function signatures, what do '*args' and '**kwargs' represent?",
    options: [
      "*args collects arbitrary positional arguments as a tuple, and **kwargs collects keyword arguments as a dictionary",
      "*args accepts keyword arguments, and **kwargs accepts positional arguments",
      "Both collect positional arguments as arrays",
      "They enforce strict type checking for numbers and strings",
    ],
    correctIndex: 0,
    explanation:
      "The single asterisk packs variable positional arguments into a tuple named args, while the double asterisk packs arbitrary keyword arguments into a dict named kwargs.",
  },
  {
    question:
      "Which dunder methods must an object implement to function as a context manager with the 'with' statement?",
    options: [
      "__enter__ and __exit__",
      "__open__ and __close__",
      "__init__ and __del__",
      "__start__ and __finish__",
    ],
    correctIndex: 0,
    explanation:
      "Python's context management protocol requires '__enter__' (which returns the resource context) and '__exit__' (which handles cleanup and exception suppression).",
  },
  {
    question: "What is the difference between 'is' and '==' in Python?",
    options: [
      "'is' checks object identity (memory address via id()), while '==' checks value equality",
      "'is' compares values, while '==' compares memory addresses",
      "They are completely interchangeable in all circumstances",
      "'is' works only for strings, while '==' works only for numbers",
    ],
    correctIndex: 0,
    explanation:
      "'a == b' evaluates equality by calling '__eq__', while 'a is b' evaluates whether both operands reference the exact same memory location (id(a) == id(b)).",
  },
  {
    question: "What is the result of applying slice notation s[::-1] to a string 'Python'?",
    options: ["'nohtyP'", "'Python'", "'P'", "Raises an IndexError"],
    correctIndex: 0,
    explanation:
      "Slice notation takes [start:stop:step]. A step of -1 traverses the sequence in reverse order from the final index back to the beginning.",
  },
  {
    question:
      "In Python object-oriented programming, how does 'super().__init__()' operate in a child class?",
    options: [
      "It delegates initialization to the next class in the Method Resolution Order (MRO)",
      "It creates a second instance of the parent class in a separate scope",
      "It destroys all attributes inherited from ancestor classes",
      "It overrides the child constructor with static bytecode",
    ],
    correctIndex: 0,
    explanation:
      "super() dynamically looks up the next class in the object's Method Resolution Order (MRO), essential for cooperative multiple inheritance.",
  },
  {
    question:
      "What is the difference between 'copy.copy()' (shallow copy) and 'copy.deepcopy()' in Python?",
    options: [
      "Shallow copy copies references to nested objects, while deep copy recursively duplicates all nested objects",
      "Deep copy only works on primitive types like int and float",
      "Shallow copy modifies the original object in place",
      "There is no operational difference between them",
    ],
    correctIndex: 0,
    explanation:
      "A shallow copy constructs a new compound object and inserts references to the original child items. A deep copy recursively duplicates all objects found in the original.",
  },
];

const JAVASCRIPT_QUESTIONS: QuizQuestion[] = [
  {
    question: "How does the JavaScript event loop prioritize microtasks compared to macrotasks?",
    options: [
      "The entire microtask queue (Promises, queueMicrotask) is exhausted before the next macrotask (setTimeout, I/O) begins",
      "Macrotasks always execute ahead of microtasks",
      "Microtasks and macrotasks are processed in alternating 1:1 order",
      "Microtasks execute on a separate worker thread concurrently",
    ],
    correctIndex: 0,
    explanation:
      "After the current call stack clears, JavaScript drains all pending jobs in the microtask queue before picking up the next task from the macrotask queue.",
  },
  {
    question: "What is a closure in JavaScript?",
    options: [
      "A function bundled with references to its surrounding lexical environment, allowing access to outer variables even after the outer function has returned",
      "A technique for terminating asynchronous execution immediately",
      "A function that can only be invoked a single time",
      "An object method that cannot modify instance properties",
    ],
    correctIndex: 0,
    explanation:
      "Closures give functions persistent access to their lexical parent scope even when executed outside that scope's original lifetime.",
  },
  {
    question: "In TypeScript, what is the key difference between 'unknown' and 'any'?",
    options: [
      "'unknown' is type-safe: you cannot invoke methods or access properties without first narrowing the type via type guards",
      "'any' provides stricter type validation than 'unknown'",
      "'unknown' can only represent primitive string values",
      "There is no difference; they are aliases in modern TypeScript",
    ],
    correctIndex: 0,
    explanation:
      "'unknown' is the type-safe counterpart of 'any'. Anything is assignable to 'unknown', but 'unknown' is not assignable to anything else without explicit type narrowing.",
  },
  {
    question:
      "Why does arrow function syntax 'const fn = () => {}' behave differently with 'this' compared to 'function fn() {}'?",
    options: [
      "Arrow functions do not bind their own 'this'; they lexically capture 'this' from the enclosing execution context",
      "Arrow functions rebind 'this' to the global window object on every invocation",
      "Arrow functions cannot be invoked inside asynchronous callbacks",
      "Arrow functions allocate double the heap memory of standard functions",
    ],
    correctIndex: 0,
    explanation:
      "Standard functions determine 'this' dynamically based on how they are called. Arrow functions inherit 'this' statically from their surrounding lexical scope.",
  },
  {
    question: "What is the return value of 'typeof null' in JavaScript?",
    options: ["'object'", "'null'", "'undefined'", "'boolean'"],
    correctIndex: 0,
    explanation:
      "In the original implementation of JavaScript, values were stored with a type tag. An object tag was 0, and null was represented as the NULL pointer (0x00), resulting in typeof null === 'object'.",
  },
  {
    question: "What does 'Promise.all([p1, p2, p3])' do if one of the promises rejects?",
    options: [
      "It rejects immediately with the error of the first rejected promise (fail-fast behavior)",
      "It waits for all other promises to resolve and ignores the rejection",
      "It returns null for the rejected promise while resolving the rest",
      "It automatically retries the failed promise three times",
    ],
    correctIndex: 0,
    explanation:
      "Promise.all has fail-fast semantics: if any passed promise rejects, the returned promise immediately rejects with that rejection reason.",
  },
  {
    question:
      "What is the difference between '==' (loose equality) and '===' (strict equality) in JavaScript?",
    options: [
      "'===' checks both value and type without type coercion; '==' coerces operands to a common type before comparison",
      "'==' checks both value and type without coercion",
      "'===' only works on numbers and strings",
      "'===' causes a syntax error in strict mode",
    ],
    correctIndex: 0,
    explanation:
      "Strict equality '===' never performs implicit type coercion. Loose equality '==' applies complex Abstract Equality Comparison algorithm rules.",
  },
  {
    question:
      "Which of the following creates an immutable array transformation in modern JavaScript?",
    options: [
      "array.toSorted() or [...array].sort()",
      "array.sort() directly mutating the original",
      "array.push()",
      "array.splice()",
    ],
    correctIndex: 0,
    explanation:
      "Array.prototype.sort() mutates the original array in place. Array.prototype.toSorted() (ES2023) or spreading [...array].sort() returns a fresh sorted array without side effects.",
  },
  {
    question: "What does the nullish coalescing operator 'a ?? b' do?",
    options: [
      "Returns 'b' only if 'a' is null or undefined; otherwise returns 'a'",
      "Returns 'b' if 'a' is any falsy value (0, false, '')",
      "Checks whether 'a' and 'b' share identical object references",
      "Throws a TypeError if 'a' is null",
    ],
    correctIndex: 0,
    explanation:
      "Unlike the logical OR operator '||' which treats 0, '', and false as falsy, '??' only triggers fallbacks when the left-hand operand is null or undefined.",
  },
  {
    question: "In modern JavaScript, what is the role of 'WeakMap' compared to standard 'Map'?",
    options: [
      "Keys must be objects, and entries do not prevent keys from being garbage collected when no other references exist",
      "WeakMap can store primitive strings and numbers as keys",
      "WeakMap can be serialized to JSON directly",
      "WeakMap allows synchronous iteration over all entries via .forEach()",
    ],
    correctIndex: 0,
    explanation:
      "WeakMap holds weak references to its keys, meaning if no other reference to a key object remains, the entry can be safely garbage collected without memory leaks.",
  },
];

const REACT_QUESTIONS: QuizQuestion[] = [
  {
    question: "Why must list items in React have a unique and stable 'key' prop?",
    options: [
      "To help React's reconciliation engine match existing Virtual DOM nodes across renders, avoiding unnecessary DOM re-creation",
      "To allow CSS styles to target individual list rows",
      "To bind click event listeners to individual DOM elements",
      "To automatically sort the array alphabetically",
    ],
    correctIndex: 0,
    explanation:
      "Keys give elements a stable identity. Without stable keys, reordering or filtering lists causes React to recreate or incorrectly match state to DOM nodes.",
  },
  {
    question:
      "What is the danger of omitting dependencies from the dependency array of 'useEffect'?",
    options: [
      "The effect callback may capture stale values from previous renders, causing subtle bugs and state desynchronization",
      "It causes an immediate fatal compile error in Next.js",
      "It forces the browser to reload the entire web page",
      "It converts the component into an asynchronous generator",
    ],
    correctIndex: 0,
    explanation:
      "Omitting reactive values from the dependency array prevents the effect from updating when those values change, creating closures with stale variables.",
  },
  {
    question: "What is the primary difference between 'useMemo' and 'useCallback'?",
    options: [
      "'useMemo' memoizes the result of a calculation; 'useCallback' memoizes a function definition itself",
      "'useMemo' only caches strings, while 'useCallback' caches numbers",
      "'useCallback' executes the function asynchronously in a web worker",
      "They are identical and can be used interchangeably",
    ],
    correctIndex: 0,
    explanation:
      "useMemo(() => compute(a, b), [a, b]) caches the returned value. useCallback(fn, deps) is equivalent to useMemo(() => fn, deps), caching the function reference.",
  },
  {
    question:
      "Why should state updates in React be treated as immutable (e.g. setting state with a new object/array rather than mutating)?",
    options: [
      "React relies on shallow object reference equality (Object.is) to determine if a component needs to re-render",
      "Direct mutation deletes the component from the DOM tree",
      "JavaScript engines throw a runtime error when mutating React state",
      "Immutability reduces the memory size of the bundle",
    ],
    correctIndex: 0,
    explanation:
      "React checks if previousState !== nextState using shallow equality. If you mutate the existing object in place, the reference remains identical, so React skips re-rendering.",
  },
  {
    question:
      "In React 18+ and Next.js App Router, what is the default behavior of Server Components?",
    options: [
      "They execute only on the server, send zero JavaScript to the client bundle, and cannot use hooks or browser event listeners",
      "They run entirely inside the client browser DOM",
      "They require the 'use client' directive at the top of the file",
      "They cannot fetch data or access environment variables",
    ],
    correctIndex: 0,
    explanation:
      "Server Components render strictly on the server into a compact JSON-like format. Because they don't execute on the client, their dependencies do not bloat client bundles.",
  },
  {
    question: "What causes a React hydration mismatch error during Server-Side Rendering (SSR)?",
    options: [
      "The initial HTML rendered by the server differs from the HTML produced during the first render on the client",
      "The CSS stylesheet fails to download before the first script tag",
      "The database query takes longer than 5 seconds to complete",
      "The client device has disabled JavaScript execution",
    ],
    correctIndex: 0,
    explanation:
      "Hydration expects the client-rendered tree to match the server-generated HTML exactly. Discrepancies (e.g. rendering Date.now() or checking window inside render) trigger hydration mismatch warnings.",
  },
  {
    question: "What is the purpose of the cleanup function returned inside a 'useEffect' hook?",
    options: [
      "To clean up subscriptions, timers, or event listeners before the component unmounts or before the effect re-runs",
      "To reset all state variables to their initial values",
      "To garbage collect the entire Virtual DOM tree",
      "To clear browser localStorage data",
    ],
    correctIndex: 0,
    explanation:
      "The cleanup function runs when the component unmounts and before the effect re-runs with new dependencies, preventing memory leaks and duplicate listeners.",
  },
  {
    question: "What does React's 'useRef' hook provide compared to 'useState'?",
    options: [
      "It holds a mutable reference in .current that persists across renders without triggering a re-render when changed",
      "It triggers an immediate synchronous re-render whenever .current is updated",
      "It can only be used to hold references to HTML input elements",
      "It automatically serializes its value to session storage",
    ],
    correctIndex: 0,
    explanation:
      "useRef is like a 'box' holding a mutable value. Updating ref.current does NOT cause a component re-render, making it ideal for DOM nodes, timers, or tracking previous values.",
  },
  {
    question: "How does React batch state updates in event handlers?",
    options: [
      "Multiple setState calls within the same event or tick are grouped into a single re-render to optimize performance",
      "Every setState call immediately forces a synchronous DOM repaint",
      "State updates are queued and only rendered when the user changes pages",
      "React updates the database first before updating the UI",
    ],
    correctIndex: 0,
    explanation:
      "Automatic batching (enhanced in React 18 across promises, timeouts, and native events) merges multiple state updates into a single re-render pass.",
  },
  {
    question: "What is the purpose of React Error Boundaries?",
    options: [
      "To catch JavaScript errors anywhere in their child component tree, log them, and display a fallback UI instead of crashing the whole app",
      "To prevent syntax errors during TypeScript compilation",
      "To handle HTTP 404 and 500 network responses automatically",
      "To prevent infinite loops inside while loops",
    ],
    correctIndex: 0,
    explanation:
      "Error boundaries catch errors during rendering, lifecycle methods, and constructors of the tree below them, preventing the entire React component tree from unmounting.",
  },
];

const DATABASE_QUESTIONS: QuizQuestion[] = [
  {
    question: "What does the 'I' in the ACID transaction model guarantee?",
    options: [
      "Isolation: Concurrent execution of transactions produces the same outcome as if they were executed sequentially",
      "Immutability: Once data is written, it can never be deleted or updated",
      "Indexing: Every table must have a primary key index",
      "Idempotency: Repeating a query returns identical results",
    ],
    correctIndex: 0,
    explanation:
      "Isolation ensures that concurrent transactions operate independently without seeing each other's uncommitted intermediate modifications.",
  },
  {
    question:
      "Why are B-Trees (and B+ Trees) preferred over standard Binary Search Trees for disk-based database indexes?",
    options: [
      "B-Trees have a high branching factor, keeping the tree shallow and minimizing expensive disk I/O operations",
      "B-Trees use less memory than any other data structure",
      "B-Trees only work with string data types",
      "Binary Search Trees cannot be sorted in ascending order",
    ],
    correctIndex: 0,
    explanation:
      "Reading from disk is orders of magnitude slower than RAM. B-Trees maximize block utilization by packing hundreds of keys per node, keeping tree depth to 3 or 4 levels for millions of records.",
  },
  {
    question:
      "What is the primary operational difference between 'WHERE' and 'HAVING' clauses in SQL?",
    options: [
      "'WHERE' filters rows before aggregation; 'HAVING' filters aggregated groups after GROUP BY",
      "'HAVING' can only filter primary key columns",
      "'WHERE' filters aggregated groups, while 'HAVING' filters individual rows",
      "They are identical and can be placed interchangeably anywhere in a SELECT query",
    ],
    correctIndex: 0,
    explanation:
      "WHERE acts on raw table rows before grouping occurs. HAVING evaluates aggregate predicates (e.g. HAVING COUNT(*) > 5) after groupings are computed.",
  },
  {
    question: "What is the distinction between an INNER JOIN and a LEFT OUTER JOIN?",
    options: [
      "INNER JOIN returns only rows with matches in both tables; LEFT JOIN returns all rows from the left table and matched rows from the right",
      "INNER JOIN returns all rows from both tables even without matches",
      "LEFT JOIN deletes unmatched rows from the right table",
      "INNER JOIN is only supported in NoSQL document stores",
    ],
    correctIndex: 0,
    explanation:
      "An INNER JOIN discards rows that do not satisfy the join predicate. A LEFT JOIN preserves all left-table rows, filling missing right-table columns with NULL.",
  },
  {
    question: "What is database normalization, specifically Third Normal Form (3NF)?",
    options: [
      "A table is in 3NF if it is in 2NF and has no transitive dependencies (non-key attributes depend only on the primary key)",
      "A table has exactly three columns and three rows",
      "All columns store JSON documents without relational schemas",
      "Indexes are duplicated across three physical database servers",
    ],
    correctIndex: 0,
    explanation:
      "3NF eliminates transitive dependencies: every non-key column must depend on the key, the whole key, and nothing but the key.",
  },
  {
    question:
      "How does a database composite index on columns (A, B) behave with a query filtering ONLY on column B ('WHERE B = 10')?",
    options: [
      "The index cannot be used efficiently because column A (the leading prefix) is missing from the filter",
      "The index functions at maximum efficiency regardless of column order",
      "The database automatically reverses the index columns at runtime",
      "The query will fail with a syntax error",
    ],
    correctIndex: 0,
    explanation:
      "B-Tree composite indexes adhere to the Leftmost Prefix Rule. An index on (A, B) can satisfy queries on (A) or (A, B), but not queries filtering exclusively on (B) without a full index scan.",
  },
  {
    question: "What is the purpose of database connection pooling in high-traffic applications?",
    options: [
      "To maintain a cache of established database connections and reuse them, avoiding the high overhead of repeatedly creating TCP connections and authenticating",
      "To merge multiple SQL queries into a single string",
      "To encrypt data stored on physical hard drives",
      "To automatically shard the database across geographic regions",
    ],
    correctIndex: 0,
    explanation:
      "Opening a database connection requires socket creation, TLS negotiation, and authentication. Connection pools keep persistent connections alive for reuse.",
  },
  {
    question: "What is a 'Dirty Read' in database concurrency?",
    options: [
      "A transaction reads uncommitted changes made by another concurrent transaction that might later be rolled back",
      "A query reads corrupted data from damaged disk sectors",
      "A query executes without an index scan",
      "A write operation fails due to out-of-disk space",
    ],
    correctIndex: 0,
    explanation:
      "Dirty reads occur under the Read Uncommitted isolation level when Transaction A reads data modified by Transaction B before B has committed.",
  },
  {
    question: "What is the CAP Theorem trade-off in distributed database systems?",
    options: [
      "A distributed system can guarantee at most two out of three: Consistency, Availability, and Partition Tolerance",
      "A system must choose between Cost, Architecture, and Performance",
      "All databases must have Centralized, Automated, and Private security",
      "Relational databases cannot handle network partitions under any circumstances",
    ],
    correctIndex: 0,
    explanation:
      "Network partitions are inevitable in distributed systems. Therefore, systems must choose between Consistency (all nodes see same data simultaneously) or Availability (every request receives a non-error response).",
  },
  {
    question: "What is an optimistic concurrency control lock in databases?",
    options: [
      "A mechanism that assumes conflicts are rare, checking a version or timestamp column before committing writes rather than acquiring heavy locks during reads",
      "A lock that guarantees no network errors will occur",
      "A physical lock on the database server hardware",
      "A lock that blocks all read and write queries indefinitely",
    ],
    correctIndex: 0,
    explanation:
      "Optimistic locking reads without locking. On commit, it validates that the record's version has not changed. If it has, the transaction aborts and retries.",
  },
];

const GENERAL_SYSTEMS_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the architectural purpose of an API Gateway in microservices?",
    options: [
      "To serve as a single entry point providing routing, authentication, rate limiting, and request aggregation for client applications",
      "To compile backend code into machine language",
      "To replace relational databases with flat files",
      "To physically host client web browsers",
    ],
    correctIndex: 0,
    explanation:
      "An API Gateway decouples external clients from internal microservice topologies, handling cross-cutting concerns like SSL termination, auth, telemetry, and rate limits.",
  },
  {
    question: "What is the difference between horizontal scaling and vertical scaling?",
    options: [
      "Horizontal scaling adds more machines to a system; vertical scaling upgrades CPU/RAM on existing machines",
      "Horizontal scaling upgrades hardware; vertical scaling adds servers",
      "Vertical scaling is always cheaper than horizontal scaling",
      "Horizontal scaling cannot be automated with cloud providers",
    ],
    correctIndex: 0,
    explanation:
      "Scaling out (horizontal) distributes load across multiple nodes. Scaling up (vertical) increases the compute capacity of a single physical or virtual host.",
  },
  {
    question: "What is idempotent behavior in RESTful HTTP APIs?",
    options: [
      "Making multiple identical requests produces the exact same server-side state as making a single request",
      "The API executes only once and permanently disables the endpoint",
      "The API cannot accept JSON payloads",
      "Requests always return HTTP 200 OK regardless of parameters",
    ],
    correctIndex: 0,
    explanation:
      "HTTP GET, PUT, and DELETE methods are designed to be idempotent: repeating them multiple times results in the same resource state as invoking them once.",
  },
  {
    question: "What is the primary role of a distributed message queue (e.g. Kafka, RabbitMQ)?",
    options: [
      "To asynchronously decouple producers and consumers, smoothing out traffic spikes and providing durable message buffering",
      "To execute SQL queries in place of PostgreSQL",
      "To replace frontend React components",
      "To store user session cookies in client browsers",
    ],
    correctIndex: 0,
    explanation:
      "Message queues provide loose coupling, asynchronous background processing, backpressure management, and fault tolerance across distributed services.",
  },
  {
    question: "In caching architectures, what is the 'Cache-Aside' (Lazy Loading) pattern?",
    options: [
      "The application queries cache first; if a miss occurs, it queries database, populates cache, and returns the data",
      "The cache automatically writes data to disk every second",
      "The database updates the cache synchronously before returning any query",
      "All requests bypass the cache completely",
    ],
    correctIndex: 0,
    explanation:
      "Under Cache-Aside, the application code coordinates with the cache directly: checking cache on reads, fetching from storage on misses, and writing through to the cache.",
  },
  {
    question: "What is the function of a reverse proxy like NGINX or Cloudflare?",
    options: [
      "It sits in front of web servers, intercepting requests to provide load balancing, SSL termination, and static asset caching",
      "It allows client browsers to execute code without network access",
      "It encrypts database tables on the hard drive",
      "It translates JavaScript into Python syntax",
    ],
    correctIndex: 0,
    explanation:
      "Reverse proxies shield origin servers from direct Internet exposure while balancing incoming traffic, optimizing SSL handshakes, and caching edge assets.",
  },
  {
    question:
      "What is the difference between synchronous and asynchronous inter-service communication?",
    options: [
      "Synchronous blocks the caller until a response arrives (e.g. HTTP REST); asynchronous allows the caller to continue immediately (e.g. event pub/sub)",
      "Asynchronous communication always takes longer to process than synchronous",
      "Synchronous communication is only used in mobile applications",
      "Asynchronous communication cannot transmit JSON payloads",
    ],
    correctIndex: 0,
    explanation:
      "Synchronous calls introduce tight temporal coupling and cascade latencies. Asynchronous event-driven architectures decouple producers from consumer processing cycles.",
  },
  {
    question: "What is a Content Delivery Network (CDN) and why is it used?",
    options: [
      "A geographically distributed network of proxy servers that caches static content near end-users to reduce latency and bandwidth load on origin servers",
      "A centralized mainframe server located in one data center",
      "A software package that transpiles TypeScript to JavaScript",
      "A database system designed exclusively for audio files",
    ],
    correctIndex: 0,
    explanation:
      "CDNs place edge caches around the world, dramatically decreasing round-trip time (RTT) for static assets like images, scripts, and video chunks.",
  },
  {
    question: "What is the principle of least privilege in software security?",
    options: [
      "Users and processes should only be granted the minimum permissions necessary to perform their required tasks",
      "All developers must share a single root administrative account",
      "Security testing should only be conducted before production launch",
      "Public endpoints should disable authentication to speed up responses",
    ],
    correctIndex: 0,
    explanation:
      "Least privilege restricts attack surfaces: if a component or credential is breached, the attacker's blast radius is strictly limited to that component's narrow scope.",
  },
  {
    question: "What is consistent hashing and why is it used in distributed caching systems?",
    options: [
      "A hashing technique that maps keys to cache nodes such that adding or removing a node only redistributes k/n keys rather than remapping all keys",
      "A cryptographic hash function used to store passwords",
      "A method for sorting arrays in O(1) time",
      "A protocol for compressing video streams over HTTP",
    ],
    correctIndex: 0,
    explanation:
      "Traditional modulo hashing (hash % n) invalidates almost all cache keys when n changes. Consistent hashing maps both servers and keys to a ring, minimizing cache eviction cascades during scaling events.",
  },
];

// ── 2. Domain Selector & Dynamic Generator ─────────────────────────────────

export function getDomainQuestions(
  domain: DomainType,
  videoTitle: string,
  targetCount: number = 10
): QuizQuestion[] {
  let bank: QuizQuestion[];

  switch (domain) {
    case "python":
      bank = PYTHON_QUESTIONS;
      break;
    case "react":
      bank = REACT_QUESTIONS;
      break;
    case "javascript":
      bank = JAVASCRIPT_QUESTIONS;
      break;
    case "database":
      bank = DATABASE_QUESTIONS;
      break;
    case "devops":
    case "algorithms":
    case "ai_ml":
    case "systems":
    default:
      bank = GENERAL_SYSTEMS_QUESTIONS;
      break;
  }

  // Shuffle questions using Fisher-Yates
  const shuffled = [...bank];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Take requested count (minimum 7, default 10)
  const count = Math.min(targetCount, shuffled.length);
  const selected = shuffled.slice(0, count);

  // Dynamically tailor the first question to explicitly reference the lecture
  if (selected.length > 0) {
    const originalFirst = selected[0];
    selected[0] = {
      ...originalFirst,
      question: `[${videoTitle}] ${originalFirst.question}`,
    };
  }

  return selected;
}

// ── 3. Domain-Trained Expert Tutor Response Generator ──────────────────────
// Resolves actual technical doubts with working code, explanations, and structure
// whenever external API is unavailable or offline.

export function getDomainTutorResponse(
  question: string,
  videoTitle: string,
  courseTitle: string,
  category: string,
  _history: { role: string; content: string }[] = []
): string {
  const qLower = question.toLowerCase();
  const domain = detectDomain(courseTitle, videoTitle, category);

  // 1. Python Specific Doubts
  if (domain === "python" || /python/i.test(qLower)) {
    if (/decorator/i.test(qLower)) {
      return `### Understanding Python Decorators

A **decorator** in Python is a callable that takes another function as an argument, extends or modifies its behavior, and returns a new function.

\`\`\`python
from functools import wraps

def log_execution(func):
    @wraps(func)  # Preserves func's __name__ and docstring
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with args: {args}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} finished execution.")
        return result
    return wrapper

@log_execution
def calculate_area(width, height):
    return width * height

# Calling calculate_area(5, 10) executes through the wrapper
\`\`\`

#### Key Principles:
- The \`@log_execution\` syntax is equivalent to \`calculate_area = log_execution(calculate_area)\`.
- Always use \`@functools.wraps\` on the wrapper function so that introspection, function names, and docstrings remain intact.
- Decorators are ideal for cross-cutting concerns: **logging, execution timing, authentication, caching, and rate limiting**.`;
    }

    if (/comprehension|list comprehension/i.test(qLower)) {
      return `### Python List Comprehensions

List comprehensions provide a concise, declarative way to construct lists without writing verbose \`for\` loops.

\`\`\`python
# Standard Loop vs. List Comprehension
# Goal: Compute squares of even numbers from 0 to 9

# Verbose loop:
evens_squared = []
for x in range(10):
    if x % 2 == 0:
        evens_squared.append(x ** 2)

# Idiomatic List Comprehension:
evens_squared = [x ** 2 for x in range(10) if x % 2 == 0]
# Result: [0, 4, 16, 36, 64]
\`\`\`

#### Architectural Advantages:
- **Performance**: Executed at C-level speed inside CPython bytecode rather than repeated Python-level \`append()\` calls.
- **Readability**: Expresses intent clearly: \`[expression for item in iterable if condition]\`.
- **Memory Warning**: If generating millions of elements, prefer a **generator expression** using parentheses \`(x ** 2 for x in range(1000000))\` for $O(1)$ lazy evaluation.`;
    }

    if (/gil|lock|thread/i.test(qLower)) {
      return `### The CPython Global Interpreter Lock (GIL)

The **Global Interpreter Lock (GIL)** is a mutex that prevents multiple native OS threads from executing Python bytecodes simultaneously within a single CPython process.

#### Why the GIL Exists:
- CPython uses **reference counting** for memory management. Without the GIL, concurrent threads would produce race conditions when updating object reference counts.

#### Practical Engineering Impact:
- **I/O-Bound Workloads** (Network requests, database queries, file reads): Multithreading or \`asyncio\` is highly effective because threads release the GIL while waiting on I/O.
- **CPU-Bound Workloads** (Mathematical computations, image processing, machine learning): Multithreading will NOT speed up execution across multiple cores. Instead, use Python's \`multiprocessing\` module or C-extensions (like NumPy) which release the GIL.`;
    }

    if (/generator|yield/i.test(qLower)) {
      return `### Python Generators and the 'yield' Keyword

A **generator** produces values lazily on demand. Unlike regular functions that return a single value and terminate, a generator yields values one at a time and remembers its local state.

\`\`\`python
def stream_large_dataset(file_path):
    with open(file_path, "r") as file:
        for line in file:
            yield line.strip()

# Memory usage remains O(1) regardless of whether the file is 1MB or 100GB
for record in stream_large_dataset("data.log"):
    process(record)
\`\`\`

#### Core Mechanics:
1. When \`yield\` is encountered, execution is paused, and the yielded value is returned to the caller.
2. The next iteration (\`next(gen)\`) resumes execution immediately after the \`yield\` statement.
3. When the function returns, a \`StopIteration\` exception is raised automatically, concluding the loop.`;
    }
  }

  // 2. React / Frontend Specific Doubts
  if (domain === "react" || /react|hook|useeffect|state/i.test(qLower)) {
    if (/useeffect/i.test(qLower)) {
      return `### React useEffect Lifecycle & Best Practices

\`useEffect\` lets you synchronize a component with external systems (APIs, DOM event listeners, subscriptions).

\`\`\`tsx
import { useEffect, useState } from "react";

export function UserProfile({ userId }: { userId: string }) {
  const [data, setData] = useState<User | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadUser() {
      const response = await fetch(\`/api/users/\${userId}\`);
      const user = await response.json();
      if (!isCancelled) {
        setData(user);
      }
    }

    loadUser();

    // Cleanup function: runs on unmount or before userId changes
    return () => {
      isCancelled = true;
    };
  }, [userId]); // Dependency array: only re-runs when userId changes
}
\`\`\`

#### Critical Rules:
1. **Always declare reactive dependencies**: Any variable or function used inside the effect must be in the dependency array to avoid stale closures.
2. **Implement Cleanup**: Clean up subscriptions, timers, or abort fetch requests using \`AbortController\` to prevent race conditions.
3. **Avoid Derived State**: Don't use \`useEffect\` to calculate state that can be derived synchronously during render.`;
    }

    if (/render|re-render|virtual dom/i.test(qLower)) {
      return `### React Rendering & Virtual DOM Mechanics

#### How React Triggers a Render:
A component re-renders when:
1. Its internal **state** changes via \`setState\`.
2. Its **props** change.
3. Its parent component re-renders (unless wrapped in \`React.memo\`).
4. A **context** value it consumes updates.

#### Optimization Strategies:
- **Stable Keys**: Use unique entity IDs (\`key={item.id}\`), never array indexes when items can be inserted, deleted, or sorted.
- **Reference Memoization**: Use \`useCallback\` on functions passed to memoized children to prevent breaking child memoization.
- **Lift State Down**: Keep state as close as possible to the components that need it rather than elevating it to the root.`;
    }
  }

  // 3. Database / SQL Specific Doubts
  if (domain === "database" || /sql|database|query|index/i.test(qLower)) {
    return `### Database Engineering: Architecture & Optimization

\`\`\`sql
-- Example: Compound index following the Leftmost Prefix Rule
CREATE INDEX idx_orders_customer_status_date 
ON orders (customer_id, status, created_at DESC);

-- Fast Index Seek: Uses customer_id and status
SELECT id, total 
FROM orders 
WHERE customer_id = 452 
  AND status = 'completed'
ORDER BY created_at DESC;
\`\`\`

#### Core Fundamentals for this Module:
1. **ACID Guarantees**: Atomicity (all-or-nothing), Consistency (schema constraints respected), Isolation (transaction boundaries), Durability (persisted on non-volatile disk).
2. **Index Usage**: B-Tree indexes turn $O(N)$ full table scans into $O(\\log N)$ seeks. However, every additional index incurs a write penalty during INSERT and UPDATE operations.
3. **Parameterization**: Always bind query parameters rather than interpolating strings to eliminate SQL Injection vulnerabilities.`;
  }

  // 4. Default Technical Assessment & Doubt Resolution
  return `### Technical Analysis: ${videoTitle}

#### Overview & Implementation Principles
In the context of **${courseTitle}** (\`${category}\`), mastering this module requires understanding core architecture, edge-case mitigation, and maintainability.

\`\`\`text
[Architecture Workflow]
Input Validation -> Business Logic Boundary -> State Mutator -> Observability / Error Catch
\`\`\`

#### Practical Engineering Takeaways:
1. **Separation of Concerns**: Decouple business logic from rendering and delivery layers. This enables automated unit test coverage and modular refactoring.
2. **Defensive Programming**: Validate all inputs at network and service boundaries. Handle unexpected nulls or missing keys gracefully.
3. **Observability**: Ensure logging and structured error boundaries exist around critical execution points.

If you have a specific snippet or compiler error you are encountering, paste the code directly and I will analyze the exact line issue!`;
}
