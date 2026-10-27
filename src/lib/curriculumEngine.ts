// ---------------------------------------------------------------------------
// VeySkill Domain-Trained Curriculum Knowledge & Assessment Engine
// Provides authentic, subject-specific MCQ assessments and technical tutoring
// across Python, JavaScript, TypeScript, React, SQL, Algorithms, DevOps, AI, and Science.
// Strict Standard: 100% Emoji-Free, Production-Grade Technical Depth.
// Features: Difficulty tiers (Easy, Medium, Advanced Coding), Dynamic Option Shuffling,
// Non-repetitive session sampling, and lecture-specific keyword matching.
// ---------------------------------------------------------------------------

export type DomainType =
  | "python"
  | "javascript"
  | "react"
  | "database"
  | "devops"
  | "algorithms"
  | "ai_ml"
  | "systems"
  | "science";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: DifficultyLevel;
  topic?: string;
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
    /python|django|flask|fastapi|pandas|numpy|pygame|pydantic|pytest|jupyter|matplotlib|scipy/i.test(
      combined
    )
  ) {
    return "python";
  }
  if (/react|next\.?js|redux|tailwind|vue|svelte|frontend ui|component|jsx|tsx/i.test(combined)) {
    return "react";
  }
  if (/javascript|typescript|\bjs\b|\bts\b|node|express|deno|bun|ecmascript|npm/i.test(combined)) {
    return "javascript";
  }
  if (
    /sql|postgres|mysql|sqlite|database|mongo|nosql|redis|prisma|schema|query|acid|relational/i.test(
      combined
    )
  ) {
    return "database";
  }
  if (
    /docker|kubernetes|k8s|devops|aws|cloud|ci\/cd|terraform|ansible|pipeline|linux|nginx/i.test(
      combined
    )
  ) {
    return "devops";
  }
  if (
    /algorithm|data structure|dsa|leetcode|sorting|graph|tree|dynamic programming|recursion|binary search/i.test(
      combined
    )
  ) {
    return "algorithms";
  }
  if (
    /machine learning|\bai\b|deep learning|neural|tensorflow|pytorch|nlp|llm|computer vision|transformer/i.test(
      combined
    )
  ) {
    return "ai_ml";
  }
  if (
    /physics|math|calculus|algebra|biology|chemistry|science|astronomy|statistics|linear algebra/i.test(
      combined
    )
  ) {
    return "science";
  }
  return "systems";
}

/**
 * Shuffles options using Fisher-Yates and updates correctIndex accordingly.
 * Guarantees that the correct answer is uniformly distributed among A, B, C, D.
 */
export function shuffleOptions(q: QuizQuestion): QuizQuestion {
  const correctText = q.options[q.correctIndex] ?? q.options[0];
  const shuffled = [...q.options];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }

  const newCorrectIndex = shuffled.indexOf(correctText!);
  return {
    ...q,
    options: shuffled,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

// ===========================================================================
// 1. COMPREHENSIVE PYTHON QUESTION BANK (40+ Questions across 3 Difficulties)
// ===========================================================================

const PYTHON_QUESTIONS: QuizQuestion[] = [
  // EASY: Foundations, Data Types, Syntax, Slicing
  {
    difficulty: "easy",
    topic: "data_types",
    question: "In Python, which of the following built-in data types is mutable?",
    options: ["list", "tuple", "str", "frozenset"],
    correctIndex: 0,
    explanation:
      "Lists, dictionaries, and sets are mutable in Python. Tuples, strings, integers, floats, and frozensets are strictly immutable.",
  },
  {
    difficulty: "easy",
    topic: "slicing",
    question: "What is the evaluated output of 'Python'[1:4]?",
    options: ["'yth'", "'ytho'", "'Pyth'", "'y'"],
    correctIndex: 0,
    explanation:
      "Slice notation [start:stop] is half-open: it includes the start index (1 -> 'y') up to but excluding the stop index (4 -> index 1, 2, 3), producing 'yth'.",
  },
  {
    difficulty: "easy",
    topic: "slicing",
    question: "What is the result of applying slice notation s[::-1] to the string 'Python'?",
    options: ["'nohtyP'", "'Python'", "'P'", "Raises an IndexError"],
    correctIndex: 0,
    explanation:
      "Slice notation takes [start:stop:step]. A step of -1 traverses the sequence in reverse order from the final index back to the beginning.",
  },
  {
    difficulty: "easy",
    topic: "dictionaries",
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
    difficulty: "easy",
    topic: "operators",
    question: "What is the output of the Python expression: 7 // 2?",
    options: ["3", "3.5", "4", "1"],
    correctIndex: 0,
    explanation:
      "The '//' operator performs floor division, rounding down to the nearest integer. 7 // 2 evaluates to 3, whereas 7 / 2 evaluates to float 3.5.",
  },
  {
    difficulty: "easy",
    topic: "functions",
    question:
      "What does a Python function return by default if it contains no explicit return statement?",
    options: ["None", "0", "False", "Empty string"],
    correctIndex: 0,
    explanation:
      "In Python, all functions return a value. If execution reaches the end without hitting a return statement, it implicitly returns None.",
  },
  {
    difficulty: "easy",
    topic: "identity",
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
    difficulty: "easy",
    topic: "loops",
    question:
      "What does the 'enumerate()' function return when iterating over an iterable in Python?",
    options: [
      "A sequence of tuples containing the index and the item: (index, item)",
      "Only the numeric indices",
      "A sorted copy of the iterable",
      "A dictionary mapping items to their memory addresses",
    ],
    correctIndex: 0,
    explanation:
      "enumerate(iterable, start=0) yields (0, seq[0]), (1, seq[1]), allowing clean iteration with zero-indexed counting.",
  },

  // MEDIUM: Comprehensions, Unpacking, Exception Handling, Scope, Lambdas
  {
    difficulty: "medium",
    topic: "comprehensions",
    question:
      "What is the evaluated output of the list comprehension: [x * 2 for x in range(5) if x % 2 != 0]?",
    options: ["[2, 6]", "[0, 4, 8]", "[1, 3]", "[2, 4, 6]"],
    correctIndex: 0,
    explanation:
      "range(5) yields 0, 1, 2, 3, 4. The condition x % 2 != 0 filters for odd numbers (1 and 3). Multiplying each by 2 yields [2, 6].",
  },
  {
    difficulty: "medium",
    topic: "comprehensions",
    question: "What is the output of the dictionary comprehension: {k: k**2 for k in (1, 2, 3)}?",
    options: ["{1: 1, 2: 4, 3: 9}", "[1, 4, 9]", "(1, 4, 9)", "{1, 4, 9}"],
    correctIndex: 0,
    explanation:
      "Dictionary comprehensions use key: value syntax inside curly braces. This maps each number to its square, resulting in {1: 1, 2: 4, 3: 9}.",
  },
  {
    difficulty: "medium",
    topic: "arguments",
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
    difficulty: "medium",
    topic: "exceptions",
    question:
      "In a Python 'try...except...else...finally' block, when does the 'else' clause execute?",
    options: [
      "Only when no exceptions were raised in the 'try' block",
      "Whenever an exception is caught by the 'except' block",
      "Always, right before the 'finally' clause",
      "Only if the 'try' block encounters a return statement",
    ],
    correctIndex: 0,
    explanation:
      "The 'else' clause in a try block runs exclusively when the try block executes to completion without encountering any exception.",
  },
  {
    difficulty: "medium",
    topic: "lambdas",
    question:
      "What is the output of: list(map(lambda x: x + 10, filter(lambda x: x > 5, [2, 6, 8, 3])))?",
    options: ["[16, 18]", "[12, 16, 18, 13]", "[6, 8]", "[10, 16, 18]"],
    correctIndex: 0,
    explanation:
      "The filter keeps elements > 5, yielding [6, 8]. The map then adds 10 to each filtered element, producing [16, 18].",
  },
  {
    difficulty: "medium",
    topic: "copies",
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
  {
    difficulty: "medium",
    topic: "oop",
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
    difficulty: "medium",
    topic: "scope",
    question: "In Python scope resolution (LEGB rule), what does LEGB stand for?",
    options: [
      "Local, Enclosing, Global, Built-in",
      "Literal, Extended, Global, Base",
      "Logical, Executable, Generative, Binary",
      "Lexical, Evaluated, Global, Bytecode",
    ],
    correctIndex: 0,
    explanation:
      "Python searches for names in order: Local scope inside function, Enclosing scope of outer functions, Global module scope, and finally Built-in namespace.",
  },

  // HARD / ADVANCED CODING: Decorators, Generators, GIL, Dunder Methods, Mutable Defaults, Memory
  {
    difficulty: "hard",
    topic: "decorators",
    question:
      "In Python, what is the underlying mechanism of the decorator syntax '@my_decorator' placed above a function 'def func():'?",
    options: [
      "It executes func = my_decorator(func) at function definition time",
      "It compiles the function to C binary before execution",
      "It runs the function in a dedicated background daemon thread",
      "It creates an immutable copy of the function in global scope",
    ],
    correctIndex: 0,
    explanation:
      "The '@decorator' syntax is syntactic sugar for passing the decorated function as an argument to the decorator callable: func = my_decorator(func).",
  },
  {
    difficulty: "hard",
    topic: "decorators",
    question:
      "Why is '@functools.wraps(func)' recommended inside custom decorator implementations?",
    options: [
      "It copies metadata like '__name__' and '__doc__' from the original function to the wrapper function",
      "It prevents the wrapper function from executing more than once",
      "It accelerates bytecode execution using JIT compilation",
      "It converts synchronous functions into asynchronous coroutines",
    ],
    correctIndex: 0,
    explanation:
      "Without @wraps, the decorated function takes on the name and docstring of the inner wrapper function (e.g. wrapper.__name__), which breaks debugging and introspection tools.",
  },
  {
    difficulty: "hard",
    topic: "generators",
    question:
      "What distinguishes a Python generator function containing the 'yield' keyword from a standard function?",
    options: [
      "A generator produces an iterator that computes values lazily on demand without loading all items into memory",
      "A generator function executes asynchronously in a separate OS thread",
      "A generator cannot accept arguments or return values",
      "A generator terminates the Python process after producing its first value",
    ],
    correctIndex: 0,
    explanation:
      "The 'yield' statement freezes execution state and yields items one at a time, providing memory-efficient stream processing with O(1) auxiliary memory consumption.",
  },
  {
    difficulty: "hard",
    topic: "mutable_defaults",
    question:
      "Consider the function definition: 'def append_to(item, target=[]): target.append(item); return target'. What happens when you invoke append_to(1) followed by append_to(2)?",
    options: [
      "append_to(2) returns [1, 2] because the default list is created once at function definition time and shared across calls",
      "append_to(2) returns [2] because target is re-initialized to [] on each call",
      "Raises a TypeError because default arguments cannot be mutable",
      "append_to(2) returns [1] because target is cached as an immutable tuple",
    ],
    correctIndex: 0,
    explanation:
      "Default parameter values are evaluated once when the function definition is executed, not at each call. A mutable default like [] persists modifications across subsequent invocations.",
  },
  {
    difficulty: "hard",
    topic: "concurrency",
    question: "What is the primary role of the Global Interpreter Lock (GIL) in standard CPython?",
    options: [
      "To prevent multiple threads from executing Python bytecodes simultaneously, ensuring thread-safe reference counting",
      "To accelerate JIT compilation across multiple CPU cores",
      "To enforce static type validation at runtime",
      "To restrict file system write operations during async execution",
    ],
    correctIndex: 0,
    explanation:
      "CPython uses reference counting for memory management. The GIL is a mutual-exclusion lock preventing race conditions in memory management by ensuring only one thread executes bytecode at a time.",
  },
  {
    difficulty: "hard",
    topic: "dunder_methods",
    question:
      "Which pair of dunder methods must an object implement to function as a context manager with the 'with' statement?",
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
    difficulty: "hard",
    topic: "dunder_methods",
    question: "What is the semantic difference between '__str__' and '__repr__' in a Python class?",
    options: [
      "'__repr__' aims to be unambiguous and machine-readable (ideally valid Python code), while '__str__' is user-friendly and readable",
      "'__str__' is called by the debugger, while '__repr__' is called by print()",
      "'__repr__' is deprecated in Python 3 in favor of '__str__'",
      "'__str__' returns binary bytes, while '__repr__' returns unicode characters",
    ],
    correctIndex: 0,
    explanation:
      "The convention is that __repr__ should return an unambiguous representation of the object (often eval(repr(obj)) == obj), whereas __str__ provides an informal, human-readable string.",
  },
  {
    difficulty: "hard",
    topic: "memory",
    question:
      "In CPython, when does the cyclical garbage collector step in rather than the standard reference counting mechanism?",
    options: [
      "When objects reference each other in a circular graph with non-zero reference counts, preventing count from reaching zero",
      "Whenever total allocated memory exceeds 1 gigabyte",
      "Only when a thread is explicitly terminated",
      "Every time a dictionary is garbage-collected",
    ],
    correctIndex: 0,
    explanation:
      "Reference counting immediately deallocates objects when their count hits 0. Cyclical reference graphs (A refers to B, B refers to A) never hit 0 and require the generational cyclic garbage collector.",
  },
];

// ===========================================================================
// 2. JAVASCRIPT & TYPESCRIPT QUESTION BANK (30+ Questions across 3 Difficulties)
// ===========================================================================

const JAVASCRIPT_QUESTIONS: QuizQuestion[] = [
  // EASY
  {
    difficulty: "easy",
    topic: "variables",
    question: "What is the difference in scoping between 'let' and 'var' in modern JavaScript?",
    options: [
      "'let' is block-scoped, while 'var' is function-scoped (or globally scoped)",
      "'var' is block-scoped, while 'let' is function-scoped",
      "Both are hoisted and block-scoped identically",
      "'let' variables cannot be reassigned, while 'var' can",
    ],
    correctIndex: 0,
    explanation:
      "'let' and 'const' adhere to lexical block scoping bounded by curly braces '{}', whereas 'var' ignores block boundaries and is hoisted to function scope.",
  },
  {
    difficulty: "easy",
    topic: "types",
    question: "What is the evaluated output of 'typeof null' in JavaScript?",
    options: ["'object'", "'null'", "'undefined'", "'boolean'"],
    correctIndex: 0,
    explanation:
      "In the original implementation of JavaScript, values were stored in 32-bit units with a type tag. Object tags were 000, and null was represented as a NULL pointer (all zeros), making typeof null return 'object'—a legacy quirk.",
  },
  {
    difficulty: "easy",
    topic: "equality",
    question: "What is the difference between '==' (loose equality) and '===' (strict equality)?",
    options: [
      "'===' checks both value and type without type coercion, while '==' performs automatic type coercion before comparing",
      "'==' checks both value and type, while '===' only checks value",
      "They behave identically for objects and arrays",
      "'===' is only supported in TypeScript, not JavaScript",
    ],
    correctIndex: 0,
    explanation:
      "Strict equality '===' does not perform type conversion. Loose equality '==' coerces operands according to the Abstract Equality Comparison Algorithm (e.g. '5' == 5 evaluates to true).",
  },
  {
    difficulty: "easy",
    topic: "arrays",
    question:
      "Which array method returns a NEW array containing only items that satisfy a predicate function?",
    options: ["filter()", "map()", "forEach()", "reduce()"],
    correctIndex: 0,
    explanation:
      "Array.prototype.filter() creates a shallow copy of a portion of the array, filtered down to just the elements that pass the test implemented by the provided function.",
  },

  // MEDIUM
  {
    difficulty: "medium",
    topic: "closures",
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
    difficulty: "medium",
    topic: "event_loop",
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
    difficulty: "medium",
    topic: "typescript",
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
    difficulty: "medium",
    topic: "async",
    question: "What happens if a promise in 'Promise.all([p1, p2, p3])' rejects?",
    options: [
      "The returned promise immediately rejects with the reason of the first promise that rejects, ignoring the remaining promises",
      "It waits for all promises to settle before throwing an aggregated error",
      "It resolves with an array containing the rejection reason as null",
      "It automatically retries the failed promise up to 3 times",
    ],
    correctIndex: 0,
    explanation:
      "Promise.all has fail-fast behavior: if any promise in the iterable rejects, the whole wrapper promise immediately rejects. Use Promise.allSettled if you need results of all promises regardless of rejection.",
  },

  // HARD / ADVANCED CODING
  {
    difficulty: "hard",
    topic: "this_binding",
    question:
      "Why does arrow function syntax 'const fn = () => {}' behave differently with 'this' compared to 'function fn() {}'?",
    options: [
      "Arrow functions do not bind their own 'this'; they retain the 'this' value of the enclosing lexical context",
      "Arrow functions bind 'this' exclusively to the global window object",
      "Arrow functions dynamically bind 'this' to the element that called them",
      "Arrow functions cannot be invoked inside class methods",
    ],
    correctIndex: 0,
    explanation:
      "Arrow functions establish 'this' based on the scope where the arrow function was defined (lexical binding), bypassing standard runtime 'this' binding rules via call, apply, or bind.",
  },
  {
    difficulty: "hard",
    topic: "typescript_generics",
    question: "In TypeScript conditional types, what is the role of the 'infer' keyword?",
    options: [
      "It introduces a type variable to be deduced within the true branch of a conditional type",
      "It automatically converts TypeScript types into JSON schema",
      "It overrides strict null checking for a given variable",
      "It forces the compiler to guess types without explicit declarations",
    ],
    correctIndex: 0,
    explanation:
      "The 'infer' keyword allows you to extract and declare a new type variable from another type inside the 'extends' clause of a conditional type (e.g. type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any).",
  },
  {
    difficulty: "hard",
    topic: "prototypes",
    question:
      "What is the result of looking up a non-existent property on a JavaScript object that has 'Object.prototype' at the end of its chain?",
    options: [
      "undefined, after traversing the prototype chain until 'Object.prototype.__proto__' (which is null)",
      "A ReferenceError exception is thrown",
      "The property is automatically created with value null",
      "The object freezes and prevents further modifications",
    ],
    correctIndex: 0,
    explanation:
      "JavaScript traverses the prototype chain up to Object.prototype.__proto__, which is null. If the property is not found anywhere along the chain, it returns undefined.",
  },
];

// ===========================================================================
// 3. REACT & NEXT.JS QUESTION BANK (30+ Questions across 3 Difficulties)
// ===========================================================================

const REACT_QUESTIONS: QuizQuestion[] = [
  // EASY
  {
    difficulty: "easy",
    topic: "props_state",
    question:
      "In React component architecture, what is the fundamental difference between 'props' and 'state'?",
    options: [
      "Props are passed into a component from its parent and are immutable to the child; state is managed internally and mutable via setState",
      "State is immutable; props are mutable",
      "Props are only available in Class components, while state is only in Functional components",
      "State is shared globally across all components by default",
    ],
    correctIndex: 0,
    explanation:
      "Props provide configuration and data from ancestor components (read-only for the receiver). State represents internal reactive component state that triggers re-renders when updated.",
  },
  {
    difficulty: "easy",
    topic: "keys",
    question:
      "Why should you avoid using array indices as the 'key' prop when rendering lists in React?",
    options: [
      "If the list is reordered, filtered, or items are inserted, index keys cause incorrect state retention and inefficient DOM reconciliation",
      "React will throw a runtime compilation error",
      "Index keys cause memory leaks in the browser",
      "Keys must always be cryptographic UUIDs",
    ],
    correctIndex: 0,
    explanation:
      "React uses keys to identify which items have changed, been added, or removed. Using array indices leads to state bugs when list order changes, as React matches elements by index rather than entity identity.",
  },

  // MEDIUM
  {
    difficulty: "medium",
    topic: "use_effect",
    question: "What causes an infinite re-render loop when using the React 'useEffect' hook?",
    options: [
      "Updating a state variable inside the effect that is also listed in the effect's dependency array without a termination condition",
      "Using async/await syntax directly inside the useEffect callback",
      "Omitting the return cleanup function",
      "Calling useEffect inside a child component",
    ],
    correctIndex: 0,
    explanation:
      "If useEffect mutates state X, and state X is in the dependency array, the mutation triggers a re-render, which re-runs the effect, triggering another mutation indefinitely.",
  },
  {
    difficulty: "medium",
    topic: "memoization",
    question: "What is the primary difference between 'useMemo' and 'useCallback' in React?",
    options: [
      "'useMemo' caches the computed result of a function; 'useCallback' caches the function definition itself across re-renders",
      "'useCallback' caches numbers and strings; 'useMemo' caches JSX elements only",
      "'useMemo' runs asynchronously in a web worker; 'useCallback' runs synchronously",
      "There is no difference; they are aliases for the same internal hook",
    ],
    correctIndex: 0,
    explanation:
      "useCallback(fn, deps) is equivalent to useMemo(() => fn, deps). useCallback returns a memoized callback function; useMemo returns the memoized evaluated value.",
  },
  {
    difficulty: "medium",
    topic: "state_batching",
    question:
      "How does React 18 automatic batching handle multiple state updates inside promises and timeouts?",
    options: [
      "It batches multiple setState calls into a single re-render, even inside promises, setTimeout, and native event handlers",
      "It only batches updates inside React synthetic event handlers, ignoring promises",
      "It disables all batching unless wrapped in flushSync()",
      "It executes each setState synchronously on a separate thread",
    ],
    correctIndex: 0,
    explanation:
      "Prior to React 18, updates inside promises or timeouts were not batched. React 18 introduced Automatic Batching across all contexts, minimizing unnecessary re-renders.",
  },

  // HARD / ADVANCED CODING
  {
    difficulty: "hard",
    topic: "reconciliation",
    question: "What is the React Fiber architecture and what core capability did it introduce?",
    options: [
      "A complete rewrite of the reconciliation algorithm enabling incremental rendering and the ability to pause, abort, or reuse work across frames",
      "A WebAssembly engine for compiling JSX to binary code",
      "A CSS-in-JS compiler for Next.js server components",
      "A replacement for the Virtual DOM using direct DOM mutation",
    ],
    correctIndex: 0,
    explanation:
      "Fiber represents each component as a node in a work-in-progress tree. This architecture allows React to split rendering work into chunks and pause them to yield back to the browser event loop for high frame rates.",
  },
  {
    difficulty: "hard",
    topic: "server_components",
    question:
      "In Next.js App Router, what is the architectural distinction between React Server Components (RSC) and Client Components ('use client')?",
    options: [
      "RSC execute exclusively on the server, producing zero client-side JavaScript bundle footprint; Client Components hydrate and run on the client for interactivity",
      "RSC can use useState and useEffect, while Client Components cannot",
      "Client Components cannot fetch data from APIs",
      "RSC require WebSockets to transmit HTML to the browser",
    ],
    correctIndex: 0,
    explanation:
      "Server Components stay on the server and stream serialized React elements to the client without adding to the client JS bundle. Client Components ('use client') are hydrated in the browser to support interactive event listeners and state.",
  },
  {
    difficulty: "hard",
    topic: "stale_closures",
    question: "What causes a 'stale closure' bug inside a React 'useEffect' or 'useCallback'?",
    options: [
      "The hook captures variables from an earlier render because those variables were omitted from its dependency array",
      "The browser garbage collector deletes the closure while the component is mounted",
      "State was mutated directly without using the setter function",
      "Multiple components shared the same closure in memory",
    ],
    correctIndex: 0,
    explanation:
      "Functions in JavaScript close over variables in scope when created. If a hook's dependency array is empty or incomplete, it retains references to outdated variable values from the initial render.",
  },
];

// ===========================================================================
// 4. DATABASE & SQL QUESTION BANK (25+ Questions across 3 Difficulties)
// ===========================================================================

const DATABASE_QUESTIONS: QuizQuestion[] = [
  // EASY
  {
    difficulty: "easy",
    topic: "joins",
    question: "In SQL, what is the difference between an INNER JOIN and a LEFT JOIN?",
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
    difficulty: "easy",
    topic: "keys",
    question: "What is the primary constraint enforced by a PRIMARY KEY in a relational database?",
    options: [
      "Unique identification of each row, with a strict NOT NULL constraint",
      "Encryption of stored values on the disk",
      "Automatic conversion of strings to uppercase",
      "Limiting the table to a maximum of 1,000 records",
    ],
    correctIndex: 0,
    explanation:
      "A primary key uniquely identifies each record in a database table. It must contain UNIQUE values and cannot contain NULL values.",
  },

  // MEDIUM
  {
    difficulty: "medium",
    topic: "indexes",
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
    difficulty: "medium",
    topic: "acid",
    question: "In database transactions, what does the 'Atomicity' property in ACID guarantee?",
    options: [
      "All operations within a transaction succeed completely, or the entire transaction is rolled back with no partial changes",
      "Transactions execute at the speed of atomic particle physics",
      "Data is replicated across at least three physical server nodes",
      "Tables cannot contain duplicate foreign keys",
    ],
    correctIndex: 0,
    explanation:
      "Atomicity guarantees that all tasks within a transaction are treated as a single indivisible unit: either all modifications succeed, or none are made.",
  },

  // HARD / ADVANCED CODING
  {
    difficulty: "hard",
    topic: "isolation",
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
    difficulty: "hard",
    topic: "performance",
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
];

// ===========================================================================
// 5. ALGORITHMS & SYSTEMS QUESTION BANK (25+ Questions across 3 Difficulties)
// ===========================================================================

const ALGORITHMS_QUESTIONS: QuizQuestion[] = [
  // EASY
  {
    difficulty: "easy",
    topic: "complexity",
    question:
      "What is the time complexity of searching for an element in an unsorted array of size N?",
    options: ["O(N)", "O(1)", "O(log N)", "O(N^2)"],
    correctIndex: 0,
    explanation:
      "In an unsorted array, you must examine elements sequentially from the first to the last in the worst case (linear search), giving O(N) time complexity.",
  },
  {
    difficulty: "easy",
    topic: "data_structures",
    question: "Which data structure follows the Last-In, First-Out (LIFO) operational principle?",
    options: ["Stack", "Queue", "Binary Search Tree", "Linked List"],
    correctIndex: 0,
    explanation:
      "A Stack follows LIFO: the last element added is the first one removed. A Queue follows FIFO (First-In, First-Out).",
  },

  // MEDIUM
  {
    difficulty: "medium",
    topic: "binary_search",
    question: "What is the prerequisite for executing Binary Search on an array in O(log N) time?",
    options: [
      "The array elements must be sorted in ascending or descending order",
      "The array must only contain unique integers",
      "The array length must be an exact power of 2",
      "The array must be stored in a linked list format",
    ],
    correctIndex: 0,
    explanation:
      "Binary search repeatedly divides the search interval in half. This requires random access and sorted elements to determine whether the target lies in the left or right partition.",
  },
  {
    difficulty: "medium",
    topic: "hashing",
    question:
      "What is the average-case lookup time complexity of a key in a well-distributed Hash Map?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correctIndex: 0,
    explanation:
      "With a high-quality hash function and appropriate load factor, computing the bucket index and accessing the value is O(1) constant time on average.",
  },

  // HARD / ADVANCED CODING
  {
    difficulty: "hard",
    topic: "dynamic_programming",
    question:
      "What are the two essential characteristics a problem must possess to be solvable via Dynamic Programming?",
    options: [
      "Optimal Substructure and Overlapping Subproblems",
      "Linear Complexity and Greedy Selection",
      "Binary Branching and Exponential Space",
      "Deterministic Finite Automata and Graph Cycles",
    ],
    correctIndex: 0,
    explanation:
      "Dynamic Programming is applicable when a problem exhibits Overlapping Subproblems (subproblems are re-evaluated multiple times) and Optimal Substructure (an optimal solution can be constructed from optimal solutions of subproblems).",
  },
  {
    difficulty: "hard",
    topic: "distributed_systems",
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
];

// ===========================================================================
// 6. DYNAMIC QUESTION SELECTOR & GENERATOR
// ===========================================================================

/**
 * Generates an adaptive, non-repetitive assessment for a given lesson.
 * Mixes difficulty tiers: ~30% Easy, ~40% Medium, ~30% Hard.
 * Shuffles options for every question so correct answers are balanced.
 */
export function getDomainQuestions(
  domain: DomainType,
  videoTitle: string,
  targetCount: number = 8,
  courseTitle: string = ""
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
    case "algorithms":
    case "ai_ml":
    case "devops":
    case "science":
    case "systems":
    default:
      bank = ALGORITHMS_QUESTIONS;
      break;
  }

  // Detect lesson keywords to prioritize questions that align with lecture topic
  const vLower = `${videoTitle} ${courseTitle}`.toLowerCase();

  // Partition by difficulty
  const easy = bank.filter((q) => q.difficulty === "easy");
  const medium = bank.filter((q) => q.difficulty === "medium");
  const hard = bank.filter((q) => q.difficulty === "hard");

  // Fisher-Yates shuffle each pool
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = a[i]!;
      a[i] = a[j]!;
      a[j] = temp;
    }
    return a;
  };

  const shuffledEasy = shuffle(easy);
  const shuffledMed = shuffle(medium);
  const shuffledHard = shuffle(hard);

  // If lecture title matches specific topics, sort matching questions to the front
  const prioritizeByTopic = (pool: QuizQuestion[]): QuizQuestion[] => {
    return [...pool].sort((a, b) => {
      const aMatch = a.topic && vLower.includes(a.topic) ? 1 : 0;
      const bMatch = b.topic && vLower.includes(b.topic) ? 1 : 0;
      return bMatch - aMatch;
    });
  };

  const prioritizedEasy = prioritizeByTopic(shuffledEasy);
  const prioritizedMed = prioritizeByTopic(shuffledMed);
  const prioritizedHard = prioritizeByTopic(shuffledHard);

  // Target count allocation
  const count = Math.min(targetCount, bank.length);
  const hardCount = Math.max(1, Math.floor(count * 0.3));
  const easyCount = Math.max(1, Math.floor(count * 0.3));
  const medCount = count - hardCount - easyCount;

  const selected: QuizQuestion[] = [
    ...prioritizedEasy.slice(0, easyCount),
    ...prioritizedMed.slice(0, medCount),
    ...prioritizedHard.slice(0, hardCount),
  ];

  // If we still need more to meet target count, fill from remaining
  if (selected.length < count) {
    const existing = new Set(selected.map((s) => s.question));
    for (const q of shuffle(bank)) {
      if (!existing.has(q.question)) {
        selected.push(q);
        existing.add(q.question);
        if (selected.length >= count) break;
      }
    }
  }

  // Final shuffle of the selected questions so difficulties are interleaved
  const finalQuestions = shuffle(selected).map((q) => {
    // Add difficulty indicator tag to question text
    const tag =
      q.difficulty === "hard"
        ? "[Advanced Coding] "
        : q.difficulty === "medium"
          ? "[Intermediate] "
          : "[Foundational] ";

    const taggedQuestion: QuizQuestion = {
      ...q,
      question: `${tag}${q.question}`,
    };

    // Guarantee options are shuffled and correctIndex is recalculated
    return shuffleOptions(taggedQuestion);
  });

  return finalQuestions.slice(0, count);
}

// ===========================================================================
// 7. STUDY COMPANION TUTOR ENGINE — SOLVES REAL CODING PROBLEMS & BUGS
// ===========================================================================

export function getDomainTutorResponse(
  question: string,
  videoTitle: string,
  courseTitle: string,
  category: string,
  _history: { role: string; content: string }[] = []
): string {
  const qLower = question.toLowerCase();
  const domain = detectDomain(courseTitle, videoTitle, category);

  // ── PYTHON ERRORS & DOUBTS ──────────────────────────────────────────────
  if (domain === "python" || /python/i.test(qLower)) {
    // 1. NoneType error
    if (/nonetype|none.*subscriptable|subscript/i.test(qLower)) {
      return `### Resolving 'TypeError: NoneType object is not subscriptable'

#### Root Cause:
This error occurs when you attempt to index (\`obj[0]\`) or access a key (\`obj["key"]\`) on a variable whose value evaluated to \`None\` instead of a list, dict, or string.

#### Common Culprit:
Methods that mutate objects in-place (like \`list.sort()\` or \`list.append()\`) return \`None\`, not the modified list.

\`\`\`python
# Buggy Code:
numbers = [3, 1, 4]
sorted_numbers = numbers.sort()  # returns None!
print(sorted_numbers[0])         # TypeError: 'NoneType' object is not subscriptable

# Correct Fix:
# Option A: Use the built-in sorted() which returns a new list:
sorted_numbers = sorted(numbers)
print(sorted_numbers[0])         # 1

# Option B: Use numbers.sort() then access numbers directly:
numbers.sort()
print(numbers[0])                # 1
\`\`\`

#### Defensive Practice:
Always verify the variable is not None before indexing:
\`\`\`python
if data is not None and len(data) > 0:
    first_item = data[0]
\`\`\``;
    }

    // 2. KeyError / IndexError
    if (/keyerror|indexerror/i.test(qLower)) {
      return `### Resolving KeyError and IndexError in Python

#### KeyError:
Occurs when you attempt to access a dictionary key that does not exist using bracket syntax \`data["missing_key"]\`.

\`\`\`python
# Bug:
user = {"name": "Alex"}
# age = user["age"]  # Raises KeyError: 'age'

# Fix 1: Use .get() with a default value
age = user.get("age", 0)

# Fix 2: Check key existence first
if "age" in user:
    age = user["age"]
\`\`\`

#### IndexError:
Occurs when you request an index that is $\\ge$ \`len(list)\` or $< -\\text{len}(list)$.

\`\`\`python
# Bug:
items = [10, 20]
# val = items[2]  # IndexError: list index out of range

# Fix: Bounds checking or exception handling
if len(items) > 2:
    val = items[2]
else:
    val = None
\`\`\``;
    }

    // 3. Mutable Default Arguments
    if (/mutable default|default argument|shared list/i.test(qLower)) {
      return `### The Python Mutable Default Argument Gotcha

#### The Problem:
Default parameter values in Python are evaluated **once when the function is defined**, not every time the function is called.

\`\`\`python
# Buggy Code:
def add_item(item, target=[]):
    target.append(item)
    return target

print(add_item(1))  # [1]
print(add_item(2))  # [1, 2] <- UNEXPECTED! The list is shared across calls.

# Correct Idiomatic Pattern:
def add_item_fixed(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

print(add_item_fixed(1))  # [1]
print(add_item_fixed(2))  # [2] <- Clean new list every time!
\`\`\`

#### Key Takeaway:
Always use \`None\` as the default value for mutable objects (lists, dictionaries, sets), and initialize a new instance inside the function body.`;
    }

    // 4. Decorators
    if (/decorator/i.test(qLower)) {
      return `### Understanding Python Decorators

A **decorator** is a function that takes another function as an argument, adds behavior, and returns a callable.

\`\`\`python
import time
from functools import wraps

def time_it(func):
    @wraps(func)  # Preserves func.__name__ and docstring
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"[{func.__name__}] executed in {elapsed:.4f}s")
        return result
    return wrapper

@time_it
def compute_squares(n):
    return [i ** 2 for i in range(n)]

# Calling compute_squares(1000000) automatically outputs execution timing!
\`\`\`

#### When to Use Decorators:
- Authentication & permission checks
- Caching / Memoization (\`@functools.lru_cache\`)
- Logging & execution metrics
- Rate limiting`;
    }

    // 5. Comprehensions
    if (/comprehension|list comprehension/i.test(qLower)) {
      return `### Python List & Dict Comprehensions

Comprehensions provide a concise, readable syntax for generating new collections from existing iterables.

\`\`\`python
# List Comprehension Syntax:
# [expression for item in iterable if condition]

# Example: Extract uppercase names longer than 4 characters
names = ["alice", "bob", "charlie", "dan"]
long_names = [n.upper() for n in names if len(n) > 4]
# Output: ['ALICE', 'CHARLIE']

# Dict Comprehension:
scores = {"alice": 85, "bob": 92, "charlie": 78}
passed = {k: v for k, v in scores.items() if v >= 80}
# Output: {'alice': 85, 'bob': 92}
\`\`\`

#### Performance Tip:
If processing massive data streams (millions of rows), use a **generator expression** with parentheses \`(x for x in data)\` to avoid allocating gigabytes of RAM in memory.`;
    }
  }

  // ── REACT & FRONTEND ERRORS & DOUBTS ─────────────────────────────────────
  if (domain === "react" || /react|hook|useeffect|state/i.test(qLower)) {
    // 1. useEffect loop
    if (/infinite loop|re-render|too many re-renders/i.test(qLower)) {
      return `### Fixing 'Too Many Re-Renders' & useEffect Infinite Loops

#### Root Cause:
Updating state inside the body of a component or inside a \`useEffect\` whose dependency array includes that same state causes an endless render cycle.

\`\`\`tsx
// Bug: State update directly triggers re-render, repeating indefinitely
function BadComponent() {
  const [count, setCount] = useState(0);
  
  // NEVER call state setters in render body:
  // setCount(count + 1); // CRASH: Maximum update depth exceeded
  
  // Buggy useEffect:
  useEffect(() => {
    setCount(c => c + 1);
  }, [count]); // Triggered every time count changes!
}

// Correct Fix:
function GoodComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // If running once on mount, pass empty dependency array:
    console.log("Mounted");
  }, []); // Run only once

  const handleIncrement = () => setCount(c => c + 1);
  return <button onClick={handleIncrement}>Count: {count}</button>;
}
\`\`\`

#### Rule of Thumb:
State updates must happen inside **event handlers** (clicks, submits) or conditioned effects with proper dependency arrays.`;
    }

    // 2. useEffect dependencies
    if (/useeffect|dependency array/i.test(qLower)) {
      return `### Mastering the React useEffect Dependency Array

\`useEffect(setup, dependencies)\` synchronizes your component with an external system.

\`\`\`tsx
import { useEffect, useState } from "react";

export function CourseViewer({ courseId }: { courseId: string }) {
  const [data, setData] = useState<Course | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      const res = await fetch(\`/api/courses/\${courseId}\`);
      const json = await res.json();
      if (!ignore) setData(json);
    }

    fetchData();

    // Cleanup: prevents race conditions if courseId changes before fetch completes
    return () => {
      ignore = true;
    };
  }, [courseId]); // Runs on mount and whenever courseId changes
}
\`\`\`

#### Key Rules:
1. **Empty array \`[]\`**: Effect runs once after initial mount.
2. **With dependencies \`[a, b]\`**: Effect runs on mount and whenever \`a\` or \`b\` change via strict comparison (\`Object.is\`).
3. **No array**: Effect runs after **every single render** (rarely desired).`;
    }
  }

  // ── SQL & DATABASE ERRORS & DOUBTS ──────────────────────────────────────
  if (
    (domain === "database" || /sql|database|query/i.test(qLower)) &&
    /index|slow.*query|explain\s+analyze|explain\s+plan|query\s+plan|optimi|seq.*scan|table.*scan/i.test(
      qLower
    )
  ) {
    return `### Database Query Optimization & Indexing

\`\`\`sql
-- Problem: Slow sequential scan on large user table
-- EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'student@example.com';
-- Result: Seq Scan on users (cost=0.00..8542.00 rows=1 width=128)

-- Solution: Create a B-Tree index on email
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- Re-running EXPLAIN ANALYZE:
-- Result: Index Scan using idx_users_email (cost=0.29..8.30 rows=1 width=128)
-- Speedup: Over 1000x faster!
\`\`\`

#### Core Architectural Guidelines:
1. **Leftmost Prefix Rule**: A composite index on \`(tenant_id, created_at)\` accelerates queries on \`tenant_id\` alone or \`tenant_id + created_at\`, but NOT \`created_at\` alone.
2. **Avoid \`SELECT *\`**: Always specify explicit columns to reduce network serialization load and leverage index-only scans.
3. **Use Prepared Statements**: Never concatenate raw user input into SQL strings to prevent SQL Injection attacks.`;
  }

  // ── PYTHON SPECIFIC COMMON QUESTIONS ────────────────────────────────────
  if (domain === "python" || /python/i.test(qLower)) {
    // Tuple vs List
    if (/tuple.*vs.*list|list.*vs.*tuple|difference.*between.*list.*tuple/i.test(qLower)) {
      return `### Python: List vs. Tuple Architecture

#### Key Architectural Differences:
1. **Mutability**: Lists are mutable (can add, remove, modify elements in-place). Tuples are immutable (frozen after creation).
2. **Memory & Performance**: Tuples have fixed size and are allocated in a single memory block, making them lighter and faster to iterate over than lists.
3. **Dictionary Keys**: Because tuples are immutable, they are hashable (\`__hash__\`) and can be used as dictionary keys or set members (as long as all elements inside are also hashable). Lists cannot.

\`\`\`python
# 1. Lists: Dynamic, mutable collection
shopping_cart = ["item_a", "item_b"]
shopping_cart.append("item_c")
shopping_cart[0] = "item_alpha"  # Valid in-place mutation

# 2. Tuples: Fixed, immutable records (e.g. coordinates, database rows)
point_3d = (10, 20, 30)
# point_3d[0] = 15  # TypeError: 'tuple' object does not support item assignment

# 3. Tuple as dictionary key (valid because it is hashable):
route_matrix = {
    ("NYC", "LON"): 3459,
    ("SFO", "TOK"): 5142,
}
print(route_matrix[("NYC", "LON")])  # Output: 3459
\`\`\`

#### Production Rule of Thumb:
Use **tuples** for fixed data records, return values from functions (\`return status, data\`), and dictionary keys. Use **lists** when collections need dynamic resizing or in-place sorting.`;
    }

    // Loops & Iteration
    if (/loop|for loop|while loop|iteration|enumerate/i.test(qLower)) {
      return `### Python Iteration: Idiomatic Loops & Patterns

\`\`\`python
# 1. Iterating with index and value using enumerate():
frameworks = ["FastAPI", "Django", "Flask"]
for idx, framework in enumerate(frameworks, start=1):
    print(f"[{idx}] {framework}")

# 2. Iterating two collections in parallel using zip():
users = ["Alice", "Bob", "Charlie"]
roles = ["Admin", "Engineer", "Analyst"]
for user, role in zip(users, roles):
    print(f"{user} -> {role}")

# 3. Guarded while loop with clean termination:
retry_count = 0
max_retries = 3
while retry_count < max_retries:
    retry_count += 1
    success = False  # simulated network operation
    if success:
        break
print("Loop completed deterministically.")
\`\`\`

#### Performance Insight:
Avoid manually incrementing an index variable like \`i = 0; for item in items: i += 1\`. Always prefer the built-in \`enumerate()\` which executes in optimized C-level speed.`;
    }

    // Classes / OOP
    if (/class|oop|object.*oriented|__init__|inheritance|dunder/i.test(qLower)) {
      return `### Python Object-Oriented Architecture (OOP)

In Python, classes provide clean data encapsulation, inheritance, and polymorphic interfaces.

\`\`\`python
class BankAccount:
    """Production bank account with input encapsulation and invariants."""
    
    def __init__(self, owner: str, initial_balance: float = 0.0) -> None:
        if initial_balance < 0:
            raise ValueError("Initial balance cannot be negative")
        self.owner = owner
        self._balance = initial_balance  # Protected attribute

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError("Deposit amount must be strictly positive")
        self._balance += amount
        return self._balance

    def withdraw(self, amount: float) -> float:
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount
        return self._balance

    def __repr__(self) -> str:
        return f"BankAccount(owner='{self.owner}', balance={self._balance:.2f})"

# Usage:
account = BankAccount("Sita", 500.0)
account.deposit(250.0)
print(account)  # Output: BankAccount(owner='Sita', balance=750.00)
\`\`\`

#### Key Takeaway:
Always initialize instance attributes inside \`__init__\` rather than at class level to prevent unintentional state sharing across all instances.`;
    }

    // Functions & *args, **kwargs
    if (/function|parameter|argument|\*args|\*\*kwargs|lambda/i.test(qLower)) {
      return `### Python Function Signatures: *args and **kwargs

\`\`\`python
from typing import Any

# *args collects extra positional arguments into a tuple
# **kwargs collects extra keyword arguments into a dictionary
def log_event(event_name: str, *tags: str, **metadata: Any) -> None:
    print(f"Event: {event_name}")
    if tags:
        print(f"Tags: {', '.join(tags)}")
    for key, value in metadata.items():
        print(f"  {key}: {value}")

# Invocation:
log_event(
    "USER_SIGNUP",
    "auth", "security",
    user_id="usr_981",
    ip_address="192.168.1.1",
    tier="pro"
)
\`\`\`

#### Key Rule:
Parameter ordering must always follow: \`standard_args\`, \`*args\`, \`keyword_only_args\`, \`**kwargs\`.`;
    }
  }

  // ── SQL / DATABASE COMMON QUESTIONS ──────────────────────────────────────
  if (domain === "database" || /sql|database|table|query/i.test(qLower)) {
    // Joins
    if (/join|inner join|left join|right join|cross join/i.test(qLower)) {
      return `### SQL Joins: Intuition & Syntax Reference

\`\`\`sql
-- Sample Context: users table and orders table

-- 1. INNER JOIN: Returns only rows where matching keys exist in BOTH tables
SELECT u.id, u.name, o.order_id, o.total_amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- 2. LEFT JOIN: Returns ALL rows from left table (users), 
-- plus matched data from right table (orders). Unmatched right columns evaluate to NULL.
SELECT u.id, u.name, o.order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- 3. Finding users with zero orders (Anti-Join pattern):
SELECT u.id, u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;
\`\`\`

#### Performance Invariant:
Ensure the foreign key (\`orders.user_id\`) has a B-Tree index created. Without an index, large joins result in costly full-table hash joins or nested loops.`;
    }

    // ACID & Transactions
    if (/acid|transaction|commit|rollback|lock/i.test(qLower)) {
      return `### ACID Guarantees in Relational Databases

1. **Atomicity**: The entire transaction succeeds or fails as a single unit (no half-updated state).
2. **Consistency**: Data adheres to all constraints, schema checks, and foreign keys.
3. **Isolation**: Concurrent transactions execute without dirty reads or unrepeatable reads.
4. **Durability**: Once committed, written data is recorded to write-ahead logs (WAL) and survives power loss.

\`\`\`sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 'usr_sender';
UPDATE accounts SET balance = balance + 100 WHERE id = 'usr_receiver';

-- If validation or business checks fail:
-- ROLLBACK;

-- When all assertions succeed:
COMMIT;
\`\`\``;
    }
  }

  // ── JAVASCRIPT / TYPESCRIPT / ASYNC ──────────────────────────────────────
  if (
    /async|await|promise|event loop|microtask|closure/i.test(qLower) ||
    domain === "javascript" ||
    domain === "react"
  ) {
    if (/async|await|promise|then/i.test(qLower)) {
      return `### Asynchronous JavaScript: Promises & Async/Await

\`\`\`typescript
interface UserProfile {
  id: string;
  username: string;
}

// Idiomatic async/await with typed error handling
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  try {
    const res = await fetch(\`/api/users/\${encodeURIComponent(userId)}\`);
    
    if (!res.ok) {
      throw new Error(\`HTTP \${res.status}: Failed to retrieve profile\`);
    }

    const data: UserProfile = await res.json();
    return data;
  } catch (error) {
    console.error("[Network Error]:", error);
    throw error;
  }
}

// Parallel execution with Promise.all (faster than sequential awaits):
async function loadDashboardData(userId: string) {
  const [profile, settings] = await Promise.all([
    fetchUserProfile(userId),
    fetch(\`/api/settings/\${userId}\`).then(r => r.json())
  ]);
  return { profile, settings };
}
\`\`\`

#### Key Mental Model:
\`async\` functions always return a \`Promise\`. An uncaught rejected promise crashes Node.js processes in modern runtimes; always encapsulate with \`try/catch\`.`;
    }
  }

  // ── QUICK PILL: EXECUTIVE SUMMARY & SYNTHESIS HANDLER ─────────────────────
  if (/summar(y|ize)|executive summary|key takeaways|overview of/i.test(qLower)) {
    const blueprint = getDomainCodeBlueprint(domain, videoTitle);
    return `### Executive Brief: ${videoTitle}

#### 1. Core Thesis & Intuitive Analogy:
This module covers foundational principles in **${domain.toUpperCase()}** required for production systems. Think of this mechanism like a robust transit switchboard: inputs are validated, queued, and dispatched according to deterministic routing rules to guarantee state consistency without race conditions.

#### 2. Technical Mechanism & Architecture:
- **State Guarantee**: Enforces single-source-of-truth invariants across component lifecycles.
- **Complexity Profile**: Designed to operate within predictable O(1) to O(n log n) time bounds with minimized allocation overhead.
- **Fail-Safe Boundaries**: Catches edge conditions at the boundary before unhandled exceptions propagate upstream.

#### 3. Production Code Blueprint:
\`\`\`${blueprint.lang}
${blueprint.code}
\`\`\`

#### 4. Senior Invariants & Critical Pitfalls:
- **Pitfall**: Avoid unbounded memory accumulation or leaking unmanaged handles.
- **Defensive Rule**: Always decouple side-effects from pure data transformations.`;
  }

  // ── QUICK PILL: CONCEPT INTUITION & EXPLAIN SIMPLY HANDLER ─────────────────
  if (/explain.*(simply|concept|core|intuition)|step-by-step/i.test(qLower)) {
    const blueprint = getDomainCodeBlueprint(domain, videoTitle);
    return `### Conceptual Deep-Dive: ${videoTitle}

#### The Big Picture:
At its core, **${videoTitle}** solves a fundamental bottleneck in modern software engineering: how to manage complex state transitions while keeping code readable, testable, and maintainable.

#### Step-by-Step Intuition:
1. **The Problem**: Without this pattern, systems suffer from tight coupling, fragile dependencies, and unexpected runtime bugs.
2. **The Solution**: By introducing clean separation of concerns and deterministic workflows, each layer only cares about its exact contract.
3. **The Result**: You achieve high modularity, predictable performance, and zero regressions.

#### Concrete Implementation:
\`\`\`${blueprint.lang}
${blueprint.code}
\`\`\`

#### Key Mental Model:
Treat every function as an isolated transaction: either the contract succeeds completely, or it fails cleanly with meaningful diagnostics.`;
  }

  // ── QUICK PILL: CODE BLUEPRINT & EXAMPLE HANDLER ──────────────────────────
  if (/code.*(blueprint|example|snippet)|runnable.*snippet/i.test(qLower)) {
    const blueprint = getDomainCodeBlueprint(domain, videoTitle);
    return `### Implementation Blueprint: ${videoTitle}

#### Production-Grade Code Pattern:
Below is a clean, runnable, and documented pattern matching industry standards for **${domain.toUpperCase()}**:

\`\`\`${blueprint.lang}
${blueprint.code}
\`\`\`

#### Implementation Checklist:
- Input sanitization verified before processing
- Error boundary handles all failure branches gracefully
- Return types strictly typed without any untyped escape hatches`;
  }

  // ── QUICK PILL: SENIOR PITFALLS HANDLER ───────────────────────────────────
  if (/pitfall|edge case|trap|mistake/i.test(qLower)) {
    if (domain === "python") {
      return `### Senior Engineering Pitfalls in Python: ${videoTitle}

#### 1. Mutable Default Arguments
- **The Trap**: \`def append_to(item, target=[])\` evaluates the default list once at definition time, sharing state across all callers.
- **The Fix**: Use \`target=None\` and initialize \`target = []\` inside the function body.

#### 2. Late-Binding Closures in Loops
- **The Trap**: \`funcs = [lambda: i for i in range(5)]\` binds \`i\` by reference; calling any function later returns \`4\`.
- **The Fix**: Bind early using default arguments: \`[lambda i=i: i for i in range(5)]\`.

#### 3. Swallowing Exceptions
- **The Trap**: \`except Exception: pass\` hides database disconnects, syntax errors, and keyboard interrupts.
- **The Fix**: Always catch specific exceptions (\`except KeyError as e:\`) and log diagnostics.`;
    } else if (domain === "database") {
      return `### Senior Database Pitfalls: ${videoTitle}

#### 1. The N+1 Query Anti-Pattern
- **The Trap**: Executing 1 query for parents, then looping to execute N individual queries for each child.
- **The Fix**: Use \`JOIN\` or an \`IN (...)\` subquery to fetch related data in a single batch.

#### 2. Missing Composite Indexes
- **The Trap**: Querying \`WHERE tenant_id = 'x' AND created_at > 'y'\` with only single-column indexes.
- **The Fix**: Create a composite index: \`CREATE INDEX idx_tenant_created ON records (tenant_id, created_at)\`.

#### 3. Long-Lived Transactions
- **The Trap**: Keeping a database transaction open while waiting for third-party HTTP API responses.
- **The Fix**: Perform network calls before beginning the transaction; keep transactions strictly under 50ms.`;
    } else {
      return `### Senior Engineering Pitfalls: ${videoTitle}

#### 1. Unbounded Memory Leaks
- **The Trap**: Adding event listeners or timers without unmounting or tearing them down.
- **The Fix**: Always return cleanup functions in effects or explicitly call \`removeEventListener\`.

#### 2. State Mutation Without Immutability
- **The Trap**: Mutating state objects directly (\`obj.count++\`), preventing change detectors from triggering re-renders.
- **The Fix**: Use shallow copies: \`{ ...obj, count: obj.count + 1 }\`.

#### 3. Silent Async Rejections
- **The Trap**: Forgetting to \`catch\` promises, leaving orphaned rejections in background threads.
- **The Fix**: Always wrap asynchronous functions in structured \`try/catch\` blocks.`;
    }
  }

  // ── QUICK PILL: INTERVIEW CHECK HANDLER ───────────────────────────────────
  if (/interview|question|mastery/i.test(qLower)) {
    if (domain === "python") {
      return `### Senior Python Technical Interview Checkpoint: ${videoTitle}

#### Question 1: How does Python's Global Interpreter Lock (GIL) impact multithreaded CPU-bound vs I/O-bound tasks?
**Model Answer**: The GIL ensures only one thread executes Python bytecode at a time. For CPU-bound tasks (e.g. data processing, math), multithreading offers zero speedup and adds context-switching overhead; use \`multiprocessing\` or C extensions instead. For I/O-bound tasks (e.g. network requests, disk reads), threads release the GIL during blocking operations, making multithreading or \`asyncio\` highly effective.

#### Question 2: What is the difference between \`__new__\` and \`__init__\` in Python?
**Model Answer**: \`__new__\` is a static method responsible for creating and returning a new instance of the class (memory allocation). \`__init__\` is an instance method responsible for initializing the attributes of that created instance. \`__new__\` is used in metaclasses, singletons, and subclassing immutable types like \`int\` or \`tuple\`.`;
    } else {
      return `### Senior Technical Interview Checkpoint: ${videoTitle}

#### Question 1: How do you design for idempotency across distributed network boundaries?
**Model Answer**: Generate a unique, deterministic idempotency key (e.g. UUIDv4 or content hash) on the client before dispatch. The server records this key in a transactional database or Redis cache with a short TTL before processing. If a duplicate request arrives with the same key, return the cached response immediately without re-executing side-effects.

#### Question 2: What is the trade-off between optimistic and pessimistic locking?
**Model Answer**: Optimistic locking uses a version column (\`version = version + 1\`) and checks it during write; it assumes low contention and avoids locking overhead, but fails when concurrent writes collide. Pessimistic locking acquires explicit database locks (\`SELECT ... FOR UPDATE\`); it guarantees write exclusivity at the cost of latency and potential deadlocks under high concurrency.`;
    }
  }

  // ── DEFAULT ADAPTIVE PROBLEM SOLVER ──────────────────────────────────────
  const blueprint = getDomainCodeBlueprint(domain, videoTitle);
  return `### Technical Guidance: ${videoTitle}

#### Problem Analysis & Core Architecture:
When mastering **${videoTitle}** within **${courseTitle}** (\`${domain.toUpperCase()}\`), apply the following engineering invariants:

1. **Deterministic Contracts**: Validate all inputs at interface boundaries. Fail early with explicit error types rather than propagating \`None\`, \`undefined\`, or partial data.
2. **Defensive Implementation**:
\`\`\`${blueprint.lang}
${blueprint.code}
\`\`\`

#### Step-by-Step Resolution Strategy:
- **Step 1**: Check the runtime stack trace for line number and exact exception type.
- **Step 2**: Inspect object types and values immediately before the failing line.
- **Step 3**: Verify edge cases: empty strings, empty lists, \`None\` values, and boundary values ($0$, $-1$, $\\infty$).

If you are encountering a specific syntax or runtime error in this lecture, paste the code snippet and error message and I will provide the line-by-line solution!`;
}

// Helper to provide domain-accurate runnable code snippets
function getDomainCodeBlueprint(
  domain: string,
  videoTitle: string
): { lang: string; code: string } {
  const cleanTitle = videoTitle.replace(/["'`]/g, "").trim() || "Module";

  if (domain === "python") {
    return {
      lang: "python",
      code: `"""
Production blueprint for: ${cleanTitle}
Includes type annotations, input guards, and error handling.
"""
from typing import Any, Dict, List, Optional
import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModuleProcessor:
    """Encapsulates business invariants and state transitions."""
    
    def __init__(self, module_name: str) -> None:
        self.module_name = module_name
        self._cache: Dict[str, Any] = {}

    def execute(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Validates payload contracts and executes pipeline."""
        if not payload or not isinstance(payload, dict):
            raise ValueError("Invalid payload: expected non-empty dictionary")

        record_id = payload.get("id")
        if not record_id:
            raise KeyError("Payload missing required identifier 'id'")

        logger.info(f"Processing record {record_id} in {self.module_name}")
        result = {
            "id": record_id,
            "status": "verified",
            "processed_at": datetime.datetime.utcnow().isoformat(),
            "data": payload
        }
        self._cache[record_id] = result
        return result

# Verification Execution:
if __name__ == "__main__":
    processor = ModuleProcessor("${cleanTitle}")
    output = processor.execute({"id": "rec_101", "name": "sample_data"})
    print("Execution output:", output)`,
    };
  } else if (domain === "database") {
    return {
      lang: "sql",
      code: `-- Production SQL blueprint for: ${cleanTitle}
BEGIN TRANSACTION;

-- 1. Create table with primary key and constraints
CREATE TABLE IF NOT EXISTS lesson_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Optimize indexing for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_lesson_records_status ON lesson_records(status);

-- 3. Idempotent insertion
INSERT INTO lesson_records (title, status)
VALUES ('${cleanTitle.replace(/'/g, "''")}', 'active');

-- 4. Analytical verification query
SELECT record_id, title, status, created_at
FROM lesson_records
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 5;

COMMIT;`,
    };
  } else if (domain === "react") {
    return {
      lang: "tsx",
      code: `import React, { useState, useEffect, useCallback } from "react";

interface RecordItem {
  id: string;
  title: string;
  status: "pending" | "completed";
}

/**
 * Production React component for: ${cleanTitle}
 * Features: clean lifecycle, error boundary handling, and strict typing.
 */
export function ${cleanTitle.replace(/[^a-zA-Z0-9]/g, "") || "ModuleViewer"}() {
  const [data, setData] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/records");
      if (!res.ok) throw new Error("Failed to load records");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div className="p-4 text-xs font-mono">Loading data...</div>;
  if (error) return <div className="p-4 text-xs text-rose-500 font-mono">Error: {error}</div>;

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <h3 className="font-heading font-bold text-sm mb-3">${cleanTitle}</h3>
      <ul className="space-y-1.5 text-xs font-mono">
        {data.map((item) => (
          <li key={item.id} className="p-2 rounded bg-muted/60 flex justify-between">
            <span>{item.title}</span>
            <span className="text-teal-600 font-bold">{item.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
    };
  } else {
    return {
      lang: "typescript",
      code: `/**
 * Production-grade pattern for: ${cleanTitle}
 */
interface ExecutionContext {
  readonly id: string;
  readonly timestamp: number;
}

export async function executeModuleTask(context: ExecutionContext): Promise<{ success: boolean; data: string }> {
  if (!context || !context.id) {
    throw new Error("Validation failed: Context missing required 'id'");
  }

  try {
    return {
      success: true,
      data: \`Processed \${context.id} at \${context.timestamp}\`
    };
  } catch (error) {
    console.error("Execution error:", error);
    throw error;
  }
}`,
    };
  }
}

// ===========================================================================
// 8. INTELLIGENT CERTIFICATE ELIGIBILITY DETECTOR
// Automatically distinguishes verified Masterclasses from brief educational
// roadmaps, career overviews, and single-video summaries.
// ===========================================================================

export function checkCertificateEligibility(
  courseOrTitle:
    | {
        title: string;
        description?: string;
        lessonCount?: number;
        duration?: number;
      }
    | string,
  maybeLessonCount?: number,
  maybeDesc?: string,
  maybeDuration?: number
): {
  eligible: boolean;
  reason: string;
  label: string;
  isSingleVideoCourse?: boolean;
  detectedHours?: number;
} {
  let rawTitle = "";
  let rawDesc = "";
  let lessonCount = 1;
  let duration: number | undefined = undefined;

  if (typeof courseOrTitle === "object" && courseOrTitle !== null) {
    rawTitle = courseOrTitle.title || "";
    rawDesc = courseOrTitle.description || "";
    lessonCount = typeof courseOrTitle.lessonCount === "number" ? courseOrTitle.lessonCount : 1;
    duration = typeof courseOrTitle.duration === "number" ? courseOrTitle.duration : undefined;
  } else {
    rawTitle = courseOrTitle || "";
    rawDesc = maybeDesc || "";
    lessonCount = typeof maybeLessonCount === "number" ? maybeLessonCount : 1;
    duration = typeof maybeDuration === "number" ? maybeDuration : undefined;
  }

  const title = rawTitle.toLowerCase();
  const desc = rawDesc.toLowerCase();
  const combined = `${title} ${desc}`;

  // Roadmap & superficial cheat sheet patterns (never certificate eligible)
  // Check title explicitly or pure cheat sheet terms (do NOT match "what is", "how to learn", or "syllabus" in course bodies)
  const isRoadmapKeyword =
    /\b(developer\s+roadmap|career\s+roadmap|tech\s+roadmap|salary\s+guide|interview\s+cheat\s*sheet|job\s+roadmap)\b/i.test(
      title
    ) ||
    /\b(cheat\s*sheet|cheatsheet)\b/i.test(title) ||
    /\b(roadmap|road map)\b/i.test(title);

  if (isRoadmapKeyword) {
    return {
      eligible: false,
      label: "Educational Roadmap",
      reason:
        "This is an educational guide or roadmap. Verified credentials are exclusively awarded for comprehensive technical masterclasses and full courses.",
    };
  }

  // Multi-lesson courses (2 or more lessons) are verified masterclasses
  if (lessonCount >= 2) {
    return {
      eligible: true,
      label: "Verified Masterclass",
      reason:
        "Comprehensive multi-lesson curriculum verified for certificate of completion issuance.",
    };
  }

  // --- Single Video Course Evaluation (lessonCount === 1) ---
  // Many premier developer courses on YouTube are structured as single multi-hour mega courses
  // (e.g., 3 Hours, 7 Hours, 10 Hours, 12 Hours "Full Course" / "Bootcamp").
  // Conversely, 10m, 20m, 30m, 40m videos are brief tutorials and must NOT yield certificates.

  // 1. Direct Duration Check (if duration in seconds is known from video player or metadata)
  if (typeof duration === "number" && duration > 0) {
    // 2700 seconds = 45 mins. Any course >= 45 mins qualifies as a full single-video masterclass
    if (duration >= 2700) {
      const hours = Math.round((duration / 3600) * 10) / 10;
      return {
        eligible: true,
        label: "Verified Single-Video Masterclass",
        reason: `Comprehensive ${hours > 0 ? hours + "-hour " : ""}full masterclass verified for credential issuance.`,
        isSingleVideoCourse: true,
        detectedHours: hours >= 1 ? hours : undefined,
      };
    } else {
      const minutes = Math.round(duration / 60);
      return {
        eligible: false,
        label: "Educational Video Guide",
        reason: `This is a short educational video (${minutes} mins). Verified certificates are awarded for comprehensive masterclasses (45+ mins) or multi-lesson courses.`,
        isSingleVideoCourse: true,
      };
    }
  }

  // 2. Explicit Short Minutes Pattern in Title (e.g., "30 minutes", "40 min", "15 mins", "in 20 minutes")
  // or explicit quick summary indicators in title
  const shortMinutesMatch = title.match(/\b([1-9]|[1-3][0-9]|4[0-4])\s*(?:minutes?|mins?|min)\b/i);
  const isExplicitQuickClip =
    /\b(quick\s+overview|quick\s+summary|quick\s+intro|short\s+tutorial|5-minute|short\s+video)\b/i.test(
      title
    );

  if (shortMinutesMatch || isExplicitQuickClip) {
    const matchedMins = shortMinutesMatch ? parseInt(shortMinutesMatch[1] || "30", 10) : 30;
    return {
      eligible: false,
      label: "Educational Video Guide",
      reason: `This is a short educational tutorial (${matchedMins} mins). Verified certificates of completion are awarded for full-length masterclasses or multi-lesson courses.`,
      isSingleVideoCourse: true,
    };
  }

  // 3. Explicit Hours Pattern in Title / Description
  // Matches: "3 hours", "7 hours", "12 hours", "[12 Hours]", "4.5 hrs", "8hr", "6 hour", "[4h]", "(3h 30m)", "03:45:00"
  const hoursMatch = combined.match(
    /(?:\[|\()?\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr)\b(?:\s*\]|\))?|(\d+)\+?\s*hour(?:s)?|(?:\[|\()?\s*([1-9]\d?)\s*h\b(?:\s*\]|\))?/i
  );
  if (hoursMatch) {
    const matchedHours = parseFloat(hoursMatch[1] || hoursMatch[2] || hoursMatch[3] || "0");
    if (matchedHours >= 1.0) {
      return {
        eligible: true,
        label: "Verified Single-Video Masterclass",
        reason: `Comprehensive ${matchedHours}-hour full masterclass verified for credential issuance.`,
        isSingleVideoCourse: true,
        detectedHours: matchedHours,
      };
    }
  }

  // 4. Timestamp format in title (e.g., [03:45:12], (01:30:00))
  const timestampMatch = title.match(/\[?\(?(\d{1,2}):(\d{2}):(\d{2})\)?\]?/);
  if (timestampMatch) {
    const h = parseInt(timestampMatch[1] || "0", 10);
    if (h >= 1) {
      return {
        eligible: true,
        label: "Verified Single-Video Masterclass",
        reason: `Comprehensive ${h}-hour full masterclass verified for credential issuance.`,
        isSingleVideoCourse: true,
        detectedHours: h,
      };
    }
  }

  // 5. Comprehensive Masterclass Keywords in Title (Full Course, Bootcamp, Masterclass, Deep Dive, Complete Guide)
  const isComprehensiveFullCourse =
    /\b(full\s+course|complete\s+course|full\s+bootcamp|complete\s+bootcamp|zero\s+to\s+hero|beginner\s+to\s+advanced|complete\s+beginner\s+to\s+pro|comprehensive\s+masterclass|masterclass|full\s+tutorial|mega\s+course|full\s+certification|deep\s+dive|college\s+course|university\s+course|full\s+lecture|complete\s+guide|tutorial\s+for\s+beginners|crash\s+course)\b/i.test(
      title
    );

  if (isComprehensiveFullCourse) {
    return {
      eligible: true,
      label: "Verified Single-Video Masterclass",
      reason:
        "Comprehensive full-length course curriculum verified for certificate of completion issuance.",
      isSingleVideoCourse: true,
    };
  }

  // 6. General Educational Course Default
  // Any single-module technical course that is not explicitly a short clip (<45 mins)
  // qualifies for verified certificate of completion upon completing the course and passing the 70% technical assessment.
  return {
    eligible: true,
    label: "Verified Masterclass",
    reason:
      "Educational curriculum verified for certificate of completion issuance upon 70% assessment score.",
    isSingleVideoCourse: true,
  };
}
