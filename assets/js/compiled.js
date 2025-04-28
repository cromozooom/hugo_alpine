'use strict';
(() => {
  // node_modules/alpinejs/dist/module.esm.js
  var flushPending = false;
  var flushing = false;
  var queue = [];
  var lastFlushedIndex = -1;
  function scheduler(callback) {
    queueJob(callback);
  }
  function queueJob(job) {
    if (!queue.includes(job)) queue.push(job);
    queueFlush();
  }
  function dequeueJob(job) {
    let index2 = queue.indexOf(job);
    if (index2 !== -1 && index2 > lastFlushedIndex) queue.splice(index2, 1);
  }
  function queueFlush() {
    if (!flushing && !flushPending) {
      flushPending = true;
      queueMicrotask(flushJobs);
    }
  }
  function flushJobs() {
    flushPending = false;
    flushing = true;
    for (let i = 0; i < queue.length; i++) {
      queue[i]();
      lastFlushedIndex = i;
    }
    queue.length = 0;
    lastFlushedIndex = -1;
    flushing = false;
  }
  var reactive;
  var effect;
  var release;
  var raw;
  var shouldSchedule = true;
  function disableEffectScheduling(callback) {
    shouldSchedule = false;
    callback();
    shouldSchedule = true;
  }
  function setReactivityEngine(engine) {
    reactive = engine.reactive;
    release = engine.release;
    effect = (callback) =>
      engine.effect(callback, {
        scheduler: (task) => {
          if (shouldSchedule) {
            scheduler(task);
          } else {
            task();
          }
        },
      });
    raw = engine.raw;
  }
  function overrideEffect(override) {
    effect = override;
  }
  function elementBoundEffect(el) {
    let cleanup2 = () => {};
    let wrappedEffect = (callback) => {
      let effectReference = effect(callback);
      if (!el._x_effects) {
        el._x_effects = /* @__PURE__ */ new Set();
        el._x_runEffects = () => {
          el._x_effects.forEach((i) => i());
        };
      }
      el._x_effects.add(effectReference);
      cleanup2 = () => {
        if (effectReference === void 0) return;
        el._x_effects.delete(effectReference);
        release(effectReference);
      };
      return effectReference;
    };
    return [
      wrappedEffect,
      () => {
        cleanup2();
      },
    ];
  }
  function watch(getter, callback) {
    let firstTime = true;
    let oldValue;
    let effectReference = effect(() => {
      let value = getter();
      JSON.stringify(value);
      if (!firstTime) {
        queueMicrotask(() => {
          callback(value, oldValue);
          oldValue = value;
        });
      } else {
        oldValue = value;
      }
      firstTime = false;
    });
    return () => release(effectReference);
  }
  var onAttributeAddeds = [];
  var onElRemoveds = [];
  var onElAddeds = [];
  function onElAdded(callback) {
    onElAddeds.push(callback);
  }
  function onElRemoved(el, callback) {
    if (typeof callback === 'function') {
      if (!el._x_cleanups) el._x_cleanups = [];
      el._x_cleanups.push(callback);
    } else {
      callback = el;
      onElRemoveds.push(callback);
    }
  }
  function onAttributesAdded(callback) {
    onAttributeAddeds.push(callback);
  }
  function onAttributeRemoved(el, name, callback) {
    if (!el._x_attributeCleanups) el._x_attributeCleanups = {};
    if (!el._x_attributeCleanups[name]) el._x_attributeCleanups[name] = [];
    el._x_attributeCleanups[name].push(callback);
  }
  function cleanupAttributes(el, names) {
    if (!el._x_attributeCleanups) return;
    Object.entries(el._x_attributeCleanups).forEach(([name, value]) => {
      if (names === void 0 || names.includes(name)) {
        value.forEach((i) => i());
        delete el._x_attributeCleanups[name];
      }
    });
  }
  function cleanupElement(el) {
    el._x_effects?.forEach(dequeueJob);
    while (el._x_cleanups?.length) el._x_cleanups.pop()();
  }
  var observer = new MutationObserver(onMutate);
  var currentlyObserving = false;
  function startObservingMutations() {
    observer.observe(document, { subtree: true, childList: true, attributes: true, attributeOldValue: true });
    currentlyObserving = true;
  }
  function stopObservingMutations() {
    flushObserver();
    observer.disconnect();
    currentlyObserving = false;
  }
  var queuedMutations = [];
  function flushObserver() {
    let records = observer.takeRecords();
    queuedMutations.push(() => records.length > 0 && onMutate(records));
    let queueLengthWhenTriggered = queuedMutations.length;
    queueMicrotask(() => {
      if (queuedMutations.length === queueLengthWhenTriggered) {
        while (queuedMutations.length > 0) queuedMutations.shift()();
      }
    });
  }
  function mutateDom(callback) {
    if (!currentlyObserving) return callback();
    stopObservingMutations();
    let result = callback();
    startObservingMutations();
    return result;
  }
  var isCollecting = false;
  var deferredMutations = [];
  function deferMutations() {
    isCollecting = true;
  }
  function flushAndStopDeferringMutations() {
    isCollecting = false;
    onMutate(deferredMutations);
    deferredMutations = [];
  }
  function onMutate(mutations) {
    if (isCollecting) {
      deferredMutations = deferredMutations.concat(mutations);
      return;
    }
    let addedNodes = [];
    let removedNodes = /* @__PURE__ */ new Set();
    let addedAttributes = /* @__PURE__ */ new Map();
    let removedAttributes = /* @__PURE__ */ new Map();
    for (let i = 0; i < mutations.length; i++) {
      if (mutations[i].target._x_ignoreMutationObserver) continue;
      if (mutations[i].type === 'childList') {
        mutations[i].removedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (!node._x_marker) return;
          removedNodes.add(node);
        });
        mutations[i].addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (removedNodes.has(node)) {
            removedNodes.delete(node);
            return;
          }
          if (node._x_marker) return;
          addedNodes.push(node);
        });
      }
      if (mutations[i].type === 'attributes') {
        let el = mutations[i].target;
        let name = mutations[i].attributeName;
        let oldValue = mutations[i].oldValue;
        let add2 = () => {
          if (!addedAttributes.has(el)) addedAttributes.set(el, []);
          addedAttributes.get(el).push({ name, value: el.getAttribute(name) });
        };
        let remove = () => {
          if (!removedAttributes.has(el)) removedAttributes.set(el, []);
          removedAttributes.get(el).push(name);
        };
        if (el.hasAttribute(name) && oldValue === null) {
          add2();
        } else if (el.hasAttribute(name)) {
          remove();
          add2();
        } else {
          remove();
        }
      }
    }
    removedAttributes.forEach((attrs, el) => {
      cleanupAttributes(el, attrs);
    });
    addedAttributes.forEach((attrs, el) => {
      onAttributeAddeds.forEach((i) => i(el, attrs));
    });
    for (let node of removedNodes) {
      if (addedNodes.some((i) => i.contains(node))) continue;
      onElRemoveds.forEach((i) => i(node));
    }
    for (let node of addedNodes) {
      if (!node.isConnected) continue;
      onElAddeds.forEach((i) => i(node));
    }
    addedNodes = null;
    removedNodes = null;
    addedAttributes = null;
    removedAttributes = null;
  }
  function scope(node) {
    return mergeProxies(closestDataStack(node));
  }
  function addScopeToNode(node, data2, referenceNode) {
    node._x_dataStack = [data2, ...closestDataStack(referenceNode || node)];
    return () => {
      node._x_dataStack = node._x_dataStack.filter((i) => i !== data2);
    };
  }
  function closestDataStack(node) {
    if (node._x_dataStack) return node._x_dataStack;
    if (typeof ShadowRoot === 'function' && node instanceof ShadowRoot) {
      return closestDataStack(node.host);
    }
    if (!node.parentNode) {
      return [];
    }
    return closestDataStack(node.parentNode);
  }
  function mergeProxies(objects) {
    return new Proxy({ objects }, mergeProxyTrap);
  }
  var mergeProxyTrap = {
    ownKeys({ objects }) {
      return Array.from(new Set(objects.flatMap((i) => Object.keys(i))));
    },
    has({ objects }, name) {
      if (name == Symbol.unscopables) return false;
      return objects.some((obj) => Object.prototype.hasOwnProperty.call(obj, name) || Reflect.has(obj, name));
    },
    get({ objects }, name, thisProxy) {
      if (name == 'toJSON') return collapseProxies;
      return Reflect.get(objects.find((obj) => Reflect.has(obj, name)) || {}, name, thisProxy);
    },
    set({ objects }, name, value, thisProxy) {
      const target =
        objects.find((obj) => Object.prototype.hasOwnProperty.call(obj, name)) || objects[objects.length - 1];
      const descriptor = Object.getOwnPropertyDescriptor(target, name);
      if (descriptor?.set && descriptor?.get) return descriptor.set.call(thisProxy, value) || true;
      return Reflect.set(target, name, value);
    },
  };
  function collapseProxies() {
    let keys = Reflect.ownKeys(this);
    return keys.reduce((acc, key) => {
      acc[key] = Reflect.get(this, key);
      return acc;
    }, {});
  }
  function initInterceptors(data2) {
    let isObject2 = (val) => typeof val === 'object' && !Array.isArray(val) && val !== null;
    let recurse = (obj, basePath = '') => {
      Object.entries(Object.getOwnPropertyDescriptors(obj)).forEach(([key, { value, enumerable }]) => {
        if (enumerable === false || value === void 0) return;
        if (typeof value === 'object' && value !== null && value.__v_skip) return;
        let path = basePath === '' ? key : `${basePath}.${key}`;
        if (typeof value === 'object' && value !== null && value._x_interceptor) {
          obj[key] = value.initialize(data2, path, key);
        } else {
          if (isObject2(value) && value !== obj && !(value instanceof Element)) {
            recurse(value, path);
          }
        }
      });
    };
    return recurse(data2);
  }
  function interceptor(callback, mutateObj = () => {}) {
    let obj = {
      initialValue: void 0,
      _x_interceptor: true,
      initialize(data2, path, key) {
        return callback(
          this.initialValue,
          () => get(data2, path),
          (value) => set(data2, path, value),
          path,
          key,
        );
      },
    };
    mutateObj(obj);
    return (initialValue) => {
      if (typeof initialValue === 'object' && initialValue !== null && initialValue._x_interceptor) {
        let initialize = obj.initialize.bind(obj);
        obj.initialize = (data2, path, key) => {
          let innerValue = initialValue.initialize(data2, path, key);
          obj.initialValue = innerValue;
          return initialize(data2, path, key);
        };
      } else {
        obj.initialValue = initialValue;
      }
      return obj;
    };
  }
  function get(obj, path) {
    return path.split('.').reduce((carry, segment) => carry[segment], obj);
  }
  function set(obj, path, value) {
    if (typeof path === 'string') path = path.split('.');
    if (path.length === 1) obj[path[0]] = value;
    else if (path.length === 0) throw error;
    else {
      if (obj[path[0]]) return set(obj[path[0]], path.slice(1), value);
      else {
        obj[path[0]] = {};
        return set(obj[path[0]], path.slice(1), value);
      }
    }
  }
  var magics = {};
  function magic(name, callback) {
    magics[name] = callback;
  }
  function injectMagics(obj, el) {
    let memoizedUtilities = getUtilities(el);
    Object.entries(magics).forEach(([name, callback]) => {
      Object.defineProperty(obj, `$${name}`, {
        get() {
          return callback(el, memoizedUtilities);
        },
        enumerable: false,
      });
    });
    return obj;
  }
  function getUtilities(el) {
    let [utilities, cleanup2] = getElementBoundUtilities(el);
    let utils = { interceptor, ...utilities };
    onElRemoved(el, cleanup2);
    return utils;
  }
  function tryCatch(el, expression, callback, ...args) {
    try {
      return callback(...args);
    } catch (e) {
      handleError(e, el, expression);
    }
  }
  function handleError(error2, el, expression = void 0) {
    error2 = Object.assign(error2 ?? { message: 'No error message given.' }, { el, expression });
    console.warn(
      `Alpine Expression Error: ${error2.message}

${expression ? 'Expression: "' + expression + '"\n\n' : ''}`,
      el,
    );
    setTimeout(() => {
      throw error2;
    }, 0);
  }
  var shouldAutoEvaluateFunctions = true;
  function dontAutoEvaluateFunctions(callback) {
    let cache = shouldAutoEvaluateFunctions;
    shouldAutoEvaluateFunctions = false;
    let result = callback();
    shouldAutoEvaluateFunctions = cache;
    return result;
  }
  function evaluate(el, expression, extras = {}) {
    let result;
    evaluateLater(el, expression)((value) => (result = value), extras);
    return result;
  }
  function evaluateLater(...args) {
    return theEvaluatorFunction(...args);
  }
  var theEvaluatorFunction = normalEvaluator;
  function setEvaluator(newEvaluator) {
    theEvaluatorFunction = newEvaluator;
  }
  function normalEvaluator(el, expression) {
    let overriddenMagics = {};
    injectMagics(overriddenMagics, el);
    let dataStack = [overriddenMagics, ...closestDataStack(el)];
    let evaluator =
      typeof expression === 'function'
        ? generateEvaluatorFromFunction(dataStack, expression)
        : generateEvaluatorFromString(dataStack, expression, el);
    return tryCatch.bind(null, el, expression, evaluator);
  }
  function generateEvaluatorFromFunction(dataStack, func) {
    return (receiver = () => {}, { scope: scope2 = {}, params = [] } = {}) => {
      let result = func.apply(mergeProxies([scope2, ...dataStack]), params);
      runIfTypeOfFunction(receiver, result);
    };
  }
  var evaluatorMemo = {};
  function generateFunctionFromString(expression, el) {
    if (evaluatorMemo[expression]) {
      return evaluatorMemo[expression];
    }
    let AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    let rightSideSafeExpression =
      /^[\n\s]*if.*\(.*\)/.test(expression.trim()) || /^(let|const)\s/.test(expression.trim())
        ? `(async()=>{ ${expression} })()`
        : expression;
    const safeAsyncFunction = () => {
      try {
        let func2 = new AsyncFunction(
          ['__self', 'scope'],
          `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`,
        );
        Object.defineProperty(func2, 'name', {
          value: `[Alpine] ${expression}`,
        });
        return func2;
      } catch (error2) {
        handleError(error2, el, expression);
        return Promise.resolve();
      }
    };
    let func = safeAsyncFunction();
    evaluatorMemo[expression] = func;
    return func;
  }
  function generateEvaluatorFromString(dataStack, expression, el) {
    let func = generateFunctionFromString(expression, el);
    return (receiver = () => {}, { scope: scope2 = {}, params = [] } = {}) => {
      func.result = void 0;
      func.finished = false;
      let completeScope = mergeProxies([scope2, ...dataStack]);
      if (typeof func === 'function') {
        let promise = func(func, completeScope).catch((error2) => handleError(error2, el, expression));
        if (func.finished) {
          runIfTypeOfFunction(receiver, func.result, completeScope, params, el);
          func.result = void 0;
        } else {
          promise
            .then((result) => {
              runIfTypeOfFunction(receiver, result, completeScope, params, el);
            })
            .catch((error2) => handleError(error2, el, expression))
            .finally(() => (func.result = void 0));
        }
      }
    };
  }
  function runIfTypeOfFunction(receiver, value, scope2, params, el) {
    if (shouldAutoEvaluateFunctions && typeof value === 'function') {
      let result = value.apply(scope2, params);
      if (result instanceof Promise) {
        result
          .then((i) => runIfTypeOfFunction(receiver, i, scope2, params))
          .catch((error2) => handleError(error2, el, value));
      } else {
        receiver(result);
      }
    } else if (typeof value === 'object' && value instanceof Promise) {
      value.then((i) => receiver(i));
    } else {
      receiver(value);
    }
  }
  var prefixAsString = 'x-';
  function prefix(subject = '') {
    return prefixAsString + subject;
  }
  function setPrefix(newPrefix) {
    prefixAsString = newPrefix;
  }
  var directiveHandlers = {};
  function directive(name, callback) {
    directiveHandlers[name] = callback;
    return {
      before(directive2) {
        if (!directiveHandlers[directive2]) {
          console.warn(
            String.raw`Cannot find directive \`${directive2}\`. \`${name}\` will use the default order of execution`,
          );
          return;
        }
        const pos = directiveOrder.indexOf(directive2);
        directiveOrder.splice(pos >= 0 ? pos : directiveOrder.indexOf('DEFAULT'), 0, name);
      },
    };
  }
  function directiveExists(name) {
    return Object.keys(directiveHandlers).includes(name);
  }
  function directives(el, attributes, originalAttributeOverride) {
    attributes = Array.from(attributes);
    if (el._x_virtualDirectives) {
      let vAttributes = Object.entries(el._x_virtualDirectives).map(([name, value]) => ({ name, value }));
      let staticAttributes = attributesOnly(vAttributes);
      vAttributes = vAttributes.map((attribute) => {
        if (staticAttributes.find((attr) => attr.name === attribute.name)) {
          return {
            name: `x-bind:${attribute.name}`,
            value: `"${attribute.value}"`,
          };
        }
        return attribute;
      });
      attributes = attributes.concat(vAttributes);
    }
    let transformedAttributeMap = {};
    let directives2 = attributes
      .map(toTransformedAttributes((newName, oldName) => (transformedAttributeMap[newName] = oldName)))
      .filter(outNonAlpineAttributes)
      .map(toParsedDirectives(transformedAttributeMap, originalAttributeOverride))
      .sort(byPriority);
    return directives2.map((directive2) => {
      return getDirectiveHandler(el, directive2);
    });
  }
  function attributesOnly(attributes) {
    return Array.from(attributes)
      .map(toTransformedAttributes())
      .filter((attr) => !outNonAlpineAttributes(attr));
  }
  var isDeferringHandlers = false;
  var directiveHandlerStacks = /* @__PURE__ */ new Map();
  var currentHandlerStackKey = Symbol();
  function deferHandlingDirectives(callback) {
    isDeferringHandlers = true;
    let key = Symbol();
    currentHandlerStackKey = key;
    directiveHandlerStacks.set(key, []);
    let flushHandlers = () => {
      while (directiveHandlerStacks.get(key).length) directiveHandlerStacks.get(key).shift()();
      directiveHandlerStacks.delete(key);
    };
    let stopDeferring = () => {
      isDeferringHandlers = false;
      flushHandlers();
    };
    callback(flushHandlers);
    stopDeferring();
  }
  function getElementBoundUtilities(el) {
    let cleanups = [];
    let cleanup2 = (callback) => cleanups.push(callback);
    let [effect32, cleanupEffect] = elementBoundEffect(el);
    cleanups.push(cleanupEffect);
    let utilities = {
      Alpine: alpine_default,
      effect: effect32,
      cleanup: cleanup2,
      evaluateLater: evaluateLater.bind(evaluateLater, el),
      evaluate: evaluate.bind(evaluate, el),
    };
    let doCleanup = () => cleanups.forEach((i) => i());
    return [utilities, doCleanup];
  }
  function getDirectiveHandler(el, directive2) {
    let noop = () => {};
    let handler4 = directiveHandlers[directive2.type] || noop;
    let [utilities, cleanup2] = getElementBoundUtilities(el);
    onAttributeRemoved(el, directive2.original, cleanup2);
    let fullHandler = () => {
      if (el._x_ignore || el._x_ignoreSelf) return;
      handler4.inline && handler4.inline(el, directive2, utilities);
      handler4 = handler4.bind(handler4, el, directive2, utilities);
      isDeferringHandlers ? directiveHandlerStacks.get(currentHandlerStackKey).push(handler4) : handler4();
    };
    fullHandler.runCleanups = cleanup2;
    return fullHandler;
  }
  var startingWith =
    (subject, replacement) =>
    ({ name, value }) => {
      if (name.startsWith(subject)) name = name.replace(subject, replacement);
      return { name, value };
    };
  var into = (i) => i;
  function toTransformedAttributes(callback = () => {}) {
    return ({ name, value }) => {
      let { name: newName, value: newValue } = attributeTransformers.reduce(
        (carry, transform) => {
          return transform(carry);
        },
        { name, value },
      );
      if (newName !== name) callback(newName, name);
      return { name: newName, value: newValue };
    };
  }
  var attributeTransformers = [];
  function mapAttributes(callback) {
    attributeTransformers.push(callback);
  }
  function outNonAlpineAttributes({ name }) {
    return alpineAttributeRegex().test(name);
  }
  var alpineAttributeRegex = () => new RegExp(`^${prefixAsString}([^:^.]+)\\b`);
  function toParsedDirectives(transformedAttributeMap, originalAttributeOverride) {
    return ({ name, value }) => {
      let typeMatch = name.match(alpineAttributeRegex());
      let valueMatch = name.match(/:([a-zA-Z0-9\-_:]+)/);
      let modifiers = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
      let original = originalAttributeOverride || transformedAttributeMap[name] || name;
      return {
        type: typeMatch ? typeMatch[1] : null,
        value: valueMatch ? valueMatch[1] : null,
        modifiers: modifiers.map((i) => i.replace('.', '')),
        expression: value,
        original,
      };
    };
  }
  var DEFAULT = 'DEFAULT';
  var directiveOrder = [
    'ignore',
    'ref',
    'data',
    'id',
    'anchor',
    'bind',
    'init',
    'for',
    'model',
    'modelable',
    'transition',
    'show',
    'if',
    DEFAULT,
    'teleport',
  ];
  function byPriority(a, b) {
    let typeA = directiveOrder.indexOf(a.type) === -1 ? DEFAULT : a.type;
    let typeB = directiveOrder.indexOf(b.type) === -1 ? DEFAULT : b.type;
    return directiveOrder.indexOf(typeA) - directiveOrder.indexOf(typeB);
  }
  function dispatch(el, name, detail = {}) {
    el.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        // Allows events to pass the shadow DOM barrier.
        composed: true,
        cancelable: true,
      }),
    );
  }
  function walk(el, callback) {
    if (typeof ShadowRoot === 'function' && el instanceof ShadowRoot) {
      Array.from(el.children).forEach((el2) => walk(el2, callback));
      return;
    }
    let skip = false;
    callback(el, () => (skip = true));
    if (skip) return;
    let node = el.firstElementChild;
    while (node) {
      walk(node, callback, false);
      node = node.nextElementSibling;
    }
  }
  function warn(message, ...args) {
    console.warn(`Alpine Warning: ${message}`, ...args);
  }
  var started = false;
  function start() {
    if (started)
      warn(
        'Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.',
      );
    started = true;
    if (!document.body)
      warn(
        "Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?",
      );
    dispatch(document, 'alpine:init');
    dispatch(document, 'alpine:initializing');
    startObservingMutations();
    onElAdded((el) => initTree(el, walk));
    onElRemoved((el) => destroyTree(el));
    onAttributesAdded((el, attrs) => {
      directives(el, attrs).forEach((handle) => handle());
    });
    let outNestedComponents = (el) => !closestRoot(el.parentElement, true);
    Array.from(document.querySelectorAll(allSelectors().join(',')))
      .filter(outNestedComponents)
      .forEach((el) => {
        initTree(el);
      });
    dispatch(document, 'alpine:initialized');
    setTimeout(() => {
      warnAboutMissingPlugins();
    });
  }
  var rootSelectorCallbacks = [];
  var initSelectorCallbacks = [];
  function rootSelectors() {
    return rootSelectorCallbacks.map((fn2) => fn2());
  }
  function allSelectors() {
    return rootSelectorCallbacks.concat(initSelectorCallbacks).map((fn2) => fn2());
  }
  function addRootSelector(selectorCallback) {
    rootSelectorCallbacks.push(selectorCallback);
  }
  function addInitSelector(selectorCallback) {
    initSelectorCallbacks.push(selectorCallback);
  }
  function closestRoot(el, includeInitSelectors = false) {
    return findClosest(el, (element) => {
      const selectors = includeInitSelectors ? allSelectors() : rootSelectors();
      if (selectors.some((selector) => element.matches(selector))) return true;
    });
  }
  function findClosest(el, callback) {
    if (!el) return;
    if (callback(el)) return el;
    if (el._x_teleportBack) el = el._x_teleportBack;
    if (!el.parentElement) return;
    return findClosest(el.parentElement, callback);
  }
  function isRoot(el) {
    return rootSelectors().some((selector) => el.matches(selector));
  }
  var initInterceptors2 = [];
  function interceptInit(callback) {
    initInterceptors2.push(callback);
  }
  var markerDispenser = 1;
  function initTree(el, walker = walk, intercept = () => {}) {
    if (findClosest(el, (i) => i._x_ignore)) return;
    deferHandlingDirectives(() => {
      walker(el, (el2, skip) => {
        if (el2._x_marker) return;
        intercept(el2, skip);
        initInterceptors2.forEach((i) => i(el2, skip));
        directives(el2, el2.attributes).forEach((handle) => handle());
        if (!el2._x_ignore) el2._x_marker = markerDispenser++;
        el2._x_ignore && skip();
      });
    });
  }
  function destroyTree(root, walker = walk) {
    walker(root, (el) => {
      cleanupElement(el);
      cleanupAttributes(el);
      delete el._x_marker;
    });
  }
  function warnAboutMissingPlugins() {
    let pluginDirectives = [
      ['ui', 'dialog', ['[x-dialog], [x-popover]']],
      ['anchor', 'anchor', ['[x-anchor]']],
      ['sort', 'sort', ['[x-sort]']],
    ];
    pluginDirectives.forEach(([plugin2, directive2, selectors]) => {
      if (directiveExists(directive2)) return;
      selectors.some((selector) => {
        if (document.querySelector(selector)) {
          warn(`found "${selector}", but missing ${plugin2} plugin`);
          return true;
        }
      });
    });
  }
  var tickStack = [];
  var isHolding = false;
  function nextTick(callback = () => {}) {
    queueMicrotask(() => {
      isHolding ||
        setTimeout(() => {
          releaseNextTicks();
        });
    });
    return new Promise((res) => {
      tickStack.push(() => {
        callback();
        res();
      });
    });
  }
  function releaseNextTicks() {
    isHolding = false;
    while (tickStack.length) tickStack.shift()();
  }
  function holdNextTicks() {
    isHolding = true;
  }
  function setClasses(el, value) {
    if (Array.isArray(value)) {
      return setClassesFromString(el, value.join(' '));
    } else if (typeof value === 'object' && value !== null) {
      return setClassesFromObject(el, value);
    } else if (typeof value === 'function') {
      return setClasses(el, value());
    }
    return setClassesFromString(el, value);
  }
  function setClassesFromString(el, classString) {
    let split = (classString2) => classString2.split(' ').filter(Boolean);
    let missingClasses = (classString2) =>
      classString2
        .split(' ')
        .filter((i) => !el.classList.contains(i))
        .filter(Boolean);
    let addClassesAndReturnUndo = (classes) => {
      el.classList.add(...classes);
      return () => {
        el.classList.remove(...classes);
      };
    };
    classString = classString === true ? (classString = '') : classString || '';
    return addClassesAndReturnUndo(missingClasses(classString));
  }
  function setClassesFromObject(el, classObject) {
    let split = (classString) => classString.split(' ').filter(Boolean);
    let forAdd = Object.entries(classObject)
      .flatMap(([classString, bool]) => (bool ? split(classString) : false))
      .filter(Boolean);
    let forRemove = Object.entries(classObject)
      .flatMap(([classString, bool]) => (!bool ? split(classString) : false))
      .filter(Boolean);
    let added = [];
    let removed = [];
    forRemove.forEach((i) => {
      if (el.classList.contains(i)) {
        el.classList.remove(i);
        removed.push(i);
      }
    });
    forAdd.forEach((i) => {
      if (!el.classList.contains(i)) {
        el.classList.add(i);
        added.push(i);
      }
    });
    return () => {
      removed.forEach((i) => el.classList.add(i));
      added.forEach((i) => el.classList.remove(i));
    };
  }
  function setStyles(el, value) {
    if (typeof value === 'object' && value !== null) {
      return setStylesFromObject(el, value);
    }
    return setStylesFromString(el, value);
  }
  function setStylesFromObject(el, value) {
    let previousStyles = {};
    Object.entries(value).forEach(([key, value2]) => {
      previousStyles[key] = el.style[key];
      if (!key.startsWith('--')) {
        key = kebabCase(key);
      }
      el.style.setProperty(key, value2);
    });
    setTimeout(() => {
      if (el.style.length === 0) {
        el.removeAttribute('style');
      }
    });
    return () => {
      setStyles(el, previousStyles);
    };
  }
  function setStylesFromString(el, value) {
    let cache = el.getAttribute('style', value);
    el.setAttribute('style', value);
    return () => {
      el.setAttribute('style', cache || '');
    };
  }
  function kebabCase(subject) {
    return subject.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  function once(callback, fallback = () => {}) {
    let called = false;
    return function () {
      if (!called) {
        called = true;
        callback.apply(this, arguments);
      } else {
        fallback.apply(this, arguments);
      }
    };
  }
  directive('transition', (el, { value, modifiers, expression }, { evaluate: evaluate2 }) => {
    if (typeof expression === 'function') expression = evaluate2(expression);
    if (expression === false) return;
    if (!expression || typeof expression === 'boolean') {
      registerTransitionsFromHelper(el, modifiers, value);
    } else {
      registerTransitionsFromClassString(el, expression, value);
    }
  });
  function registerTransitionsFromClassString(el, classString, stage) {
    registerTransitionObject(el, setClasses, '');
    let directiveStorageMap = {
      enter: (classes) => {
        el._x_transition.enter.during = classes;
      },
      'enter-start': (classes) => {
        el._x_transition.enter.start = classes;
      },
      'enter-end': (classes) => {
        el._x_transition.enter.end = classes;
      },
      leave: (classes) => {
        el._x_transition.leave.during = classes;
      },
      'leave-start': (classes) => {
        el._x_transition.leave.start = classes;
      },
      'leave-end': (classes) => {
        el._x_transition.leave.end = classes;
      },
    };
    directiveStorageMap[stage](classString);
  }
  function registerTransitionsFromHelper(el, modifiers, stage) {
    registerTransitionObject(el, setStyles);
    let doesntSpecify = !modifiers.includes('in') && !modifiers.includes('out') && !stage;
    let transitioningIn = doesntSpecify || modifiers.includes('in') || ['enter'].includes(stage);
    let transitioningOut = doesntSpecify || modifiers.includes('out') || ['leave'].includes(stage);
    if (modifiers.includes('in') && !doesntSpecify) {
      modifiers = modifiers.filter((i, index2) => index2 < modifiers.indexOf('out'));
    }
    if (modifiers.includes('out') && !doesntSpecify) {
      modifiers = modifiers.filter((i, index2) => index2 > modifiers.indexOf('out'));
    }
    let wantsAll = !modifiers.includes('opacity') && !modifiers.includes('scale');
    let wantsOpacity = wantsAll || modifiers.includes('opacity');
    let wantsScale = wantsAll || modifiers.includes('scale');
    let opacityValue = wantsOpacity ? 0 : 1;
    let scaleValue = wantsScale ? modifierValue(modifiers, 'scale', 95) / 100 : 1;
    let delay = modifierValue(modifiers, 'delay', 0) / 1e3;
    let origin = modifierValue(modifiers, 'origin', 'center');
    let property = 'opacity, transform';
    let durationIn = modifierValue(modifiers, 'duration', 150) / 1e3;
    let durationOut = modifierValue(modifiers, 'duration', 75) / 1e3;
    let easing = `cubic-bezier(0.4, 0.0, 0.2, 1)`;
    if (transitioningIn) {
      el._x_transition.enter.during = {
        transformOrigin: origin,
        transitionDelay: `${delay}s`,
        transitionProperty: property,
        transitionDuration: `${durationIn}s`,
        transitionTimingFunction: easing,
      };
      el._x_transition.enter.start = {
        opacity: opacityValue,
        transform: `scale(${scaleValue})`,
      };
      el._x_transition.enter.end = {
        opacity: 1,
        transform: `scale(1)`,
      };
    }
    if (transitioningOut) {
      el._x_transition.leave.during = {
        transformOrigin: origin,
        transitionDelay: `${delay}s`,
        transitionProperty: property,
        transitionDuration: `${durationOut}s`,
        transitionTimingFunction: easing,
      };
      el._x_transition.leave.start = {
        opacity: 1,
        transform: `scale(1)`,
      };
      el._x_transition.leave.end = {
        opacity: opacityValue,
        transform: `scale(${scaleValue})`,
      };
    }
  }
  function registerTransitionObject(el, setFunction, defaultValue = {}) {
    if (!el._x_transition)
      el._x_transition = {
        enter: { during: defaultValue, start: defaultValue, end: defaultValue },
        leave: { during: defaultValue, start: defaultValue, end: defaultValue },
        in(before = () => {}, after = () => {}) {
          transition(
            el,
            setFunction,
            {
              during: this.enter.during,
              start: this.enter.start,
              end: this.enter.end,
            },
            before,
            after,
          );
        },
        out(before = () => {}, after = () => {}) {
          transition(
            el,
            setFunction,
            {
              during: this.leave.during,
              start: this.leave.start,
              end: this.leave.end,
            },
            before,
            after,
          );
        },
      };
  }
  window.Element.prototype._x_toggleAndCascadeWithTransitions = function (el, value, show, hide2) {
    const nextTick2 = document.visibilityState === 'visible' ? requestAnimationFrame : setTimeout;
    let clickAwayCompatibleShow = () => nextTick2(show);
    if (value) {
      if (el._x_transition && (el._x_transition.enter || el._x_transition.leave)) {
        el._x_transition.enter &&
        (Object.entries(el._x_transition.enter.during).length ||
          Object.entries(el._x_transition.enter.start).length ||
          Object.entries(el._x_transition.enter.end).length)
          ? el._x_transition.in(show)
          : clickAwayCompatibleShow();
      } else {
        el._x_transition ? el._x_transition.in(show) : clickAwayCompatibleShow();
      }
      return;
    }
    el._x_hidePromise = el._x_transition
      ? new Promise((resolve, reject) => {
          el._x_transition.out(
            () => {},
            () => resolve(hide2),
          );
          el._x_transitioning && el._x_transitioning.beforeCancel(() => reject({ isFromCancelledTransition: true }));
        })
      : Promise.resolve(hide2);
    queueMicrotask(() => {
      let closest2 = closestHide(el);
      if (closest2) {
        if (!closest2._x_hideChildren) closest2._x_hideChildren = [];
        closest2._x_hideChildren.push(el);
      } else {
        nextTick2(() => {
          let hideAfterChildren = (el2) => {
            let carry = Promise.all([el2._x_hidePromise, ...(el2._x_hideChildren || []).map(hideAfterChildren)]).then(
              ([i]) => i?.(),
            );
            delete el2._x_hidePromise;
            delete el2._x_hideChildren;
            return carry;
          };
          hideAfterChildren(el).catch((e) => {
            if (!e.isFromCancelledTransition) throw e;
          });
        });
      }
    });
  };
  function closestHide(el) {
    let parent = el.parentNode;
    if (!parent) return;
    return parent._x_hidePromise ? parent : closestHide(parent);
  }
  function transition(
    el,
    setFunction,
    { during, start: start22, end: end2 } = {},
    before = () => {},
    after = () => {},
  ) {
    if (el._x_transitioning) el._x_transitioning.cancel();
    if (Object.keys(during).length === 0 && Object.keys(start22).length === 0 && Object.keys(end2).length === 0) {
      before();
      after();
      return;
    }
    let undoStart, undoDuring, undoEnd;
    performTransition(el, {
      start() {
        undoStart = setFunction(el, start22);
      },
      during() {
        undoDuring = setFunction(el, during);
      },
      before,
      end() {
        undoStart();
        undoEnd = setFunction(el, end2);
      },
      after,
      cleanup() {
        undoDuring();
        undoEnd();
      },
    });
  }
  function performTransition(el, stages) {
    let interrupted, reachedBefore, reachedEnd;
    let finish = once(() => {
      mutateDom(() => {
        interrupted = true;
        if (!reachedBefore) stages.before();
        if (!reachedEnd) {
          stages.end();
          releaseNextTicks();
        }
        stages.after();
        if (el.isConnected) stages.cleanup();
        delete el._x_transitioning;
      });
    });
    el._x_transitioning = {
      beforeCancels: [],
      beforeCancel(callback) {
        this.beforeCancels.push(callback);
      },
      cancel: once(function () {
        while (this.beforeCancels.length) {
          this.beforeCancels.shift()();
        }
        finish();
      }),
      finish,
    };
    mutateDom(() => {
      stages.start();
      stages.during();
    });
    holdNextTicks();
    requestAnimationFrame(() => {
      if (interrupted) return;
      let duration = Number(getComputedStyle(el).transitionDuration.replace(/,.*/, '').replace('s', '')) * 1e3;
      let delay = Number(getComputedStyle(el).transitionDelay.replace(/,.*/, '').replace('s', '')) * 1e3;
      if (duration === 0) duration = Number(getComputedStyle(el).animationDuration.replace('s', '')) * 1e3;
      mutateDom(() => {
        stages.before();
      });
      reachedBefore = true;
      requestAnimationFrame(() => {
        if (interrupted) return;
        mutateDom(() => {
          stages.end();
        });
        releaseNextTicks();
        setTimeout(el._x_transitioning.finish, duration + delay);
        reachedEnd = true;
      });
    });
  }
  function modifierValue(modifiers, key, fallback) {
    if (modifiers.indexOf(key) === -1) return fallback;
    const rawValue = modifiers[modifiers.indexOf(key) + 1];
    if (!rawValue) return fallback;
    if (key === 'scale') {
      if (isNaN(rawValue)) return fallback;
    }
    if (key === 'duration' || key === 'delay') {
      let match = rawValue.match(/([0-9]+)ms/);
      if (match) return match[1];
    }
    if (key === 'origin') {
      if (['top', 'right', 'left', 'center', 'bottom'].includes(modifiers[modifiers.indexOf(key) + 2])) {
        return [rawValue, modifiers[modifiers.indexOf(key) + 2]].join(' ');
      }
    }
    return rawValue;
  }
  var isCloning = false;
  function skipDuringClone(callback, fallback = () => {}) {
    return (...args) => (isCloning ? fallback(...args) : callback(...args));
  }
  function onlyDuringClone(callback) {
    return (...args) => isCloning && callback(...args);
  }
  var interceptors = [];
  function interceptClone(callback) {
    interceptors.push(callback);
  }
  function cloneNode(from, to) {
    interceptors.forEach((i) => i(from, to));
    isCloning = true;
    dontRegisterReactiveSideEffects(() => {
      initTree(to, (el, callback) => {
        callback(el, () => {});
      });
    });
    isCloning = false;
  }
  var isCloningLegacy = false;
  function clone(oldEl, newEl) {
    if (!newEl._x_dataStack) newEl._x_dataStack = oldEl._x_dataStack;
    isCloning = true;
    isCloningLegacy = true;
    dontRegisterReactiveSideEffects(() => {
      cloneTree(newEl);
    });
    isCloning = false;
    isCloningLegacy = false;
  }
  function cloneTree(el) {
    let hasRunThroughFirstEl = false;
    let shallowWalker = (el2, callback) => {
      walk(el2, (el3, skip) => {
        if (hasRunThroughFirstEl && isRoot(el3)) return skip();
        hasRunThroughFirstEl = true;
        callback(el3, skip);
      });
    };
    initTree(el, shallowWalker);
  }
  function dontRegisterReactiveSideEffects(callback) {
    let cache = effect;
    overrideEffect((callback2, el) => {
      let storedEffect = cache(callback2);
      release(storedEffect);
      return () => {};
    });
    callback();
    overrideEffect(cache);
  }
  function bind(el, name, value, modifiers = []) {
    if (!el._x_bindings) el._x_bindings = reactive({});
    el._x_bindings[name] = value;
    name = modifiers.includes('camel') ? camelCase(name) : name;
    switch (name) {
      case 'value':
        bindInputValue(el, value);
        break;
      case 'style':
        bindStyles(el, value);
        break;
      case 'class':
        bindClasses(el, value);
        break;
      case 'selected':
      case 'checked':
        bindAttributeAndProperty(el, name, value);
        break;
      default:
        bindAttribute(el, name, value);
        break;
    }
  }
  function bindInputValue(el, value) {
    if (isRadio(el)) {
      if (el.attributes.value === void 0) {
        el.value = value;
      }
      if (window.fromModel) {
        if (typeof value === 'boolean') {
          el.checked = safeParseBoolean(el.value) === value;
        } else {
          el.checked = checkedAttrLooseCompare(el.value, value);
        }
      }
    } else if (isCheckbox(el)) {
      if (Number.isInteger(value)) {
        el.value = value;
      } else if (!Array.isArray(value) && typeof value !== 'boolean' && ![null, void 0].includes(value)) {
        el.value = String(value);
      } else {
        if (Array.isArray(value)) {
          el.checked = value.some((val) => checkedAttrLooseCompare(val, el.value));
        } else {
          el.checked = !!value;
        }
      }
    } else if (el.tagName === 'SELECT') {
      updateSelect(el, value);
    } else {
      if (el.value === value) return;
      el.value = value === void 0 ? '' : value;
    }
  }
  function bindClasses(el, value) {
    if (el._x_undoAddedClasses) el._x_undoAddedClasses();
    el._x_undoAddedClasses = setClasses(el, value);
  }
  function bindStyles(el, value) {
    if (el._x_undoAddedStyles) el._x_undoAddedStyles();
    el._x_undoAddedStyles = setStyles(el, value);
  }
  function bindAttributeAndProperty(el, name, value) {
    bindAttribute(el, name, value);
    setPropertyIfChanged(el, name, value);
  }
  function bindAttribute(el, name, value) {
    if ([null, void 0, false].includes(value) && attributeShouldntBePreservedIfFalsy(name)) {
      el.removeAttribute(name);
    } else {
      if (isBooleanAttr(name)) value = name;
      setIfChanged(el, name, value);
    }
  }
  function setIfChanged(el, attrName, value) {
    if (el.getAttribute(attrName) != value) {
      el.setAttribute(attrName, value);
    }
  }
  function setPropertyIfChanged(el, propName, value) {
    if (el[propName] !== value) {
      el[propName] = value;
    }
  }
  function updateSelect(el, value) {
    const arrayWrappedValue = [].concat(value).map((value2) => {
      return value2 + '';
    });
    Array.from(el.options).forEach((option2) => {
      option2.selected = arrayWrappedValue.includes(option2.value);
    });
  }
  function camelCase(subject) {
    return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
  }
  function checkedAttrLooseCompare(valueA, valueB) {
    return valueA == valueB;
  }
  function safeParseBoolean(rawValue) {
    if ([1, '1', 'true', 'on', 'yes', true].includes(rawValue)) {
      return true;
    }
    if ([0, '0', 'false', 'off', 'no', false].includes(rawValue)) {
      return false;
    }
    return rawValue ? Boolean(rawValue) : null;
  }
  var booleanAttributes = /* @__PURE__ */ new Set([
    'allowfullscreen',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'inert',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'playsinline',
    'readonly',
    'required',
    'reversed',
    'selected',
    'shadowrootclonable',
    'shadowrootdelegatesfocus',
    'shadowrootserializable',
  ]);
  function isBooleanAttr(attrName) {
    return booleanAttributes.has(attrName);
  }
  function attributeShouldntBePreservedIfFalsy(name) {
    return !['aria-pressed', 'aria-checked', 'aria-expanded', 'aria-selected'].includes(name);
  }
  function getBinding(el, name, fallback) {
    if (el._x_bindings && el._x_bindings[name] !== void 0) return el._x_bindings[name];
    return getAttributeBinding(el, name, fallback);
  }
  function extractProp(el, name, fallback, extract = true) {
    if (el._x_bindings && el._x_bindings[name] !== void 0) return el._x_bindings[name];
    if (el._x_inlineBindings && el._x_inlineBindings[name] !== void 0) {
      let binding = el._x_inlineBindings[name];
      binding.extract = extract;
      return dontAutoEvaluateFunctions(() => {
        return evaluate(el, binding.expression);
      });
    }
    return getAttributeBinding(el, name, fallback);
  }
  function getAttributeBinding(el, name, fallback) {
    let attr = el.getAttribute(name);
    if (attr === null) return typeof fallback === 'function' ? fallback() : fallback;
    if (attr === '') return true;
    if (isBooleanAttr(name)) {
      return !![name, 'true'].includes(attr);
    }
    return attr;
  }
  function isCheckbox(el) {
    return el.type === 'checkbox' || el.localName === 'ui-checkbox' || el.localName === 'ui-switch';
  }
  function isRadio(el) {
    return el.type === 'radio' || el.localName === 'ui-radio';
  }
  function debounce(func, wait) {
    var timeout;
    return function () {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  function throttle(func, limit) {
    let inThrottle;
    return function () {
      let context = this,
        args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
  function entangle({ get: outerGet, set: outerSet }, { get: innerGet, set: innerSet }) {
    let firstRun = true;
    let outerHash;
    let innerHash;
    let reference2 = effect(() => {
      let outer = outerGet();
      let inner = innerGet();
      if (firstRun) {
        innerSet(cloneIfObject(outer));
        firstRun = false;
      } else {
        let outerHashLatest = JSON.stringify(outer);
        let innerHashLatest = JSON.stringify(inner);
        if (outerHashLatest !== outerHash) {
          innerSet(cloneIfObject(outer));
        } else if (outerHashLatest !== innerHashLatest) {
          outerSet(cloneIfObject(inner));
        } else {
        }
      }
      outerHash = JSON.stringify(outerGet());
      innerHash = JSON.stringify(innerGet());
    });
    return () => {
      release(reference2);
    };
  }
  function cloneIfObject(value) {
    return typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
  }
  function plugin(callback) {
    let callbacks = Array.isArray(callback) ? callback : [callback];
    callbacks.forEach((i) => i(alpine_default));
  }
  var stores = {};
  var isReactive = false;
  function store(name, value) {
    if (!isReactive) {
      stores = reactive(stores);
      isReactive = true;
    }
    if (value === void 0) {
      return stores[name];
    }
    stores[name] = value;
    initInterceptors(stores[name]);
    if (
      typeof value === 'object' &&
      value !== null &&
      value.hasOwnProperty('init') &&
      typeof value.init === 'function'
    ) {
      stores[name].init();
    }
  }
  function getStores() {
    return stores;
  }
  var binds = {};
  function bind2(name, bindings) {
    let getBindings = typeof bindings !== 'function' ? () => bindings : bindings;
    if (name instanceof Element) {
      return applyBindingsObject(name, getBindings());
    } else {
      binds[name] = getBindings;
    }
    return () => {};
  }
  function injectBindingProviders(obj) {
    Object.entries(binds).forEach(([name, callback]) => {
      Object.defineProperty(obj, name, {
        get() {
          return (...args) => {
            return callback(...args);
          };
        },
      });
    });
    return obj;
  }
  function applyBindingsObject(el, obj, original) {
    let cleanupRunners = [];
    while (cleanupRunners.length) cleanupRunners.pop()();
    let attributes = Object.entries(obj).map(([name, value]) => ({ name, value }));
    let staticAttributes = attributesOnly(attributes);
    attributes = attributes.map((attribute) => {
      if (staticAttributes.find((attr) => attr.name === attribute.name)) {
        return {
          name: `x-bind:${attribute.name}`,
          value: `"${attribute.value}"`,
        };
      }
      return attribute;
    });
    directives(el, attributes, original).map((handle) => {
      cleanupRunners.push(handle.runCleanups);
      handle();
    });
    return () => {
      while (cleanupRunners.length) cleanupRunners.pop()();
    };
  }
  var datas = {};
  function data(name, callback) {
    datas[name] = callback;
  }
  function injectDataProviders(obj, context) {
    Object.entries(datas).forEach(([name, callback]) => {
      Object.defineProperty(obj, name, {
        get() {
          return (...args) => {
            return callback.bind(context)(...args);
          };
        },
        enumerable: false,
      });
    });
    return obj;
  }
  var Alpine2 = {
    get reactive() {
      return reactive;
    },
    get release() {
      return release;
    },
    get effect() {
      return effect;
    },
    get raw() {
      return raw;
    },
    version: '3.14.9',
    flushAndStopDeferringMutations,
    dontAutoEvaluateFunctions,
    disableEffectScheduling,
    startObservingMutations,
    stopObservingMutations,
    setReactivityEngine,
    onAttributeRemoved,
    onAttributesAdded,
    closestDataStack,
    skipDuringClone,
    onlyDuringClone,
    addRootSelector,
    addInitSelector,
    interceptClone,
    addScopeToNode,
    deferMutations,
    mapAttributes,
    evaluateLater,
    interceptInit,
    setEvaluator,
    mergeProxies,
    extractProp,
    findClosest,
    onElRemoved,
    closestRoot,
    destroyTree,
    interceptor,
    // INTERNAL: not public API and is subject to change without major release.
    transition,
    // INTERNAL
    setStyles,
    // INTERNAL
    mutateDom,
    directive,
    entangle,
    throttle,
    debounce,
    evaluate,
    initTree,
    nextTick,
    prefixed: prefix,
    prefix: setPrefix,
    plugin,
    magic,
    store,
    start,
    clone,
    // INTERNAL
    cloneNode,
    // INTERNAL
    bound: getBinding,
    $data: scope,
    watch,
    walk,
    data,
    bind: bind2,
  };
  var alpine_default = Alpine2;
  function makeMap(str, expectsLowerCase) {
    const map = /* @__PURE__ */ Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
  }
  var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
  var isBooleanAttr2 = /* @__PURE__ */ makeMap(
    specialBooleanAttrs +
      `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`,
  );
  var EMPTY_OBJ = true ? Object.freeze({}) : {};
  var EMPTY_ARR = true ? Object.freeze([]) : [];
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (val, key) => hasOwnProperty.call(val, key);
  var isArray = Array.isArray;
  var isMap = (val) => toTypeString(val) === '[object Map]';
  var isString = (val) => typeof val === 'string';
  var isSymbol = (val) => typeof val === 'symbol';
  var isObject = (val) => val !== null && typeof val === 'object';
  var objectToString = Object.prototype.toString;
  var toTypeString = (value) => objectToString.call(value);
  var toRawType = (value) => {
    return toTypeString(value).slice(8, -1);
  };
  var isIntegerKey = (key) => isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;
  var cacheStringFunction = (fn2) => {
    const cache = /* @__PURE__ */ Object.create(null);
    return (str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn2(str));
    };
  };
  var camelizeRE = /-(\w)/g;
  var camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
  });
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());
  var capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
  var toHandlerKey = cacheStringFunction((str) => (str ? `on${capitalize(str)}` : ``));
  var hasChanged = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);
  var targetMap = /* @__PURE__ */ new WeakMap();
  var effectStack = [];
  var activeEffect;
  var ITERATE_KEY = Symbol(true ? 'iterate' : '');
  var MAP_KEY_ITERATE_KEY = Symbol(true ? 'Map key iterate' : '');
  function isEffect(fn2) {
    return fn2 && fn2._isEffect === true;
  }
  function effect2(fn2, options = EMPTY_OBJ) {
    if (isEffect(fn2)) {
      fn2 = fn2.raw;
    }
    const effect32 = createReactiveEffect(fn2, options);
    if (!options.lazy) {
      effect32();
    }
    return effect32;
  }
  function stop(effect32) {
    if (effect32.active) {
      cleanup(effect32);
      if (effect32.options.onStop) {
        effect32.options.onStop();
      }
      effect32.active = false;
    }
  }
  var uid = 0;
  function createReactiveEffect(fn2, options) {
    const effect32 = function reactiveEffect() {
      if (!effect32.active) {
        return fn2();
      }
      if (!effectStack.includes(effect32)) {
        cleanup(effect32);
        try {
          enableTracking();
          effectStack.push(effect32);
          activeEffect = effect32;
          return fn2();
        } finally {
          effectStack.pop();
          resetTracking();
          activeEffect = effectStack[effectStack.length - 1];
        }
      }
    };
    effect32.id = uid++;
    effect32.allowRecurse = !!options.allowRecurse;
    effect32._isEffect = true;
    effect32.active = true;
    effect32.raw = fn2;
    effect32.deps = [];
    effect32.options = options;
    return effect32;
  }
  function cleanup(effect32) {
    const { deps } = effect32;
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect32);
      }
      deps.length = 0;
    }
  }
  var shouldTrack = true;
  var trackStack = [];
  function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
  }
  function enableTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = true;
  }
  function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === void 0 ? true : last;
  }
  function track(target, type, key) {
    if (!shouldTrack || activeEffect === void 0) {
      return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = /* @__PURE__ */ new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = /* @__PURE__ */ new Set()));
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
      if (activeEffect.options.onTrack) {
        activeEffect.options.onTrack({
          effect: activeEffect,
          target,
          type,
          key,
        });
      }
    }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    const effects = /* @__PURE__ */ new Set();
    const add2 = (effectsToAdd) => {
      if (effectsToAdd) {
        effectsToAdd.forEach((effect32) => {
          if (effect32 !== activeEffect || effect32.allowRecurse) {
            effects.add(effect32);
          }
        });
      }
    };
    if (type === 'clear') {
      depsMap.forEach(add2);
    } else if (key === 'length' && isArray(target)) {
      depsMap.forEach((dep, key2) => {
        if (key2 === 'length' || key2 >= newValue) {
          add2(dep);
        }
      });
    } else {
      if (key !== void 0) {
        add2(depsMap.get(key));
      }
      switch (type) {
        case 'add':
          if (!isArray(target)) {
            add2(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              add2(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isIntegerKey(key)) {
            add2(depsMap.get('length'));
          }
          break;
        case 'delete':
          if (!isArray(target)) {
            add2(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              add2(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case 'set':
          if (isMap(target)) {
            add2(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
    const run = (effect32) => {
      if (effect32.options.onTrigger) {
        effect32.options.onTrigger({
          effect: effect32,
          target,
          key,
          type,
          newValue,
          oldValue,
          oldTarget,
        });
      }
      if (effect32.options.scheduler) {
        effect32.options.scheduler(effect32);
      } else {
        effect32();
      }
    };
    effects.forEach(run);
  }
  var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
  var builtInSymbols = new Set(
    Object.getOwnPropertyNames(Symbol)
      .map((key) => Symbol[key])
      .filter(isSymbol),
  );
  var get2 = /* @__PURE__ */ createGetter();
  var readonlyGet = /* @__PURE__ */ createGetter(true);
  var arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
  function createArrayInstrumentations() {
    const instrumentations = {};
    ['includes', 'indexOf', 'lastIndexOf'].forEach((key) => {
      instrumentations[key] = function (...args) {
        const arr = toRaw(this);
        for (let i = 0, l = this.length; i < l; i++) {
          track(arr, 'get', i + '');
        }
        const res = arr[key](...args);
        if (res === -1 || res === false) {
          return arr[key](...args.map(toRaw));
        } else {
          return res;
        }
      };
    });
    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach((key) => {
      instrumentations[key] = function (...args) {
        pauseTracking();
        const res = toRaw(this)[key].apply(this, args);
        resetTracking();
        return res;
      };
    });
    return instrumentations;
  }
  function createGetter(isReadonly = false, shallow = false) {
    return function get3(target, key, receiver) {
      if (key === '__v_isReactive') {
        return !isReadonly;
      } else if (key === '__v_isReadonly') {
        return isReadonly;
      } else if (
        key === '__v_raw' &&
        receiver ===
          (isReadonly ? (shallow ? shallowReadonlyMap : readonlyMap) : shallow ? shallowReactiveMap : reactiveMap).get(
            target,
          )
      ) {
        return target;
      }
      const targetIsArray = isArray(target);
      if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      const res = Reflect.get(target, key, receiver);
      if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
        return res;
      }
      if (!isReadonly) {
        track(target, 'get', key);
      }
      if (shallow) {
        return res;
      }
      if (isRef(res)) {
        const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
        return shouldUnwrap ? res.value : res;
      }
      if (isObject(res)) {
        return isReadonly ? readonly(res) : reactive2(res);
      }
      return res;
    };
  }
  var set2 = /* @__PURE__ */ createSetter();
  function createSetter(shallow = false) {
    return function set3(target, key, value, receiver) {
      let oldValue = target[key];
      if (!shallow) {
        value = toRaw(value);
        oldValue = toRaw(oldValue);
        if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
          oldValue.value = value;
          return true;
        }
      }
      const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
      const result = Reflect.set(target, key, value, receiver);
      if (target === toRaw(receiver)) {
        if (!hadKey) {
          trigger(target, 'add', key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, 'set', key, value, oldValue);
        }
      }
      return result;
    };
  }
  function deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, 'delete', key, void 0, oldValue);
    }
    return result;
  }
  function has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, 'has', key);
    }
    return result;
  }
  function ownKeys(target) {
    track(target, 'iterate', isArray(target) ? 'length' : ITERATE_KEY);
    return Reflect.ownKeys(target);
  }
  var mutableHandlers = {
    get: get2,
    set: set2,
    deleteProperty,
    has,
    ownKeys,
  };
  var readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
      if (true) {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
      }
      return true;
    },
    deleteProperty(target, key) {
      if (true) {
        console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
      }
      return true;
    },
  };
  var toReactive = (value) => (isObject(value) ? reactive2(value) : value);
  var toReadonly = (value) => (isObject(value) ? readonly(value) : value);
  var toShallow = (value) => value;
  var getProto = (v) => Reflect.getPrototypeOf(v);
  function get$1(target, key, isReadonly = false, isShallow = false) {
    target =
      target[
        '__v_raw'
        /* RAW */
      ];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
      !isReadonly && track(rawTarget, 'get', key);
    }
    !isReadonly && track(rawTarget, 'get', rawKey);
    const { has: has2 } = getProto(rawTarget);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has2.call(rawTarget, key)) {
      return wrap(target.get(key));
    } else if (has2.call(rawTarget, rawKey)) {
      return wrap(target.get(rawKey));
    } else if (target !== rawTarget) {
      target.get(key);
    }
  }
  function has$1(key, isReadonly = false) {
    const target =
      this[
        '__v_raw'
        /* RAW */
      ];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
      !isReadonly && track(rawTarget, 'has', key);
    }
    !isReadonly && track(rawTarget, 'has', rawKey);
    return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
  }
  function size(target, isReadonly = false) {
    target =
      target[
        '__v_raw'
        /* RAW */
      ];
    !isReadonly && track(toRaw(target), 'iterate', ITERATE_KEY);
    return Reflect.get(target, 'size', target);
  }
  function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
      target.add(value);
      trigger(target, 'add', value, value);
    }
    return this;
  }
  function set$1(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const { has: has2, get: get3 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get3.call(target, key);
    target.set(key, value);
    if (!hadKey) {
      trigger(target, 'add', key, value);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, 'set', key, value, oldValue);
    }
    return this;
  }
  function deleteEntry(key) {
    const target = toRaw(this);
    const { has: has2, get: get3 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get3 ? get3.call(target, key) : void 0;
    const result = target.delete(key);
    if (hadKey) {
      trigger(target, 'delete', key, void 0, oldValue);
    }
    return result;
  }
  function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = true ? (isMap(target) ? new Map(target) : new Set(target)) : void 0;
    const result = target.clear();
    if (hadItems) {
      trigger(target, 'clear', void 0, void 0, oldTarget);
    }
    return result;
  }
  function createForEach(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
      const observed = this;
      const target =
        observed[
          '__v_raw'
          /* RAW */
        ];
      const rawTarget = toRaw(target);
      const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
      !isReadonly && track(rawTarget, 'iterate', ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    };
  }
  function createIterableMethod(method, isReadonly, isShallow) {
    return function (...args) {
      const target =
        this[
          '__v_raw'
          /* RAW */
        ];
      const rawTarget = toRaw(target);
      const targetIsMap = isMap(rawTarget);
      const isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap);
      const isKeyOnly = method === 'keys' && targetIsMap;
      const innerIterator = target[method](...args);
      const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
      !isReadonly && track(rawTarget, 'iterate', isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
      return {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done
            ? { value, done }
            : {
                value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                done,
              };
        },
        // iterable protocol
        [Symbol.iterator]() {
          return this;
        },
      };
    };
  }
  function createReadonlyMethod(type) {
    return function (...args) {
      if (true) {
        const key = args[0] ? `on key "${args[0]}" ` : ``;
        console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
      }
      return type === 'delete' ? false : this;
    };
  }
  function createInstrumentations() {
    const mutableInstrumentations2 = {
      get(key) {
        return get$1(this, key);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, false),
    };
    const shallowInstrumentations2 = {
      get(key) {
        return get$1(this, key, false, true);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, true),
    };
    const readonlyInstrumentations2 = {
      get(key) {
        return get$1(this, key, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has$1.call(this, key, true);
      },
      add: createReadonlyMethod(
        'add',
        /* ADD */
      ),
      set: createReadonlyMethod(
        'set',
        /* SET */
      ),
      delete: createReadonlyMethod(
        'delete',
        /* DELETE */
      ),
      clear: createReadonlyMethod(
        'clear',
        /* CLEAR */
      ),
      forEach: createForEach(true, false),
    };
    const shallowReadonlyInstrumentations2 = {
      get(key) {
        return get$1(this, key, true, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has$1.call(this, key, true);
      },
      add: createReadonlyMethod(
        'add',
        /* ADD */
      ),
      set: createReadonlyMethod(
        'set',
        /* SET */
      ),
      delete: createReadonlyMethod(
        'delete',
        /* DELETE */
      ),
      clear: createReadonlyMethod(
        'clear',
        /* CLEAR */
      ),
      forEach: createForEach(true, true),
    };
    const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
    iteratorMethods.forEach((method) => {
      mutableInstrumentations2[method] = createIterableMethod(method, false, false);
      readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
      shallowInstrumentations2[method] = createIterableMethod(method, false, true);
      shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
    });
    return [
      mutableInstrumentations2,
      readonlyInstrumentations2,
      shallowInstrumentations2,
      shallowReadonlyInstrumentations2,
    ];
  }
  var [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] =
    /* @__PURE__ */ createInstrumentations();
  function createInstrumentationGetter(isReadonly, shallow) {
    const instrumentations = shallow
      ? isReadonly
        ? shallowReadonlyInstrumentations
        : shallowInstrumentations
      : isReadonly
        ? readonlyInstrumentations
        : mutableInstrumentations;
    return (target, key, receiver) => {
      if (key === '__v_isReactive') {
        return !isReadonly;
      } else if (key === '__v_isReadonly') {
        return isReadonly;
      } else if (key === '__v_raw') {
        return target;
      }
      return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
    };
  }
  var mutableCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, false),
  };
  var readonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, false),
  };
  function checkIdentityKeys(target, has2, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has2.call(target, rawKey)) {
      const type = toRawType(target);
      console.warn(
        `Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`,
      );
    }
  }
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
  var readonlyMap = /* @__PURE__ */ new WeakMap();
  var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
  function targetTypeMap(rawType) {
    switch (rawType) {
      case 'Object':
      case 'Array':
        return 1;
      case 'Map':
      case 'Set':
      case 'WeakMap':
      case 'WeakSet':
        return 2;
      default:
        return 0;
    }
  }
  function getTargetType(value) {
    return value[
      '__v_skip'
      /* SKIP */
    ] || !Object.isExtensible(value)
      ? 0
      : targetTypeMap(toRawType(value));
  }
  function reactive2(target) {
    if (
      target &&
      target[
        '__v_isReadonly'
        /* IS_READONLY */
      ]
    ) {
      return target;
    }
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
  }
  function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
  }
  function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) {
      if (true) {
        console.warn(`value cannot be made reactive: ${String(target)}`);
      }
      return target;
    }
    if (
      target[
        '__v_raw'
        /* RAW */
      ] &&
      !(
        isReadonly &&
        target[
          '__v_isReactive'
          /* IS_REACTIVE */
        ]
      )
    ) {
      return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const targetType = getTargetType(target);
    if (targetType === 0) {
      return target;
    }
    const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
  }
  function toRaw(observed) {
    return (
      (observed &&
        toRaw(
          observed[
            '__v_raw'
            /* RAW */
          ],
        )) ||
      observed
    );
  }
  function isRef(r) {
    return Boolean(r && r.__v_isRef === true);
  }
  magic('nextTick', () => nextTick);
  magic('dispatch', (el) => dispatch.bind(dispatch, el));
  magic('watch', (el, { evaluateLater: evaluateLater2, cleanup: cleanup2 }) => (key, callback) => {
    let evaluate2 = evaluateLater2(key);
    let getter = () => {
      let value;
      evaluate2((i) => (value = i));
      return value;
    };
    let unwatch = watch(getter, callback);
    cleanup2(unwatch);
  });
  magic('store', getStores);
  magic('data', (el) => scope(el));
  magic('root', (el) => closestRoot(el));
  magic('refs', (el) => {
    if (el._x_refs_proxy) return el._x_refs_proxy;
    el._x_refs_proxy = mergeProxies(getArrayOfRefObject(el));
    return el._x_refs_proxy;
  });
  function getArrayOfRefObject(el) {
    let refObjects = [];
    findClosest(el, (i) => {
      if (i._x_refs) refObjects.push(i._x_refs);
    });
    return refObjects;
  }
  var globalIdMemo = {};
  function findAndIncrementId(name) {
    if (!globalIdMemo[name]) globalIdMemo[name] = 0;
    return ++globalIdMemo[name];
  }
  function closestIdRoot(el, name) {
    return findClosest(el, (element) => {
      if (element._x_ids && element._x_ids[name]) return true;
    });
  }
  function setIdRoot(el, name) {
    if (!el._x_ids) el._x_ids = {};
    if (!el._x_ids[name]) el._x_ids[name] = findAndIncrementId(name);
  }
  magic('id', (el, { cleanup: cleanup2 }) => (name, key = null) => {
    let cacheKey = `${name}${key ? `-${key}` : ''}`;
    return cacheIdByNameOnElement(el, cacheKey, cleanup2, () => {
      let root = closestIdRoot(el, name);
      let id = root ? root._x_ids[name] : findAndIncrementId(name);
      return key ? `${name}-${id}-${key}` : `${name}-${id}`;
    });
  });
  interceptClone((from, to) => {
    if (from._x_id) {
      to._x_id = from._x_id;
    }
  });
  function cacheIdByNameOnElement(el, cacheKey, cleanup2, callback) {
    if (!el._x_id) el._x_id = {};
    if (el._x_id[cacheKey]) return el._x_id[cacheKey];
    let output = callback();
    el._x_id[cacheKey] = output;
    cleanup2(() => {
      delete el._x_id[cacheKey];
    });
    return output;
  }
  magic('el', (el) => el);
  warnMissingPluginMagic('Focus', 'focus', 'focus');
  warnMissingPluginMagic('Persist', 'persist', 'persist');
  function warnMissingPluginMagic(name, magicName, slug) {
    magic(magicName, (el) =>
      warn(
        `You can't use [$${magicName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`,
        el,
      ),
    );
  }
  directive(
    'modelable',
    (el, { expression }, { effect: effect32, evaluateLater: evaluateLater2, cleanup: cleanup2 }) => {
      let func = evaluateLater2(expression);
      let innerGet = () => {
        let result;
        func((i) => (result = i));
        return result;
      };
      let evaluateInnerSet = evaluateLater2(`${expression} = __placeholder`);
      let innerSet = (val) => evaluateInnerSet(() => {}, { scope: { __placeholder: val } });
      let initialValue = innerGet();
      innerSet(initialValue);
      queueMicrotask(() => {
        if (!el._x_model) return;
        el._x_removeModelListeners['default']();
        let outerGet = el._x_model.get;
        let outerSet = el._x_model.set;
        let releaseEntanglement = entangle(
          {
            get() {
              return outerGet();
            },
            set(value) {
              outerSet(value);
            },
          },
          {
            get() {
              return innerGet();
            },
            set(value) {
              innerSet(value);
            },
          },
        );
        cleanup2(releaseEntanglement);
      });
    },
  );
  directive('teleport', (el, { modifiers, expression }, { cleanup: cleanup2 }) => {
    if (el.tagName.toLowerCase() !== 'template') warn('x-teleport can only be used on a <template> tag', el);
    let target = getTarget(expression);
    let clone22 = el.content.cloneNode(true).firstElementChild;
    el._x_teleport = clone22;
    clone22._x_teleportBack = el;
    el.setAttribute('data-teleport-template', true);
    clone22.setAttribute('data-teleport-target', true);
    if (el._x_forwardEvents) {
      el._x_forwardEvents.forEach((eventName) => {
        clone22.addEventListener(eventName, (e) => {
          e.stopPropagation();
          el.dispatchEvent(new e.constructor(e.type, e));
        });
      });
    }
    addScopeToNode(clone22, {}, el);
    let placeInDom = (clone3, target2, modifiers2) => {
      if (modifiers2.includes('prepend')) {
        target2.parentNode.insertBefore(clone3, target2);
      } else if (modifiers2.includes('append')) {
        target2.parentNode.insertBefore(clone3, target2.nextSibling);
      } else {
        target2.appendChild(clone3);
      }
    };
    mutateDom(() => {
      placeInDom(clone22, target, modifiers);
      skipDuringClone(() => {
        initTree(clone22);
      })();
    });
    el._x_teleportPutBack = () => {
      let target2 = getTarget(expression);
      mutateDom(() => {
        placeInDom(el._x_teleport, target2, modifiers);
      });
    };
    cleanup2(() =>
      mutateDom(() => {
        clone22.remove();
        destroyTree(clone22);
      }),
    );
  });
  var teleportContainerDuringClone = document.createElement('div');
  function getTarget(expression) {
    let target = skipDuringClone(
      () => {
        return document.querySelector(expression);
      },
      () => {
        return teleportContainerDuringClone;
      },
    )();
    if (!target) warn(`Cannot find x-teleport element for selector: "${expression}"`);
    return target;
  }
  var handler = () => {};
  handler.inline = (el, { modifiers }, { cleanup: cleanup2 }) => {
    modifiers.includes('self') ? (el._x_ignoreSelf = true) : (el._x_ignore = true);
    cleanup2(() => {
      modifiers.includes('self') ? delete el._x_ignoreSelf : delete el._x_ignore;
    });
  };
  directive('ignore', handler);
  directive(
    'effect',
    skipDuringClone((el, { expression }, { effect: effect32 }) => {
      effect32(evaluateLater(el, expression));
    }),
  );
  function on(el, event, modifiers, callback) {
    let listenerTarget = el;
    let handler4 = (e) => callback(e);
    let options = {};
    let wrapHandler = (callback2, wrapper) => (e) => wrapper(callback2, e);
    if (modifiers.includes('dot')) event = dotSyntax(event);
    if (modifiers.includes('camel')) event = camelCase2(event);
    if (modifiers.includes('passive')) options.passive = true;
    if (modifiers.includes('capture')) options.capture = true;
    if (modifiers.includes('window')) listenerTarget = window;
    if (modifiers.includes('document')) listenerTarget = document;
    if (modifiers.includes('debounce')) {
      let nextModifier = modifiers[modifiers.indexOf('debounce') + 1] || 'invalid-wait';
      let wait = isNumeric(nextModifier.split('ms')[0]) ? Number(nextModifier.split('ms')[0]) : 250;
      handler4 = debounce(handler4, wait);
    }
    if (modifiers.includes('throttle')) {
      let nextModifier = modifiers[modifiers.indexOf('throttle') + 1] || 'invalid-wait';
      let wait = isNumeric(nextModifier.split('ms')[0]) ? Number(nextModifier.split('ms')[0]) : 250;
      handler4 = throttle(handler4, wait);
    }
    if (modifiers.includes('prevent'))
      handler4 = wrapHandler(handler4, (next, e) => {
        e.preventDefault();
        next(e);
      });
    if (modifiers.includes('stop'))
      handler4 = wrapHandler(handler4, (next, e) => {
        e.stopPropagation();
        next(e);
      });
    if (modifiers.includes('once')) {
      handler4 = wrapHandler(handler4, (next, e) => {
        next(e);
        listenerTarget.removeEventListener(event, handler4, options);
      });
    }
    if (modifiers.includes('away') || modifiers.includes('outside')) {
      listenerTarget = document;
      handler4 = wrapHandler(handler4, (next, e) => {
        if (el.contains(e.target)) return;
        if (e.target.isConnected === false) return;
        if (el.offsetWidth < 1 && el.offsetHeight < 1) return;
        if (el._x_isShown === false) return;
        next(e);
      });
    }
    if (modifiers.includes('self'))
      handler4 = wrapHandler(handler4, (next, e) => {
        e.target === el && next(e);
      });
    if (isKeyEvent(event) || isClickEvent(event)) {
      handler4 = wrapHandler(handler4, (next, e) => {
        if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) {
          return;
        }
        next(e);
      });
    }
    listenerTarget.addEventListener(event, handler4, options);
    return () => {
      listenerTarget.removeEventListener(event, handler4, options);
    };
  }
  function dotSyntax(subject) {
    return subject.replace(/-/g, '.');
  }
  function camelCase2(subject) {
    return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
  }
  function isNumeric(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function kebabCase2(subject) {
    if ([' ', '_'].includes(subject)) return subject;
    return subject
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]/, '-')
      .toLowerCase();
  }
  function isKeyEvent(event) {
    return ['keydown', 'keyup'].includes(event);
  }
  function isClickEvent(event) {
    return ['contextmenu', 'click', 'mouse'].some((i) => event.includes(i));
  }
  function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
    let keyModifiers = modifiers.filter((i) => {
      return ![
        'window',
        'document',
        'prevent',
        'stop',
        'once',
        'capture',
        'self',
        'away',
        'outside',
        'passive',
      ].includes(i);
    });
    if (keyModifiers.includes('debounce')) {
      let debounceIndex = keyModifiers.indexOf('debounce');
      keyModifiers.splice(
        debounceIndex,
        isNumeric((keyModifiers[debounceIndex + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1,
      );
    }
    if (keyModifiers.includes('throttle')) {
      let debounceIndex = keyModifiers.indexOf('throttle');
      keyModifiers.splice(
        debounceIndex,
        isNumeric((keyModifiers[debounceIndex + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1,
      );
    }
    if (keyModifiers.length === 0) return false;
    if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0])) return false;
    const systemKeyModifiers = ['ctrl', 'shift', 'alt', 'meta', 'cmd', 'super'];
    const selectedSystemKeyModifiers = systemKeyModifiers.filter((modifier) => keyModifiers.includes(modifier));
    keyModifiers = keyModifiers.filter((i) => !selectedSystemKeyModifiers.includes(i));
    if (selectedSystemKeyModifiers.length > 0) {
      const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter((modifier) => {
        if (modifier === 'cmd' || modifier === 'super') modifier = 'meta';
        return e[`${modifier}Key`];
      });
      if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
        if (isClickEvent(e.type)) return false;
        if (keyToModifiers(e.key).includes(keyModifiers[0])) return false;
      }
    }
    return true;
  }
  function keyToModifiers(key) {
    if (!key) return [];
    key = kebabCase2(key);
    let modifierToKeyMap = {
      ctrl: 'control',
      slash: '/',
      space: ' ',
      spacebar: ' ',
      cmd: 'meta',
      esc: 'escape',
      up: 'arrow-up',
      down: 'arrow-down',
      left: 'arrow-left',
      right: 'arrow-right',
      period: '.',
      comma: ',',
      equal: '=',
      minus: '-',
      underscore: '_',
    };
    modifierToKeyMap[key] = key;
    return Object.keys(modifierToKeyMap)
      .map((modifier) => {
        if (modifierToKeyMap[modifier] === key) return modifier;
      })
      .filter((modifier) => modifier);
  }
  directive('model', (el, { modifiers, expression }, { effect: effect32, cleanup: cleanup2 }) => {
    let scopeTarget = el;
    if (modifiers.includes('parent')) {
      scopeTarget = el.parentNode;
    }
    let evaluateGet = evaluateLater(scopeTarget, expression);
    let evaluateSet;
    if (typeof expression === 'string') {
      evaluateSet = evaluateLater(scopeTarget, `${expression} = __placeholder`);
    } else if (typeof expression === 'function' && typeof expression() === 'string') {
      evaluateSet = evaluateLater(scopeTarget, `${expression()} = __placeholder`);
    } else {
      evaluateSet = () => {};
    }
    let getValue = () => {
      let result;
      evaluateGet((value) => (result = value));
      return isGetterSetter(result) ? result.get() : result;
    };
    let setValue = (value) => {
      let result;
      evaluateGet((value2) => (result = value2));
      if (isGetterSetter(result)) {
        result.set(value);
      } else {
        evaluateSet(() => {}, {
          scope: { __placeholder: value },
        });
      }
    };
    if (typeof expression === 'string' && el.type === 'radio') {
      mutateDom(() => {
        if (!el.hasAttribute('name')) el.setAttribute('name', expression);
      });
    }
    var event =
      el.tagName.toLowerCase() === 'select' || ['checkbox', 'radio'].includes(el.type) || modifiers.includes('lazy')
        ? 'change'
        : 'input';
    let removeListener = isCloning
      ? () => {}
      : on(el, event, modifiers, (e) => {
          setValue(getInputValue(el, modifiers, e, getValue()));
        });
    if (modifiers.includes('fill')) {
      if (
        [void 0, null, ''].includes(getValue()) ||
        (isCheckbox(el) && Array.isArray(getValue())) ||
        (el.tagName.toLowerCase() === 'select' && el.multiple)
      ) {
        setValue(getInputValue(el, modifiers, { target: el }, getValue()));
      }
    }
    if (!el._x_removeModelListeners) el._x_removeModelListeners = {};
    el._x_removeModelListeners['default'] = removeListener;
    cleanup2(() => el._x_removeModelListeners['default']());
    if (el.form) {
      let removeResetListener = on(el.form, 'reset', [], (e) => {
        nextTick(() => el._x_model && el._x_model.set(getInputValue(el, modifiers, { target: el }, getValue())));
      });
      cleanup2(() => removeResetListener());
    }
    el._x_model = {
      get() {
        return getValue();
      },
      set(value) {
        setValue(value);
      },
    };
    el._x_forceModelUpdate = (value) => {
      if (value === void 0 && typeof expression === 'string' && expression.match(/\./)) value = '';
      window.fromModel = true;
      mutateDom(() => bind(el, 'value', value));
      delete window.fromModel;
    };
    effect32(() => {
      let value = getValue();
      if (modifiers.includes('unintrusive') && document.activeElement.isSameNode(el)) return;
      el._x_forceModelUpdate(value);
    });
  });
  function getInputValue(el, modifiers, event, currentValue) {
    return mutateDom(() => {
      if (event instanceof CustomEvent && event.detail !== void 0)
        return event.detail !== null && event.detail !== void 0 ? event.detail : event.target.value;
      else if (isCheckbox(el)) {
        if (Array.isArray(currentValue)) {
          let newValue = null;
          if (modifiers.includes('number')) {
            newValue = safeParseNumber(event.target.value);
          } else if (modifiers.includes('boolean')) {
            newValue = safeParseBoolean(event.target.value);
          } else {
            newValue = event.target.value;
          }
          return event.target.checked
            ? currentValue.includes(newValue)
              ? currentValue
              : currentValue.concat([newValue])
            : currentValue.filter((el2) => !checkedAttrLooseCompare2(el2, newValue));
        } else {
          return event.target.checked;
        }
      } else if (el.tagName.toLowerCase() === 'select' && el.multiple) {
        if (modifiers.includes('number')) {
          return Array.from(event.target.selectedOptions).map((option2) => {
            let rawValue = option2.value || option2.text;
            return safeParseNumber(rawValue);
          });
        } else if (modifiers.includes('boolean')) {
          return Array.from(event.target.selectedOptions).map((option2) => {
            let rawValue = option2.value || option2.text;
            return safeParseBoolean(rawValue);
          });
        }
        return Array.from(event.target.selectedOptions).map((option2) => {
          return option2.value || option2.text;
        });
      } else {
        let newValue;
        if (isRadio(el)) {
          if (event.target.checked) {
            newValue = event.target.value;
          } else {
            newValue = currentValue;
          }
        } else {
          newValue = event.target.value;
        }
        if (modifiers.includes('number')) {
          return safeParseNumber(newValue);
        } else if (modifiers.includes('boolean')) {
          return safeParseBoolean(newValue);
        } else if (modifiers.includes('trim')) {
          return newValue.trim();
        } else {
          return newValue;
        }
      }
    });
  }
  function safeParseNumber(rawValue) {
    let number = rawValue ? parseFloat(rawValue) : null;
    return isNumeric2(number) ? number : rawValue;
  }
  function checkedAttrLooseCompare2(valueA, valueB) {
    return valueA == valueB;
  }
  function isNumeric2(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function isGetterSetter(value) {
    return (
      value !== null && typeof value === 'object' && typeof value.get === 'function' && typeof value.set === 'function'
    );
  }
  directive('cloak', (el) => queueMicrotask(() => mutateDom(() => el.removeAttribute(prefix('cloak')))));
  addInitSelector(() => `[${prefix('init')}]`);
  directive(
    'init',
    skipDuringClone((el, { expression }, { evaluate: evaluate2 }) => {
      if (typeof expression === 'string') {
        return !!expression.trim() && evaluate2(expression, {}, false);
      }
      return evaluate2(expression, {}, false);
    }),
  );
  directive('text', (el, { expression }, { effect: effect32, evaluateLater: evaluateLater2 }) => {
    let evaluate2 = evaluateLater2(expression);
    effect32(() => {
      evaluate2((value) => {
        mutateDom(() => {
          el.textContent = value;
        });
      });
    });
  });
  directive('html', (el, { expression }, { effect: effect32, evaluateLater: evaluateLater2 }) => {
    let evaluate2 = evaluateLater2(expression);
    effect32(() => {
      evaluate2((value) => {
        mutateDom(() => {
          el.innerHTML = value;
          el._x_ignoreSelf = true;
          initTree(el);
          delete el._x_ignoreSelf;
        });
      });
    });
  });
  mapAttributes(startingWith(':', into(prefix('bind:'))));
  var handler2 = (el, { value, modifiers, expression, original }, { effect: effect32, cleanup: cleanup2 }) => {
    if (!value) {
      let bindingProviders = {};
      injectBindingProviders(bindingProviders);
      let getBindings = evaluateLater(el, expression);
      getBindings(
        (bindings) => {
          applyBindingsObject(el, bindings, original);
        },
        { scope: bindingProviders },
      );
      return;
    }
    if (value === 'key') return storeKeyForXFor(el, expression);
    if (el._x_inlineBindings && el._x_inlineBindings[value] && el._x_inlineBindings[value].extract) {
      return;
    }
    let evaluate2 = evaluateLater(el, expression);
    effect32(() =>
      evaluate2((result) => {
        if (result === void 0 && typeof expression === 'string' && expression.match(/\./)) {
          result = '';
        }
        mutateDom(() => bind(el, value, result, modifiers));
      }),
    );
    cleanup2(() => {
      el._x_undoAddedClasses && el._x_undoAddedClasses();
      el._x_undoAddedStyles && el._x_undoAddedStyles();
    });
  };
  handler2.inline = (el, { value, modifiers, expression }) => {
    if (!value) return;
    if (!el._x_inlineBindings) el._x_inlineBindings = {};
    el._x_inlineBindings[value] = { expression, extract: false };
  };
  directive('bind', handler2);
  function storeKeyForXFor(el, expression) {
    el._x_keyExpression = expression;
  }
  addRootSelector(() => `[${prefix('data')}]`);
  directive('data', (el, { expression }, { cleanup: cleanup2 }) => {
    if (shouldSkipRegisteringDataDuringClone(el)) return;
    expression = expression === '' ? '{}' : expression;
    let magicContext = {};
    injectMagics(magicContext, el);
    let dataProviderContext = {};
    injectDataProviders(dataProviderContext, magicContext);
    let data2 = evaluate(el, expression, { scope: dataProviderContext });
    if (data2 === void 0 || data2 === true) data2 = {};
    injectMagics(data2, el);
    let reactiveData = reactive(data2);
    initInterceptors(reactiveData);
    let undo = addScopeToNode(el, reactiveData);
    reactiveData['init'] && evaluate(el, reactiveData['init']);
    cleanup2(() => {
      reactiveData['destroy'] && evaluate(el, reactiveData['destroy']);
      undo();
    });
  });
  interceptClone((from, to) => {
    if (from._x_dataStack) {
      to._x_dataStack = from._x_dataStack;
      to.setAttribute('data-has-alpine-state', true);
    }
  });
  function shouldSkipRegisteringDataDuringClone(el) {
    if (!isCloning) return false;
    if (isCloningLegacy) return true;
    return el.hasAttribute('data-has-alpine-state');
  }
  directive('show', (el, { modifiers, expression }, { effect: effect32 }) => {
    let evaluate2 = evaluateLater(el, expression);
    if (!el._x_doHide)
      el._x_doHide = () => {
        mutateDom(() => {
          el.style.setProperty('display', 'none', modifiers.includes('important') ? 'important' : void 0);
        });
      };
    if (!el._x_doShow)
      el._x_doShow = () => {
        mutateDom(() => {
          if (el.style.length === 1 && el.style.display === 'none') {
            el.removeAttribute('style');
          } else {
            el.style.removeProperty('display');
          }
        });
      };
    let hide2 = () => {
      el._x_doHide();
      el._x_isShown = false;
    };
    let show = () => {
      el._x_doShow();
      el._x_isShown = true;
    };
    let clickAwayCompatibleShow = () => setTimeout(show);
    let toggle = once(
      (value) => (value ? show() : hide2()),
      (value) => {
        if (typeof el._x_toggleAndCascadeWithTransitions === 'function') {
          el._x_toggleAndCascadeWithTransitions(el, value, show, hide2);
        } else {
          value ? clickAwayCompatibleShow() : hide2();
        }
      },
    );
    let oldValue;
    let firstTime = true;
    effect32(() =>
      evaluate2((value) => {
        if (!firstTime && value === oldValue) return;
        if (modifiers.includes('immediate')) value ? clickAwayCompatibleShow() : hide2();
        toggle(value);
        oldValue = value;
        firstTime = false;
      }),
    );
  });
  directive('for', (el, { expression }, { effect: effect32, cleanup: cleanup2 }) => {
    let iteratorNames = parseForExpression(expression);
    let evaluateItems = evaluateLater(el, iteratorNames.items);
    let evaluateKey = evaluateLater(
      el,
      // the x-bind:key expression is stored for our use instead of evaluated.
      el._x_keyExpression || 'index',
    );
    el._x_prevKeys = [];
    el._x_lookup = {};
    effect32(() => loop(el, iteratorNames, evaluateItems, evaluateKey));
    cleanup2(() => {
      Object.values(el._x_lookup).forEach((el2) =>
        mutateDom(() => {
          destroyTree(el2);
          el2.remove();
        }),
      );
      delete el._x_prevKeys;
      delete el._x_lookup;
    });
  });
  function loop(el, iteratorNames, evaluateItems, evaluateKey) {
    let isObject2 = (i) => typeof i === 'object' && !Array.isArray(i);
    let templateEl = el;
    evaluateItems((items) => {
      if (isNumeric3(items) && items >= 0) {
        items = Array.from(Array(items).keys(), (i) => i + 1);
      }
      if (items === void 0) items = [];
      let lookup = el._x_lookup;
      let prevKeys = el._x_prevKeys;
      let scopes = [];
      let keys = [];
      if (isObject2(items)) {
        items = Object.entries(items).map(([key, value]) => {
          let scope2 = getIterationScopeVariables(iteratorNames, value, key, items);
          evaluateKey(
            (value2) => {
              if (keys.includes(value2)) warn('Duplicate key on x-for', el);
              keys.push(value2);
            },
            { scope: { index: key, ...scope2 } },
          );
          scopes.push(scope2);
        });
      } else {
        for (let i = 0; i < items.length; i++) {
          let scope2 = getIterationScopeVariables(iteratorNames, items[i], i, items);
          evaluateKey(
            (value) => {
              if (keys.includes(value)) warn('Duplicate key on x-for', el);
              keys.push(value);
            },
            { scope: { index: i, ...scope2 } },
          );
          scopes.push(scope2);
        }
      }
      let adds = [];
      let moves = [];
      let removes = [];
      let sames = [];
      for (let i = 0; i < prevKeys.length; i++) {
        let key = prevKeys[i];
        if (keys.indexOf(key) === -1) removes.push(key);
      }
      prevKeys = prevKeys.filter((key) => !removes.includes(key));
      let lastKey = 'template';
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let prevIndex = prevKeys.indexOf(key);
        if (prevIndex === -1) {
          prevKeys.splice(i, 0, key);
          adds.push([lastKey, i]);
        } else if (prevIndex !== i) {
          let keyInSpot = prevKeys.splice(i, 1)[0];
          let keyForSpot = prevKeys.splice(prevIndex - 1, 1)[0];
          prevKeys.splice(i, 0, keyForSpot);
          prevKeys.splice(prevIndex, 0, keyInSpot);
          moves.push([keyInSpot, keyForSpot]);
        } else {
          sames.push(key);
        }
        lastKey = key;
      }
      for (let i = 0; i < removes.length; i++) {
        let key = removes[i];
        if (!(key in lookup)) continue;
        mutateDom(() => {
          destroyTree(lookup[key]);
          lookup[key].remove();
        });
        delete lookup[key];
      }
      for (let i = 0; i < moves.length; i++) {
        let [keyInSpot, keyForSpot] = moves[i];
        let elInSpot = lookup[keyInSpot];
        let elForSpot = lookup[keyForSpot];
        let marker = document.createElement('div');
        mutateDom(() => {
          if (!elForSpot) warn(`x-for ":key" is undefined or invalid`, templateEl, keyForSpot, lookup);
          elForSpot.after(marker);
          elInSpot.after(elForSpot);
          elForSpot._x_currentIfEl && elForSpot.after(elForSpot._x_currentIfEl);
          marker.before(elInSpot);
          elInSpot._x_currentIfEl && elInSpot.after(elInSpot._x_currentIfEl);
          marker.remove();
        });
        elForSpot._x_refreshXForScope(scopes[keys.indexOf(keyForSpot)]);
      }
      for (let i = 0; i < adds.length; i++) {
        let [lastKey2, index2] = adds[i];
        let lastEl = lastKey2 === 'template' ? templateEl : lookup[lastKey2];
        if (lastEl._x_currentIfEl) lastEl = lastEl._x_currentIfEl;
        let scope2 = scopes[index2];
        let key = keys[index2];
        let clone22 = document.importNode(templateEl.content, true).firstElementChild;
        let reactiveScope = reactive(scope2);
        addScopeToNode(clone22, reactiveScope, templateEl);
        clone22._x_refreshXForScope = (newScope) => {
          Object.entries(newScope).forEach(([key2, value]) => {
            reactiveScope[key2] = value;
          });
        };
        mutateDom(() => {
          lastEl.after(clone22);
          skipDuringClone(() => initTree(clone22))();
        });
        if (typeof key === 'object') {
          warn('x-for key cannot be an object, it must be a string or an integer', templateEl);
        }
        lookup[key] = clone22;
      }
      for (let i = 0; i < sames.length; i++) {
        lookup[sames[i]]._x_refreshXForScope(scopes[keys.indexOf(sames[i])]);
      }
      templateEl._x_prevKeys = keys;
    });
  }
  function parseForExpression(expression) {
    let forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
    let stripParensRE = /^\s*\(|\)\s*$/g;
    let forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
    let inMatch = expression.match(forAliasRE);
    if (!inMatch) return;
    let res = {};
    res.items = inMatch[2].trim();
    let item = inMatch[1].replace(stripParensRE, '').trim();
    let iteratorMatch = item.match(forIteratorRE);
    if (iteratorMatch) {
      res.item = item.replace(forIteratorRE, '').trim();
      res.index = iteratorMatch[1].trim();
      if (iteratorMatch[2]) {
        res.collection = iteratorMatch[2].trim();
      }
    } else {
      res.item = item;
    }
    return res;
  }
  function getIterationScopeVariables(iteratorNames, item, index2, items) {
    let scopeVariables = {};
    if (/^\[.*\]$/.test(iteratorNames.item) && Array.isArray(item)) {
      let names = iteratorNames.item
        .replace('[', '')
        .replace(']', '')
        .split(',')
        .map((i) => i.trim());
      names.forEach((name, i) => {
        scopeVariables[name] = item[i];
      });
    } else if (/^\{.*\}$/.test(iteratorNames.item) && !Array.isArray(item) && typeof item === 'object') {
      let names = iteratorNames.item
        .replace('{', '')
        .replace('}', '')
        .split(',')
        .map((i) => i.trim());
      names.forEach((name) => {
        scopeVariables[name] = item[name];
      });
    } else {
      scopeVariables[iteratorNames.item] = item;
    }
    if (iteratorNames.index) scopeVariables[iteratorNames.index] = index2;
    if (iteratorNames.collection) scopeVariables[iteratorNames.collection] = items;
    return scopeVariables;
  }
  function isNumeric3(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function handler3() {}
  handler3.inline = (el, { expression }, { cleanup: cleanup2 }) => {
    let root = closestRoot(el);
    if (!root._x_refs) root._x_refs = {};
    root._x_refs[expression] = el;
    cleanup2(() => delete root._x_refs[expression]);
  };
  directive('ref', handler3);
  directive('if', (el, { expression }, { effect: effect32, cleanup: cleanup2 }) => {
    if (el.tagName.toLowerCase() !== 'template') warn('x-if can only be used on a <template> tag', el);
    let evaluate2 = evaluateLater(el, expression);
    let show = () => {
      if (el._x_currentIfEl) return el._x_currentIfEl;
      let clone22 = el.content.cloneNode(true).firstElementChild;
      addScopeToNode(clone22, {}, el);
      mutateDom(() => {
        el.after(clone22);
        skipDuringClone(() => initTree(clone22))();
      });
      el._x_currentIfEl = clone22;
      el._x_undoIf = () => {
        mutateDom(() => {
          destroyTree(clone22);
          clone22.remove();
        });
        delete el._x_currentIfEl;
      };
      return clone22;
    };
    let hide2 = () => {
      if (!el._x_undoIf) return;
      el._x_undoIf();
      delete el._x_undoIf;
    };
    effect32(() =>
      evaluate2((value) => {
        value ? show() : hide2();
      }),
    );
    cleanup2(() => el._x_undoIf && el._x_undoIf());
  });
  directive('id', (el, { expression }, { evaluate: evaluate2 }) => {
    let names = evaluate2(expression);
    names.forEach((name) => setIdRoot(el, name));
  });
  interceptClone((from, to) => {
    if (from._x_ids) {
      to._x_ids = from._x_ids;
    }
  });
  mapAttributes(startingWith('@', into(prefix('on:'))));
  directive(
    'on',
    skipDuringClone((el, { value, modifiers, expression }, { cleanup: cleanup2 }) => {
      let evaluate2 = expression ? evaluateLater(el, expression) : () => {};
      if (el.tagName.toLowerCase() === 'template') {
        if (!el._x_forwardEvents) el._x_forwardEvents = [];
        if (!el._x_forwardEvents.includes(value)) el._x_forwardEvents.push(value);
      }
      let removeListener = on(el, value, modifiers, (e) => {
        evaluate2(() => {}, { scope: { $event: e }, params: [e] });
      });
      cleanup2(() => removeListener());
    }),
  );
  warnMissingPluginDirective('Collapse', 'collapse', 'collapse');
  warnMissingPluginDirective('Intersect', 'intersect', 'intersect');
  warnMissingPluginDirective('Focus', 'trap', 'focus');
  warnMissingPluginDirective('Mask', 'mask', 'mask');
  function warnMissingPluginDirective(name, directiveName, slug) {
    directive(directiveName, (el) =>
      warn(
        `You can't use [x-${directiveName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`,
        el,
      ),
    );
  }
  alpine_default.setEvaluator(normalEvaluator);
  alpine_default.setReactivityEngine({ reactive: reactive2, effect: effect2, release: stop, raw: toRaw });
  var src_default = alpine_default;
  var module_default = src_default;

  // node_modules/@alpinejs/sort/dist/module.esm.js
  function ownKeys2(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }
      keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      if (i % 2) {
        ownKeys2(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys2(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }
  function _typeof(obj) {
    '@babel/helpers - typeof';
    if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
      _typeof = function (obj2) {
        return typeof obj2;
      };
    } else {
      _typeof = function (obj2) {
        return obj2 && typeof Symbol === 'function' && obj2.constructor === Symbol && obj2 !== Symbol.prototype
          ? 'symbol'
          : typeof obj2;
      };
    }
    return _typeof(obj);
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _extends() {
    _extends =
      Object.assign ||
      function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
    return _extends.apply(this, arguments);
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
    return target;
  }
  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  var version = '1.15.2';
  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !!(/* @__PURE__ */ navigator.userAgent.match(pattern));
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var FireFox = userAgent(/firefox/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var IOS = userAgent(/iP(ad|od|hone)/i);
  var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
  var captureMode = {
    capture: false,
    passive: false,
  };
  function on2(el, event, fn2) {
    el.addEventListener(event, fn2, !IE11OrLess && captureMode);
  }
  function off(el, event, fn2) {
    el.removeEventListener(event, fn2, !IE11OrLess && captureMode);
  }
  function matches(el, selector) {
    if (!selector) return;
    selector[0] === '>' && (selector = selector.substring(1));
    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector);
        } else if (el.msMatchesSelector) {
          return el.msMatchesSelector(selector);
        } else if (el.webkitMatchesSelector) {
          return el.webkitMatchesSelector(selector);
        }
      } catch (_) {
        return false;
      }
    }
    return false;
  }
  function getParentOrHost(el) {
    return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
  }
  function closest(el, selector, ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;
      do {
        if (
          (selector != null &&
            (selector[0] === '>' ? el.parentNode === ctx && matches(el, selector) : matches(el, selector))) ||
          (includeCTX && el === ctx)
        ) {
          return el;
        }
        if (el === ctx) break;
      } while ((el = getParentOrHost(el)));
    }
    return null;
  }
  var R_SPACE = /\s+/g;
  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? 'add' : 'remove'](name);
      } else {
        var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
        el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
      }
    }
  }
  function css(el, prop, val) {
    var style = el && el.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, '');
        } else if (el.currentStyle) {
          val = el.currentStyle;
        }
        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf('webkit') === -1) {
          prop = '-webkit-' + prop;
        }
        style[prop] = val + (typeof val === 'string' ? '' : 'px');
      }
    }
  }
  function matrix(el, selfOnly) {
    var appliedTransforms = '';
    if (typeof el === 'string') {
      appliedTransforms = el;
    } else {
      do {
        var transform = css(el, 'transform');
        if (transform && transform !== 'none') {
          appliedTransforms = transform + ' ' + appliedTransforms;
        }
      } while (!selfOnly && (el = el.parentNode));
    }
    var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    return matrixFn && new matrixFn(appliedTransforms);
  }
  function find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName),
        i = 0,
        n = list.length;
      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i);
        }
      }
      return list;
    }
    return [];
  }
  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      return scrollingElement;
    } else {
      return document.documentElement;
    }
  }
  function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el.getBoundingClientRect && el !== window) return;
    var elRect, top2, left2, bottom2, right2, height, width;
    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top2 = elRect.top;
      left2 = elRect.left;
      bottom2 = elRect.bottom;
      right2 = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top2 = 0;
      left2 = 0;
      bottom2 = window.innerHeight;
      right2 = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }
    if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
      container = container || el.parentNode;
      if (!IE11OrLess) {
        do {
          if (
            container &&
            container.getBoundingClientRect &&
            (css(container, 'transform') !== 'none' ||
              (relativeToNonStaticParent && css(container, 'position') !== 'static'))
          ) {
            var containerRect = container.getBoundingClientRect();
            top2 -= containerRect.top + parseInt(css(container, 'border-top-width'));
            left2 -= containerRect.left + parseInt(css(container, 'border-left-width'));
            bottom2 = top2 + elRect.height;
            right2 = left2 + elRect.width;
            break;
          }
        } while ((container = container.parentNode));
      }
    }
    if (undoScale && el !== window) {
      var elMatrix = matrix(container || el),
        scaleX = elMatrix && elMatrix.a,
        scaleY = elMatrix && elMatrix.d;
      if (elMatrix) {
        top2 /= scaleY;
        left2 /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom2 = top2 + height;
        right2 = left2 + width;
      }
    }
    return {
      top: top2,
      left: left2,
      bottom: bottom2,
      right: right2,
      width,
      height,
    };
  }
  function isScrolledPast(el, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el, true),
      elSideVal = getRect(el)[elSide];
    while (parent) {
      var parentSideVal = getRect(parent)[parentSide],
        visible = void 0;
      if (parentSide === 'top' || parentSide === 'left') {
        visible = elSideVal >= parentSideVal;
      } else {
        visible = elSideVal <= parentSideVal;
      }
      if (!visible) return parent;
      if (parent === getWindowScrollingElement()) break;
      parent = getParentAutoScrollElement(parent, false);
    }
    return false;
  }
  function getChild(el, childNum, options, includeDragEl) {
    var currentChild = 0,
      i = 0,
      children = el.children;
    while (i < children.length) {
      if (
        children[i].style.display !== 'none' &&
        children[i] !== Sortable.ghost &&
        (includeDragEl || children[i] !== Sortable.dragged) &&
        closest(children[i], options.draggable, el, false)
      ) {
        if (currentChild === childNum) {
          return children[i];
        }
        currentChild++;
      }
      i++;
    }
    return null;
  }
  function lastChild(el, selector) {
    var last = el.lastElementChild;
    while (
      last &&
      (last === Sortable.ghost || css(last, 'display') === 'none' || (selector && !matches(last, selector)))
    ) {
      last = last.previousElementSibling;
    }
    return last || null;
  }
  function index(el, selector) {
    var index2 = 0;
    if (!el || !el.parentNode) {
      return -1;
    }
    while ((el = el.previousElementSibling)) {
      if (el.nodeName.toUpperCase() !== 'TEMPLATE' && el !== Sortable.clone && (!selector || matches(el, selector))) {
        index2++;
      }
    }
    return index2;
  }
  function getRelativeScrollOffset(el) {
    var offsetLeft = 0,
      offsetTop = 0,
      winScroller = getWindowScrollingElement();
    if (el) {
      do {
        var elMatrix = matrix(el),
          scaleX = elMatrix.a,
          scaleY = elMatrix.d;
        offsetLeft += el.scrollLeft * scaleX;
        offsetTop += el.scrollTop * scaleY;
      } while (el !== winScroller && (el = el.parentNode));
    }
    return [offsetLeft, offsetTop];
  }
  function indexOfObject(arr, obj) {
    for (var i in arr) {
      if (!arr.hasOwnProperty(i)) continue;
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
      }
    }
    return -1;
  }
  function getParentAutoScrollElement(el, includeSelf) {
    if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
    var elem = el;
    var gotSelf = false;
    do {
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (
          (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll')) ||
          (elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll'))
        ) {
          if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
          if (gotSelf || includeSelf) return elem;
          gotSelf = true;
        }
      }
    } while ((elem = elem.parentNode));
    return getWindowScrollingElement();
  }
  function extend(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }
    return dst;
  }
  function isRectEqual(rect1, rect2) {
    return (
      Math.round(rect1.top) === Math.round(rect2.top) &&
      Math.round(rect1.left) === Math.round(rect2.left) &&
      Math.round(rect1.height) === Math.round(rect2.height) &&
      Math.round(rect1.width) === Math.round(rect2.width)
    );
  }
  var _throttleTimeout;
  function throttle2(callback, ms) {
    return function () {
      if (!_throttleTimeout) {
        var args = arguments,
          _this = this;
        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }
        _throttleTimeout = setTimeout(function () {
          _throttleTimeout = void 0;
        }, ms);
      }
    };
  }
  function cancelThrottle() {
    clearTimeout(_throttleTimeout);
    _throttleTimeout = void 0;
  }
  function scrollBy(el, x, y) {
    el.scrollLeft += x;
    el.scrollTop += y;
  }
  function clone2(el) {
    var Polymer = window.Polymer;
    var $ = window.jQuery || window.Zepto;
    if (Polymer && Polymer.dom) {
      return Polymer.dom(el).cloneNode(true);
    } else if ($) {
      return $(el).clone(true)[0];
    } else {
      return el.cloneNode(true);
    }
  }
  function getChildContainingRectFromElement(container, options, ghostEl2) {
    var rect = {};
    Array.from(container.children).forEach(function (child) {
      var _rect$left, _rect$top, _rect$right, _rect$bottom;
      if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl2) return;
      var childRect = getRect(child);
      rect.left = Math.min(
        (_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity,
        childRect.left,
      );
      rect.top = Math.min(
        (_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity,
        childRect.top,
      );
      rect.right = Math.max(
        (_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity,
        childRect.right,
      );
      rect.bottom = Math.max(
        (_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity,
        childRect.bottom,
      );
    });
    rect.width = rect.right - rect.left;
    rect.height = rect.bottom - rect.top;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  var expando = 'Sortable' + /* @__PURE__ */ new Date().getTime();
  function AnimationStateManager() {
    var animationStates = [],
      animationCallbackId;
    return {
      captureAnimationState: function captureAnimationState() {
        animationStates = [];
        if (!this.options.animation) return;
        var children = [].slice.call(this.el.children);
        children.forEach(function (child) {
          if (css(child, 'display') === 'none' || child === Sortable.ghost) return;
          animationStates.push({
            target: child,
            rect: getRect(child),
          });
          var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
          if (child.thisAnimationDuration) {
            var childMatrix = matrix(child, true);
            if (childMatrix) {
              fromRect.top -= childMatrix.f;
              fromRect.left -= childMatrix.e;
            }
          }
          child.fromRect = fromRect;
        });
      },
      addAnimationState: function addAnimationState(state) {
        animationStates.push(state);
      },
      removeAnimationState: function removeAnimationState(target) {
        animationStates.splice(
          indexOfObject(animationStates, {
            target,
          }),
          1,
        );
      },
      animateAll: function animateAll(callback) {
        var _this = this;
        if (!this.options.animation) {
          clearTimeout(animationCallbackId);
          if (typeof callback === 'function') callback();
          return;
        }
        var animating = false,
          animationTime = 0;
        animationStates.forEach(function (state) {
          var time = 0,
            target = state.target,
            fromRect = target.fromRect,
            toRect = getRect(target),
            prevFromRect = target.prevFromRect,
            prevToRect = target.prevToRect,
            animatingRect = state.rect,
            targetMatrix = matrix(target, true);
          if (targetMatrix) {
            toRect.top -= targetMatrix.f;
            toRect.left -= targetMatrix.e;
          }
          target.toRect = toRect;
          if (target.thisAnimationDuration) {
            if (
              isRectEqual(prevFromRect, toRect) &&
              !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
              (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) ===
                (fromRect.top - toRect.top) / (fromRect.left - toRect.left)
            ) {
              time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
            }
          }
          if (!isRectEqual(toRect, fromRect)) {
            target.prevFromRect = fromRect;
            target.prevToRect = toRect;
            if (!time) {
              time = _this.options.animation;
            }
            _this.animate(target, animatingRect, toRect, time);
          }
          if (time) {
            animating = true;
            animationTime = Math.max(animationTime, time);
            clearTimeout(target.animationResetTimer);
            target.animationResetTimer = setTimeout(function () {
              target.animationTime = 0;
              target.prevFromRect = null;
              target.fromRect = null;
              target.prevToRect = null;
              target.thisAnimationDuration = null;
            }, time);
            target.thisAnimationDuration = time;
          }
        });
        clearTimeout(animationCallbackId);
        if (!animating) {
          if (typeof callback === 'function') callback();
        } else {
          animationCallbackId = setTimeout(function () {
            if (typeof callback === 'function') callback();
          }, animationTime);
        }
        animationStates = [];
      },
      animate: function animate(target, currentRect, toRect, duration) {
        if (duration) {
          css(target, 'transition', '');
          css(target, 'transform', '');
          var elMatrix = matrix(this.el),
            scaleX = elMatrix && elMatrix.a,
            scaleY = elMatrix && elMatrix.d,
            translateX = (currentRect.left - toRect.left) / (scaleX || 1),
            translateY = (currentRect.top - toRect.top) / (scaleY || 1);
          target.animatingX = !!translateX;
          target.animatingY = !!translateY;
          css(target, 'transform', 'translate3d(' + translateX + 'px,' + translateY + 'px,0)');
          this.forRepaintDummy = repaint(target);
          css(
            target,
            'transition',
            'transform ' + duration + 'ms' + (this.options.easing ? ' ' + this.options.easing : ''),
          );
          css(target, 'transform', 'translate3d(0,0,0)');
          typeof target.animated === 'number' && clearTimeout(target.animated);
          target.animated = setTimeout(function () {
            css(target, 'transition', '');
            css(target, 'transform', '');
            target.animated = false;
            target.animatingX = false;
            target.animatingY = false;
          }, duration);
        }
      },
    };
  }
  function repaint(target) {
    return target.offsetWidth;
  }
  function calculateRealTime(animatingRect, fromRect, toRect, options) {
    return (
      (Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) /
        Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2))) *
      options.animation
    );
  }
  var plugins = [];
  var defaults = {
    initializeByDefault: true,
  };
  var PluginManager = {
    mount: function mount(plugin2) {
      for (var option2 in defaults) {
        if (defaults.hasOwnProperty(option2) && !(option2 in plugin2)) {
          plugin2[option2] = defaults[option2];
        }
      }
      plugins.forEach(function (p) {
        if (p.pluginName === plugin2.pluginName) {
          throw 'Sortable: Cannot mount plugin '.concat(plugin2.pluginName, ' more than once');
        }
      });
      plugins.push(plugin2);
    },
    pluginEvent: function pluginEvent(eventName, sortable, evt) {
      var _this = this;
      this.eventCanceled = false;
      evt.cancel = function () {
        _this.eventCanceled = true;
      };
      var eventNameGlobal = eventName + 'Global';
      plugins.forEach(function (plugin2) {
        if (!sortable[plugin2.pluginName]) return;
        if (sortable[plugin2.pluginName][eventNameGlobal]) {
          sortable[plugin2.pluginName][eventNameGlobal](
            _objectSpread2(
              {
                sortable,
              },
              evt,
            ),
          );
        }
        if (sortable.options[plugin2.pluginName] && sortable[plugin2.pluginName][eventName]) {
          sortable[plugin2.pluginName][eventName](
            _objectSpread2(
              {
                sortable,
              },
              evt,
            ),
          );
        }
      });
    },
    initializePlugins: function initializePlugins(sortable, el, defaults2, options) {
      plugins.forEach(function (plugin2) {
        var pluginName = plugin2.pluginName;
        if (!sortable.options[pluginName] && !plugin2.initializeByDefault) return;
        var initialized = new plugin2(sortable, el, sortable.options);
        initialized.sortable = sortable;
        initialized.options = sortable.options;
        sortable[pluginName] = initialized;
        _extends(defaults2, initialized.defaults);
      });
      for (var option2 in sortable.options) {
        if (!sortable.options.hasOwnProperty(option2)) continue;
        var modified = this.modifyOption(sortable, option2, sortable.options[option2]);
        if (typeof modified !== 'undefined') {
          sortable.options[option2] = modified;
        }
      }
    },
    getEventProperties: function getEventProperties(name, sortable) {
      var eventProperties = {};
      plugins.forEach(function (plugin2) {
        if (typeof plugin2.eventProperties !== 'function') return;
        _extends(eventProperties, plugin2.eventProperties.call(sortable[plugin2.pluginName], name));
      });
      return eventProperties;
    },
    modifyOption: function modifyOption(sortable, name, value) {
      var modifiedValue;
      plugins.forEach(function (plugin2) {
        if (!sortable[plugin2.pluginName]) return;
        if (plugin2.optionListeners && typeof plugin2.optionListeners[name] === 'function') {
          modifiedValue = plugin2.optionListeners[name].call(sortable[plugin2.pluginName], value);
        }
      });
      return modifiedValue;
    },
  };
  function dispatchEvent(_ref) {
    var sortable = _ref.sortable,
      rootEl2 = _ref.rootEl,
      name = _ref.name,
      targetEl = _ref.targetEl,
      cloneEl2 = _ref.cloneEl,
      toEl = _ref.toEl,
      fromEl = _ref.fromEl,
      oldIndex2 = _ref.oldIndex,
      newIndex2 = _ref.newIndex,
      oldDraggableIndex2 = _ref.oldDraggableIndex,
      newDraggableIndex2 = _ref.newDraggableIndex,
      originalEvent = _ref.originalEvent,
      putSortable2 = _ref.putSortable,
      extraEventProperties = _ref.extraEventProperties;
    sortable = sortable || (rootEl2 && rootEl2[expando]);
    if (!sortable) return;
    var evt,
      options = sortable.options,
      onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true,
      });
    } else {
      evt = document.createEvent('Event');
      evt.initEvent(name, true, true);
    }
    evt.to = toEl || rootEl2;
    evt.from = fromEl || rootEl2;
    evt.item = targetEl || rootEl2;
    evt.clone = cloneEl2;
    evt.oldIndex = oldIndex2;
    evt.newIndex = newIndex2;
    evt.oldDraggableIndex = oldDraggableIndex2;
    evt.newDraggableIndex = newDraggableIndex2;
    evt.originalEvent = originalEvent;
    evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
    var allEventProperties = _objectSpread2(
      _objectSpread2({}, extraEventProperties),
      PluginManager.getEventProperties(name, sortable),
    );
    for (var option2 in allEventProperties) {
      evt[option2] = allEventProperties[option2];
    }
    if (rootEl2) {
      rootEl2.dispatchEvent(evt);
    }
    if (options[onName]) {
      options[onName].call(sortable, evt);
    }
  }
  var _excluded = ['evt'];
  var pluginEvent2 = function pluginEvent3(eventName, sortable) {
    var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {},
      originalEvent = _ref.evt,
      data2 = _objectWithoutProperties(_ref, _excluded);
    PluginManager.pluginEvent.bind(Sortable)(
      eventName,
      sortable,
      _objectSpread2(
        {
          dragEl,
          parentEl,
          ghostEl,
          rootEl,
          nextEl,
          lastDownEl,
          cloneEl,
          cloneHidden,
          dragStarted: moved,
          putSortable,
          activeSortable: Sortable.active,
          originalEvent,
          oldIndex,
          oldDraggableIndex,
          newIndex,
          newDraggableIndex,
          hideGhostForTarget: _hideGhostForTarget,
          unhideGhostForTarget: _unhideGhostForTarget,
          cloneNowHidden: function cloneNowHidden() {
            cloneHidden = true;
          },
          cloneNowShown: function cloneNowShown() {
            cloneHidden = false;
          },
          dispatchSortableEvent: function dispatchSortableEvent(name) {
            _dispatchEvent({
              sortable,
              name,
              originalEvent,
            });
          },
        },
        data2,
      ),
    );
  };
  function _dispatchEvent(info) {
    dispatchEvent(
      _objectSpread2(
        {
          putSortable,
          cloneEl,
          targetEl: dragEl,
          rootEl,
          oldIndex,
          oldDraggableIndex,
          newIndex,
          newDraggableIndex,
        },
        info,
      ),
    );
  }
  var dragEl;
  var parentEl;
  var ghostEl;
  var rootEl;
  var nextEl;
  var lastDownEl;
  var cloneEl;
  var cloneHidden;
  var oldIndex;
  var newIndex;
  var oldDraggableIndex;
  var newDraggableIndex;
  var activeGroup;
  var putSortable;
  var awaitingDragStarted = false;
  var ignoreNextClick = false;
  var sortables = [];
  var tapEvt;
  var touchEvt;
  var lastDx;
  var lastDy;
  var tapDistanceLeft;
  var tapDistanceTop;
  var moved;
  var lastTarget;
  var lastDirection;
  var pastFirstInvertThresh = false;
  var isCircumstantialInvert = false;
  var targetMoveDistance;
  var ghostRelativeParent;
  var ghostRelativeParentInitialScroll = [];
  var _silent = false;
  var savedInputChecked = [];
  var documentExists = typeof document !== 'undefined';
  var PositionGhostAbsolutely = IOS;
  var CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float';
  var supportDraggable = documentExists && !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div');
  var supportCssPointerEvents = (function () {
    if (!documentExists) return;
    if (IE11OrLess) {
      return false;
    }
    var el = document.createElement('x');
    el.style.cssText = 'pointer-events:auto';
    return el.style.pointerEvents === 'auto';
  })();
  var _detectDirection = function _detectDirection2(el, options) {
    var elCSS = css(el),
      elWidth =
        parseInt(elCSS.width) -
        parseInt(elCSS.paddingLeft) -
        parseInt(elCSS.paddingRight) -
        parseInt(elCSS.borderLeftWidth) -
        parseInt(elCSS.borderRightWidth),
      child1 = getChild(el, 0, options),
      child2 = getChild(el, 1, options),
      firstChildCSS = child1 && css(child1),
      secondChildCSS = child2 && css(child2),
      firstChildWidth =
        firstChildCSS &&
        parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width,
      secondChildWidth =
        secondChildCSS &&
        parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
    if (elCSS.display === 'flex') {
      return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse' ? 'vertical' : 'horizontal';
    }
    if (elCSS.display === 'grid') {
      return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
    }
    if (child1 && firstChildCSS['float'] && firstChildCSS['float'] !== 'none') {
      var touchingSideChild2 = firstChildCSS['float'] === 'left' ? 'left' : 'right';
      return child2 && (secondChildCSS.clear === 'both' || secondChildCSS.clear === touchingSideChild2)
        ? 'vertical'
        : 'horizontal';
    }
    return child1 &&
      (firstChildCSS.display === 'block' ||
        firstChildCSS.display === 'flex' ||
        firstChildCSS.display === 'table' ||
        firstChildCSS.display === 'grid' ||
        (firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === 'none') ||
        (child2 && elCSS[CSSFloatProperty] === 'none' && firstChildWidth + secondChildWidth > elWidth))
      ? 'vertical'
      : 'horizontal';
  };
  var _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
    var dragElS1Opp = vertical ? dragRect.left : dragRect.top,
      dragElS2Opp = vertical ? dragRect.right : dragRect.bottom,
      dragElOppLength = vertical ? dragRect.width : dragRect.height,
      targetS1Opp = vertical ? targetRect.left : targetRect.top,
      targetS2Opp = vertical ? targetRect.right : targetRect.bottom,
      targetOppLength = vertical ? targetRect.width : targetRect.height;
    return (
      dragElS1Opp === targetS1Opp ||
      dragElS2Opp === targetS2Opp ||
      dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2
    );
  };
  var _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y) {
    var ret;
    sortables.some(function (sortable) {
      var threshold = sortable[expando].options.emptyInsertThreshold;
      if (!threshold || lastChild(sortable)) return;
      var rect = getRect(sortable),
        insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
        insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
      if (insideHorizontally && insideVertically) {
        return (ret = sortable);
      }
    });
    return ret;
  };
  var _prepareGroup = function _prepareGroup2(options) {
    function toFn(value, pull) {
      return function (to, from, dragEl2, evt) {
        var sameGroup =
          to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
        if (value == null && (pull || sameGroup)) {
          return true;
        } else if (value == null || value === false) {
          return false;
        } else if (pull && value === 'clone') {
          return value;
        } else if (typeof value === 'function') {
          return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
        } else {
          var otherGroup = (pull ? to : from).options.group.name;
          return (
            value === true ||
            (typeof value === 'string' && value === otherGroup) ||
            (value.join && value.indexOf(otherGroup) > -1)
          );
        }
      };
    }
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) != 'object') {
      originalGroup = {
        name: originalGroup,
      };
    }
    group.name = originalGroup.name;
    group.checkPull = toFn(originalGroup.pull, true);
    group.checkPut = toFn(originalGroup.put);
    group.revertClone = originalGroup.revertClone;
    options.group = group;
  };
  var _hideGhostForTarget = function _hideGhostForTarget2() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, 'display', 'none');
    }
  };
  var _unhideGhostForTarget = function _unhideGhostForTarget2() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, 'display', '');
    }
  };
  if (documentExists && !ChromeForAndroid) {
    document.addEventListener(
      'click',
      function (evt) {
        if (ignoreNextClick) {
          evt.preventDefault();
          evt.stopPropagation && evt.stopPropagation();
          evt.stopImmediatePropagation && evt.stopImmediatePropagation();
          ignoreNextClick = false;
          return false;
        }
      },
      true,
    );
  }
  var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
    if (dragEl) {
      evt = evt.touches ? evt.touches[0] : evt;
      var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
      if (nearest) {
        var event = {};
        for (var i in evt) {
          if (evt.hasOwnProperty(i)) {
            event[i] = evt[i];
          }
        }
        event.target = event.rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;
        nearest[expando]._onDragOver(event);
      }
    }
  };
  var _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
    if (dragEl) {
      dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
    }
  };
  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw 'Sortable: `el` must be an HTMLElement, not '.concat({}.toString.call(el));
    }
    this.el = el;
    this.options = options = _extends({}, options);
    el[expando] = this;
    var defaults2 = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el.nodeName) ? '>li' : '>*',
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el, this.options);
      },
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      ignore: 'a, img',
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function setData(dataTransfer, dragEl2) {
        dataTransfer.setData('Text', dragEl2.textContent);
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: 'data-id',
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: 'sortable-fallback',
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0,
      },
      supportPointer: Sortable.supportPointer !== false && 'PointerEvent' in window && !Safari,
      emptyInsertThreshold: 5,
    };
    PluginManager.initializePlugins(this, el, defaults2);
    for (var name in defaults2) {
      !(name in options) && (options[name] = defaults2[name]);
    }
    _prepareGroup(options);
    for (var fn2 in this) {
      if (fn2.charAt(0) === '_' && typeof this[fn2] === 'function') {
        this[fn2] = this[fn2].bind(this);
      }
    }
    this.nativeDraggable = options.forceFallback ? false : supportDraggable;
    if (this.nativeDraggable) {
      this.options.touchStartThreshold = 1;
    }
    if (options.supportPointer) {
      on2(el, 'pointerdown', this._onTapStart);
    } else {
      on2(el, 'mousedown', this._onTapStart);
      on2(el, 'touchstart', this._onTapStart);
    }
    if (this.nativeDraggable) {
      on2(el, 'dragover', this);
      on2(el, 'dragenter', this);
    }
    sortables.push(this.el);
    options.store && options.store.get && this.sort(options.store.get(this) || []);
    _extends(this, AnimationStateManager());
  }
  Sortable.prototype =
    /** @lends Sortable.prototype */
    {
      constructor: Sortable,
      _isOutsideThisEl: function _isOutsideThisEl(target) {
        if (!this.el.contains(target) && target !== this.el) {
          lastTarget = null;
        }
      },
      _getDirection: function _getDirection(evt, target) {
        return typeof this.options.direction === 'function'
          ? this.options.direction.call(this, evt, target, dragEl)
          : this.options.direction;
      },
      _onTapStart: function _onTapStart(evt) {
        if (!evt.cancelable) return;
        var _this = this,
          el = this.el,
          options = this.options,
          preventOnFilter = options.preventOnFilter,
          type = evt.type,
          touch = (evt.touches && evt.touches[0]) || (evt.pointerType && evt.pointerType === 'touch' && evt),
          target = (touch || evt).target,
          originalTarget =
            (evt.target.shadowRoot && ((evt.path && evt.path[0]) || (evt.composedPath && evt.composedPath()[0]))) ||
            target,
          filter = options.filter;
        _saveInputCheckedState(el);
        if (dragEl) {
          return;
        }
        if ((/mousedown|pointerdown/.test(type) && evt.button !== 0) || options.disabled) {
          return;
        }
        if (originalTarget.isContentEditable) {
          return;
        }
        if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === 'SELECT') {
          return;
        }
        target = closest(target, options.draggable, el, false);
        if (target && target.animated) {
          return;
        }
        if (lastDownEl === target) {
          return;
        }
        oldIndex = index(target);
        oldDraggableIndex = index(target, options.draggable);
        if (typeof filter === 'function') {
          if (filter.call(this, evt, target, this)) {
            _dispatchEvent({
              sortable: _this,
              rootEl: originalTarget,
              name: 'filter',
              targetEl: target,
              toEl: el,
              fromEl: el,
            });
            pluginEvent2('filter', _this, {
              evt,
            });
            preventOnFilter && evt.cancelable && evt.preventDefault();
            return;
          }
        } else if (filter) {
          filter = filter.split(',').some(function (criteria) {
            criteria = closest(originalTarget, criteria.trim(), el, false);
            if (criteria) {
              _dispatchEvent({
                sortable: _this,
                rootEl: criteria,
                name: 'filter',
                targetEl: target,
                fromEl: el,
                toEl: el,
              });
              pluginEvent2('filter', _this, {
                evt,
              });
              return true;
            }
          });
          if (filter) {
            preventOnFilter && evt.cancelable && evt.preventDefault();
            return;
          }
        }
        if (options.handle && !closest(originalTarget, options.handle, el, false)) {
          return;
        }
        this._prepareDragStart(evt, touch, target);
      },
      _prepareDragStart: function _prepareDragStart(evt, touch, target) {
        var _this = this,
          el = _this.el,
          options = _this.options,
          ownerDocument = el.ownerDocument,
          dragStartFn;
        if (target && !dragEl && target.parentNode === el) {
          var dragRect = getRect(target);
          rootEl = el;
          dragEl = target;
          parentEl = dragEl.parentNode;
          nextEl = dragEl.nextSibling;
          lastDownEl = target;
          activeGroup = options.group;
          Sortable.dragged = dragEl;
          tapEvt = {
            target: dragEl,
            clientX: (touch || evt).clientX,
            clientY: (touch || evt).clientY,
          };
          tapDistanceLeft = tapEvt.clientX - dragRect.left;
          tapDistanceTop = tapEvt.clientY - dragRect.top;
          this._lastX = (touch || evt).clientX;
          this._lastY = (touch || evt).clientY;
          dragEl.style['will-change'] = 'all';
          dragStartFn = function dragStartFn2() {
            pluginEvent2('delayEnded', _this, {
              evt,
            });
            if (Sortable.eventCanceled) {
              _this._onDrop();
              return;
            }
            _this._disableDelayedDragEvents();
            if (!FireFox && _this.nativeDraggable) {
              dragEl.draggable = true;
            }
            _this._triggerDragStart(evt, touch);
            _dispatchEvent({
              sortable: _this,
              name: 'choose',
              originalEvent: evt,
            });
            toggleClass(dragEl, options.chosenClass, true);
          };
          options.ignore.split(',').forEach(function (criteria) {
            find(dragEl, criteria.trim(), _disableDraggable);
          });
          on2(ownerDocument, 'dragover', nearestEmptyInsertDetectEvent);
          on2(ownerDocument, 'mousemove', nearestEmptyInsertDetectEvent);
          on2(ownerDocument, 'touchmove', nearestEmptyInsertDetectEvent);
          on2(ownerDocument, 'mouseup', _this._onDrop);
          on2(ownerDocument, 'touchend', _this._onDrop);
          on2(ownerDocument, 'touchcancel', _this._onDrop);
          if (FireFox && this.nativeDraggable) {
            this.options.touchStartThreshold = 4;
            dragEl.draggable = true;
          }
          pluginEvent2('delayStart', this, {
            evt,
          });
          if (
            options.delay &&
            (!options.delayOnTouchOnly || touch) &&
            (!this.nativeDraggable || !(Edge || IE11OrLess))
          ) {
            if (Sortable.eventCanceled) {
              this._onDrop();
              return;
            }
            on2(ownerDocument, 'mouseup', _this._disableDelayedDrag);
            on2(ownerDocument, 'touchend', _this._disableDelayedDrag);
            on2(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
            on2(ownerDocument, 'mousemove', _this._delayedDragTouchMoveHandler);
            on2(ownerDocument, 'touchmove', _this._delayedDragTouchMoveHandler);
            options.supportPointer && on2(ownerDocument, 'pointermove', _this._delayedDragTouchMoveHandler);
            _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
          } else {
            dragStartFn();
          }
        }
      },
      _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
        var touch = e.touches ? e.touches[0] : e;
        if (
          Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >=
          Math.floor(this.options.touchStartThreshold / ((this.nativeDraggable && window.devicePixelRatio) || 1))
        ) {
          this._disableDelayedDrag();
        }
      },
      _disableDelayedDrag: function _disableDelayedDrag() {
        dragEl && _disableDraggable(dragEl);
        clearTimeout(this._dragStartTimer);
        this._disableDelayedDragEvents();
      },
      _disableDelayedDragEvents: function _disableDelayedDragEvents() {
        var ownerDocument = this.el.ownerDocument;
        off(ownerDocument, 'mouseup', this._disableDelayedDrag);
        off(ownerDocument, 'touchend', this._disableDelayedDrag);
        off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
        off(ownerDocument, 'mousemove', this._delayedDragTouchMoveHandler);
        off(ownerDocument, 'touchmove', this._delayedDragTouchMoveHandler);
        off(ownerDocument, 'pointermove', this._delayedDragTouchMoveHandler);
      },
      _triggerDragStart: function _triggerDragStart(evt, touch) {
        touch = touch || (evt.pointerType == 'touch' && evt);
        if (!this.nativeDraggable || touch) {
          if (this.options.supportPointer) {
            on2(document, 'pointermove', this._onTouchMove);
          } else if (touch) {
            on2(document, 'touchmove', this._onTouchMove);
          } else {
            on2(document, 'mousemove', this._onTouchMove);
          }
        } else {
          on2(dragEl, 'dragend', this);
          on2(rootEl, 'dragstart', this._onDragStart);
        }
        try {
          if (document.selection) {
            _nextTick(function () {
              document.selection.empty();
            });
          } else {
            window.getSelection().removeAllRanges();
          }
        } catch (err) {}
      },
      _dragStarted: function _dragStarted(fallback, evt) {
        awaitingDragStarted = false;
        if (rootEl && dragEl) {
          pluginEvent2('dragStarted', this, {
            evt,
          });
          if (this.nativeDraggable) {
            on2(document, 'dragover', _checkOutsideTargetEl);
          }
          var options = this.options;
          !fallback && toggleClass(dragEl, options.dragClass, false);
          toggleClass(dragEl, options.ghostClass, true);
          Sortable.active = this;
          fallback && this._appendGhost();
          _dispatchEvent({
            sortable: this,
            name: 'start',
            originalEvent: evt,
          });
        } else {
          this._nulling();
        }
      },
      _emulateDragOver: function _emulateDragOver() {
        if (touchEvt) {
          this._lastX = touchEvt.clientX;
          this._lastY = touchEvt.clientY;
          _hideGhostForTarget();
          var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          var parent = target;
          while (target && target.shadowRoot) {
            target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
            if (target === parent) break;
            parent = target;
          }
          dragEl.parentNode[expando]._isOutsideThisEl(target);
          if (parent) {
            do {
              if (parent[expando]) {
                var inserted = void 0;
                inserted = parent[expando]._onDragOver({
                  clientX: touchEvt.clientX,
                  clientY: touchEvt.clientY,
                  target,
                  rootEl: parent,
                });
                if (inserted && !this.options.dragoverBubble) {
                  break;
                }
              }
              target = parent;
            } while ((parent = parent.parentNode));
          }
          _unhideGhostForTarget();
        }
      },
      _onTouchMove: function _onTouchMove(evt) {
        if (tapEvt) {
          var options = this.options,
            fallbackTolerance = options.fallbackTolerance,
            fallbackOffset = options.fallbackOffset,
            touch = evt.touches ? evt.touches[0] : evt,
            ghostMatrix = ghostEl && matrix(ghostEl, true),
            scaleX = ghostEl && ghostMatrix && ghostMatrix.a,
            scaleY = ghostEl && ghostMatrix && ghostMatrix.d,
            relativeScrollOffset =
              PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent),
            dx =
              (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) +
              (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) /
                (scaleX || 1),
            dy =
              (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) +
              (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) /
                (scaleY || 1);
          if (!Sortable.active && !awaitingDragStarted) {
            if (
              fallbackTolerance &&
              Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance
            ) {
              return;
            }
            this._onDragStart(evt, true);
          }
          if (ghostEl) {
            if (ghostMatrix) {
              ghostMatrix.e += dx - (lastDx || 0);
              ghostMatrix.f += dy - (lastDy || 0);
            } else {
              ghostMatrix = {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                e: dx,
                f: dy,
              };
            }
            var cssMatrix = 'matrix('
              .concat(ghostMatrix.a, ',')
              .concat(ghostMatrix.b, ',')
              .concat(ghostMatrix.c, ',')
              .concat(ghostMatrix.d, ',')
              .concat(ghostMatrix.e, ',')
              .concat(ghostMatrix.f, ')');
            css(ghostEl, 'webkitTransform', cssMatrix);
            css(ghostEl, 'mozTransform', cssMatrix);
            css(ghostEl, 'msTransform', cssMatrix);
            css(ghostEl, 'transform', cssMatrix);
            lastDx = dx;
            lastDy = dy;
            touchEvt = touch;
          }
          evt.cancelable && evt.preventDefault();
        }
      },
      _appendGhost: function _appendGhost() {
        if (!ghostEl) {
          var container = this.options.fallbackOnBody ? document.body : rootEl,
            rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container),
            options = this.options;
          if (PositionGhostAbsolutely) {
            ghostRelativeParent = container;
            while (
              css(ghostRelativeParent, 'position') === 'static' &&
              css(ghostRelativeParent, 'transform') === 'none' &&
              ghostRelativeParent !== document
            ) {
              ghostRelativeParent = ghostRelativeParent.parentNode;
            }
            if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
              if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
              rect.top += ghostRelativeParent.scrollTop;
              rect.left += ghostRelativeParent.scrollLeft;
            } else {
              ghostRelativeParent = getWindowScrollingElement();
            }
            ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
          }
          ghostEl = dragEl.cloneNode(true);
          toggleClass(ghostEl, options.ghostClass, false);
          toggleClass(ghostEl, options.fallbackClass, true);
          toggleClass(ghostEl, options.dragClass, true);
          css(ghostEl, 'transition', '');
          css(ghostEl, 'transform', '');
          css(ghostEl, 'box-sizing', 'border-box');
          css(ghostEl, 'margin', 0);
          css(ghostEl, 'top', rect.top);
          css(ghostEl, 'left', rect.left);
          css(ghostEl, 'width', rect.width);
          css(ghostEl, 'height', rect.height);
          css(ghostEl, 'opacity', '0.8');
          css(ghostEl, 'position', PositionGhostAbsolutely ? 'absolute' : 'fixed');
          css(ghostEl, 'zIndex', '100000');
          css(ghostEl, 'pointerEvents', 'none');
          Sortable.ghost = ghostEl;
          container.appendChild(ghostEl);
          css(
            ghostEl,
            'transform-origin',
            (tapDistanceLeft / parseInt(ghostEl.style.width)) * 100 +
              '% ' +
              (tapDistanceTop / parseInt(ghostEl.style.height)) * 100 +
              '%',
          );
        }
      },
      _onDragStart: function _onDragStart(evt, fallback) {
        var _this = this;
        var dataTransfer = evt.dataTransfer;
        var options = _this.options;
        pluginEvent2('dragStart', this, {
          evt,
        });
        if (Sortable.eventCanceled) {
          this._onDrop();
          return;
        }
        pluginEvent2('setupClone', this);
        if (!Sortable.eventCanceled) {
          cloneEl = clone2(dragEl);
          cloneEl.removeAttribute('id');
          cloneEl.draggable = false;
          cloneEl.style['will-change'] = '';
          this._hideClone();
          toggleClass(cloneEl, this.options.chosenClass, false);
          Sortable.clone = cloneEl;
        }
        _this.cloneId = _nextTick(function () {
          pluginEvent2('clone', _this);
          if (Sortable.eventCanceled) return;
          if (!_this.options.removeCloneOnHide) {
            rootEl.insertBefore(cloneEl, dragEl);
          }
          _this._hideClone();
          _dispatchEvent({
            sortable: _this,
            name: 'clone',
          });
        });
        !fallback && toggleClass(dragEl, options.dragClass, true);
        if (fallback) {
          ignoreNextClick = true;
          _this._loopId = setInterval(_this._emulateDragOver, 50);
        } else {
          off(document, 'mouseup', _this._onDrop);
          off(document, 'touchend', _this._onDrop);
          off(document, 'touchcancel', _this._onDrop);
          if (dataTransfer) {
            dataTransfer.effectAllowed = 'move';
            options.setData && options.setData.call(_this, dataTransfer, dragEl);
          }
          on2(document, 'drop', _this);
          css(dragEl, 'transform', 'translateZ(0)');
        }
        awaitingDragStarted = true;
        _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
        on2(document, 'selectstart', _this);
        moved = true;
        if (Safari) {
          css(document.body, 'user-select', 'none');
        }
      },
      // Returns true - if no further action is needed (either inserted or another condition)
      _onDragOver: function _onDragOver(evt) {
        var el = this.el,
          target = evt.target,
          dragRect,
          targetRect,
          revert,
          options = this.options,
          group = options.group,
          activeSortable = Sortable.active,
          isOwner = activeGroup === group,
          canSort = options.sort,
          fromSortable = putSortable || activeSortable,
          vertical,
          _this = this,
          completedFired = false;
        if (_silent) return;
        function dragOverEvent(name, extra) {
          pluginEvent2(
            name,
            _this,
            _objectSpread2(
              {
                evt,
                isOwner,
                axis: vertical ? 'vertical' : 'horizontal',
                revert,
                dragRect,
                targetRect,
                canSort,
                fromSortable,
                target,
                completed,
                onMove: function onMove(target2, after2) {
                  return _onMove(rootEl, el, dragEl, dragRect, target2, getRect(target2), evt, after2);
                },
                changed,
              },
              extra,
            ),
          );
        }
        function capture() {
          dragOverEvent('dragOverAnimationCapture');
          _this.captureAnimationState();
          if (_this !== fromSortable) {
            fromSortable.captureAnimationState();
          }
        }
        function completed(insertion) {
          dragOverEvent('dragOverCompleted', {
            insertion,
          });
          if (insertion) {
            if (isOwner) {
              activeSortable._hideClone();
            } else {
              activeSortable._showClone(_this);
            }
            if (_this !== fromSortable) {
              toggleClass(
                dragEl,
                putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass,
                false,
              );
              toggleClass(dragEl, options.ghostClass, true);
            }
            if (putSortable !== _this && _this !== Sortable.active) {
              putSortable = _this;
            } else if (_this === Sortable.active && putSortable) {
              putSortable = null;
            }
            if (fromSortable === _this) {
              _this._ignoreWhileAnimating = target;
            }
            _this.animateAll(function () {
              dragOverEvent('dragOverAnimationComplete');
              _this._ignoreWhileAnimating = null;
            });
            if (_this !== fromSortable) {
              fromSortable.animateAll();
              fromSortable._ignoreWhileAnimating = null;
            }
          }
          if ((target === dragEl && !dragEl.animated) || (target === el && !target.animated)) {
            lastTarget = null;
          }
          if (!options.dragoverBubble && !evt.rootEl && target !== document) {
            dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
            !insertion && nearestEmptyInsertDetectEvent(evt);
          }
          !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
          return (completedFired = true);
        }
        function changed() {
          newIndex = index(dragEl);
          newDraggableIndex = index(dragEl, options.draggable);
          _dispatchEvent({
            sortable: _this,
            name: 'change',
            toEl: el,
            newIndex,
            newDraggableIndex,
            originalEvent: evt,
          });
        }
        if (evt.preventDefault !== void 0) {
          evt.cancelable && evt.preventDefault();
        }
        target = closest(target, options.draggable, el, true);
        dragOverEvent('dragOver');
        if (Sortable.eventCanceled) return completedFired;
        if (
          dragEl.contains(evt.target) ||
          (target.animated && target.animatingX && target.animatingY) ||
          _this._ignoreWhileAnimating === target
        ) {
          return completed(false);
        }
        ignoreNextClick = false;
        if (
          activeSortable &&
          !options.disabled &&
          (isOwner
            ? canSort || (revert = parentEl !== rootEl)
            : putSortable === this ||
              ((this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) &&
                group.checkPut(this, activeSortable, dragEl, evt)))
        ) {
          vertical = this._getDirection(evt, target) === 'vertical';
          dragRect = getRect(dragEl);
          dragOverEvent('dragOverValid');
          if (Sortable.eventCanceled) return completedFired;
          if (revert) {
            parentEl = rootEl;
            capture();
            this._hideClone();
            dragOverEvent('revert');
            if (!Sortable.eventCanceled) {
              if (nextEl) {
                rootEl.insertBefore(dragEl, nextEl);
              } else {
                rootEl.appendChild(dragEl);
              }
            }
            return completed(true);
          }
          var elLastChild = lastChild(el, options.draggable);
          if (!elLastChild || (_ghostIsLast(evt, vertical, this) && !elLastChild.animated)) {
            if (elLastChild === dragEl) {
              return completed(false);
            }
            if (elLastChild && el === evt.target) {
              target = elLastChild;
            }
            if (target) {
              targetRect = getRect(target);
            }
            if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
              capture();
              if (elLastChild && elLastChild.nextSibling) {
                el.insertBefore(dragEl, elLastChild.nextSibling);
              } else {
                el.appendChild(dragEl);
              }
              parentEl = el;
              changed();
              return completed(true);
            }
          } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
            var firstChild = getChild(el, 0, options, true);
            if (firstChild === dragEl) {
              return completed(false);
            }
            target = firstChild;
            targetRect = getRect(target);
            if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
              capture();
              el.insertBefore(dragEl, firstChild);
              parentEl = el;
              changed();
              return completed(true);
            }
          } else if (target.parentNode === el) {
            targetRect = getRect(target);
            var direction = 0,
              targetBeforeFirstSwap,
              differentLevel = dragEl.parentNode !== el,
              differentRowCol = !_dragElInRowColumn(
                (dragEl.animated && dragEl.toRect) || dragRect,
                (target.animated && target.toRect) || targetRect,
                vertical,
              ),
              side1 = vertical ? 'top' : 'left',
              scrolledPastTop = isScrolledPast(target, 'top', 'top') || isScrolledPast(dragEl, 'top', 'top'),
              scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
            if (lastTarget !== target) {
              targetBeforeFirstSwap = targetRect[side1];
              pastFirstInvertThresh = false;
              isCircumstantialInvert = (!differentRowCol && options.invertSwap) || differentLevel;
            }
            direction = _getSwapDirection(
              evt,
              target,
              targetRect,
              vertical,
              differentRowCol ? 1 : options.swapThreshold,
              options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold,
              isCircumstantialInvert,
              lastTarget === target,
            );
            var sibling;
            if (direction !== 0) {
              var dragIndex = index(dragEl);
              do {
                dragIndex -= direction;
                sibling = parentEl.children[dragIndex];
              } while (sibling && (css(sibling, 'display') === 'none' || sibling === ghostEl));
            }
            if (direction === 0 || sibling === target) {
              return completed(false);
            }
            lastTarget = target;
            lastDirection = direction;
            var nextSibling = target.nextElementSibling,
              after = false;
            after = direction === 1;
            var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
            if (moveVector !== false) {
              if (moveVector === 1 || moveVector === -1) {
                after = moveVector === 1;
              }
              _silent = true;
              setTimeout(_unsilent, 30);
              capture();
              if (after && !nextSibling) {
                el.appendChild(dragEl);
              } else {
                target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
              }
              if (scrolledPastTop) {
                scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
              }
              parentEl = dragEl.parentNode;
              if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
                targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
              }
              changed();
              return completed(true);
            }
          }
          if (el.contains(dragEl)) {
            return completed(false);
          }
        }
        return false;
      },
      _ignoreWhileAnimating: null,
      _offMoveEvents: function _offMoveEvents() {
        off(document, 'mousemove', this._onTouchMove);
        off(document, 'touchmove', this._onTouchMove);
        off(document, 'pointermove', this._onTouchMove);
        off(document, 'dragover', nearestEmptyInsertDetectEvent);
        off(document, 'mousemove', nearestEmptyInsertDetectEvent);
        off(document, 'touchmove', nearestEmptyInsertDetectEvent);
      },
      _offUpEvents: function _offUpEvents() {
        var ownerDocument = this.el.ownerDocument;
        off(ownerDocument, 'mouseup', this._onDrop);
        off(ownerDocument, 'touchend', this._onDrop);
        off(ownerDocument, 'pointerup', this._onDrop);
        off(ownerDocument, 'touchcancel', this._onDrop);
        off(document, 'selectstart', this);
      },
      _onDrop: function _onDrop(evt) {
        var el = this.el,
          options = this.options;
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
        pluginEvent2('drop', this, {
          evt,
        });
        parentEl = dragEl && dragEl.parentNode;
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
        if (Sortable.eventCanceled) {
          this._nulling();
          return;
        }
        awaitingDragStarted = false;
        isCircumstantialInvert = false;
        pastFirstInvertThresh = false;
        clearInterval(this._loopId);
        clearTimeout(this._dragStartTimer);
        _cancelNextTick(this.cloneId);
        _cancelNextTick(this._dragStartId);
        if (this.nativeDraggable) {
          off(document, 'drop', this);
          off(el, 'dragstart', this._onDragStart);
        }
        this._offMoveEvents();
        this._offUpEvents();
        if (Safari) {
          css(document.body, 'user-select', '');
        }
        css(dragEl, 'transform', '');
        if (evt) {
          if (moved) {
            evt.cancelable && evt.preventDefault();
            !options.dropBubble && evt.stopPropagation();
          }
          ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
          if (rootEl === parentEl || (putSortable && putSortable.lastPutMode !== 'clone')) {
            cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
          }
          if (dragEl) {
            if (this.nativeDraggable) {
              off(dragEl, 'dragend', this);
            }
            _disableDraggable(dragEl);
            dragEl.style['will-change'] = '';
            if (moved && !awaitingDragStarted) {
              toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
            }
            toggleClass(dragEl, this.options.chosenClass, false);
            _dispatchEvent({
              sortable: this,
              name: 'unchoose',
              toEl: parentEl,
              newIndex: null,
              newDraggableIndex: null,
              originalEvent: evt,
            });
            if (rootEl !== parentEl) {
              if (newIndex >= 0) {
                _dispatchEvent({
                  rootEl: parentEl,
                  name: 'add',
                  toEl: parentEl,
                  fromEl: rootEl,
                  originalEvent: evt,
                });
                _dispatchEvent({
                  sortable: this,
                  name: 'remove',
                  toEl: parentEl,
                  originalEvent: evt,
                });
                _dispatchEvent({
                  rootEl: parentEl,
                  name: 'sort',
                  toEl: parentEl,
                  fromEl: rootEl,
                  originalEvent: evt,
                });
                _dispatchEvent({
                  sortable: this,
                  name: 'sort',
                  toEl: parentEl,
                  originalEvent: evt,
                });
              }
              putSortable && putSortable.save();
            } else {
              if (newIndex !== oldIndex) {
                if (newIndex >= 0) {
                  _dispatchEvent({
                    sortable: this,
                    name: 'update',
                    toEl: parentEl,
                    originalEvent: evt,
                  });
                  _dispatchEvent({
                    sortable: this,
                    name: 'sort',
                    toEl: parentEl,
                    originalEvent: evt,
                  });
                }
              }
            }
            if (Sortable.active) {
              if (newIndex == null || newIndex === -1) {
                newIndex = oldIndex;
                newDraggableIndex = oldDraggableIndex;
              }
              _dispatchEvent({
                sortable: this,
                name: 'end',
                toEl: parentEl,
                originalEvent: evt,
              });
              this.save();
            }
          }
        }
        this._nulling();
      },
      _nulling: function _nulling() {
        pluginEvent2('nulling', this);
        rootEl =
          dragEl =
          parentEl =
          ghostEl =
          nextEl =
          cloneEl =
          lastDownEl =
          cloneHidden =
          tapEvt =
          touchEvt =
          moved =
          newIndex =
          newDraggableIndex =
          oldIndex =
          oldDraggableIndex =
          lastTarget =
          lastDirection =
          putSortable =
          activeGroup =
          Sortable.dragged =
          Sortable.ghost =
          Sortable.clone =
          Sortable.active =
            null;
        savedInputChecked.forEach(function (el) {
          el.checked = true;
        });
        savedInputChecked.length = lastDx = lastDy = 0;
      },
      handleEvent: function handleEvent(evt) {
        switch (evt.type) {
          case 'drop':
          case 'dragend':
            this._onDrop(evt);
            break;
          case 'dragenter':
          case 'dragover':
            if (dragEl) {
              this._onDragOver(evt);
              _globalDragOver(evt);
            }
            break;
          case 'selectstart':
            evt.preventDefault();
            break;
        }
      },
      /**
       * Serializes the item into an array of string.
       * @returns {String[]}
       */
      toArray: function toArray() {
        var order2 = [],
          el,
          children = this.el.children,
          i = 0,
          n = children.length,
          options = this.options;
        for (; i < n; i++) {
          el = children[i];
          if (closest(el, options.draggable, this.el, false)) {
            order2.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
          }
        }
        return order2;
      },
      /**
       * Sorts the elements according to the array.
       * @param  {String[]}  order  order of the items
       */
      sort: function sort(order2, useAnimation) {
        var items = {},
          rootEl2 = this.el;
        this.toArray().forEach(function (id, i) {
          var el = rootEl2.children[i];
          if (closest(el, this.options.draggable, rootEl2, false)) {
            items[id] = el;
          }
        }, this);
        useAnimation && this.captureAnimationState();
        order2.forEach(function (id) {
          if (items[id]) {
            rootEl2.removeChild(items[id]);
            rootEl2.appendChild(items[id]);
          }
        });
        useAnimation && this.animateAll();
      },
      /**
       * Save the current sorting
       */
      save: function save() {
        var store2 = this.options.store;
        store2 && store2.set && store2.set(this);
      },
      /**
       * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
       * @param   {HTMLElement}  el
       * @param   {String}       [selector]  default: `options.draggable`
       * @returns {HTMLElement|null}
       */
      closest: function closest$1(el, selector) {
        return closest(el, selector || this.options.draggable, this.el, false);
      },
      /**
       * Set/get option
       * @param   {string} name
       * @param   {*}      [value]
       * @returns {*}
       */
      option: function option(name, value) {
        var options = this.options;
        if (value === void 0) {
          return options[name];
        } else {
          var modifiedValue = PluginManager.modifyOption(this, name, value);
          if (typeof modifiedValue !== 'undefined') {
            options[name] = modifiedValue;
          } else {
            options[name] = value;
          }
          if (name === 'group') {
            _prepareGroup(options);
          }
        }
      },
      /**
       * Destroy
       */
      destroy: function destroy() {
        pluginEvent2('destroy', this);
        var el = this.el;
        el[expando] = null;
        off(el, 'mousedown', this._onTapStart);
        off(el, 'touchstart', this._onTapStart);
        off(el, 'pointerdown', this._onTapStart);
        if (this.nativeDraggable) {
          off(el, 'dragover', this);
          off(el, 'dragenter', this);
        }
        Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el2) {
          el2.removeAttribute('draggable');
        });
        this._onDrop();
        this._disableDelayedDragEvents();
        sortables.splice(sortables.indexOf(this.el), 1);
        this.el = el = null;
      },
      _hideClone: function _hideClone() {
        if (!cloneHidden) {
          pluginEvent2('hideClone', this);
          if (Sortable.eventCanceled) return;
          css(cloneEl, 'display', 'none');
          if (this.options.removeCloneOnHide && cloneEl.parentNode) {
            cloneEl.parentNode.removeChild(cloneEl);
          }
          cloneHidden = true;
        }
      },
      _showClone: function _showClone(putSortable2) {
        if (putSortable2.lastPutMode !== 'clone') {
          this._hideClone();
          return;
        }
        if (cloneHidden) {
          pluginEvent2('showClone', this);
          if (Sortable.eventCanceled) return;
          if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
            rootEl.insertBefore(cloneEl, dragEl);
          } else if (nextEl) {
            rootEl.insertBefore(cloneEl, nextEl);
          } else {
            rootEl.appendChild(cloneEl);
          }
          if (this.options.group.revertClone) {
            this.animate(dragEl, cloneEl);
          }
          css(cloneEl, 'display', '');
          cloneHidden = false;
        }
      },
    };
  function _globalDragOver(evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = 'move';
    }
    evt.cancelable && evt.preventDefault();
  }
  function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
    var evt,
      sortable = fromEl[expando],
      onMoveFn = sortable.options.onMove,
      retVal;
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent('move', {
        bubbles: true,
        cancelable: true,
      });
    } else {
      evt = document.createEvent('Event');
      evt.initEvent('move', true, true);
    }
    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl2;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvent;
    fromEl.dispatchEvent(evt);
    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvent);
    }
    return retVal;
  }
  function _disableDraggable(el) {
    el.draggable = false;
  }
  function _unsilent() {
    _silent = false;
  }
  function _ghostIsFirst(evt, vertical, sortable) {
    var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical
      ? evt.clientX < childContainingRect.left - spacer ||
          (evt.clientY < firstElRect.top && evt.clientX < firstElRect.right)
      : evt.clientY < childContainingRect.top - spacer ||
          (evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left);
  }
  function _ghostIsLast(evt, vertical, sortable) {
    var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical
      ? evt.clientX > childContainingRect.right + spacer ||
          (evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left)
      : evt.clientY > childContainingRect.bottom + spacer ||
          (evt.clientX > lastElRect.right && evt.clientY > lastElRect.top);
  }
  function _getSwapDirection(
    evt,
    target,
    targetRect,
    vertical,
    swapThreshold,
    invertedSwapThreshold,
    invertSwap,
    isLastTarget,
  ) {
    var mouseOnAxis = vertical ? evt.clientY : evt.clientX,
      targetLength = vertical ? targetRect.height : targetRect.width,
      targetS1 = vertical ? targetRect.top : targetRect.left,
      targetS2 = vertical ? targetRect.bottom : targetRect.right,
      invert = false;
    if (!invertSwap) {
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        if (
          !pastFirstInvertThresh &&
          (lastDirection === 1
            ? mouseOnAxis > targetS1 + (targetLength * invertedSwapThreshold) / 2
            : mouseOnAxis < targetS2 - (targetLength * invertedSwapThreshold) / 2)
        ) {
          pastFirstInvertThresh = true;
        }
        if (!pastFirstInvertThresh) {
          if (
            lastDirection === 1
              ? mouseOnAxis < targetS1 + targetMoveDistance
              : mouseOnAxis > targetS2 - targetMoveDistance
          ) {
            return -lastDirection;
          }
        } else {
          invert = true;
        }
      } else {
        if (
          mouseOnAxis > targetS1 + (targetLength * (1 - swapThreshold)) / 2 &&
          mouseOnAxis < targetS2 - (targetLength * (1 - swapThreshold)) / 2
        ) {
          return _getInsertDirection(target);
        }
      }
    }
    invert = invert || invertSwap;
    if (invert) {
      if (
        mouseOnAxis < targetS1 + (targetLength * invertedSwapThreshold) / 2 ||
        mouseOnAxis > targetS2 - (targetLength * invertedSwapThreshold) / 2
      ) {
        return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
      }
    }
    return 0;
  }
  function _getInsertDirection(target) {
    if (index(dragEl) < index(target)) {
      return 1;
    } else {
      return -1;
    }
  }
  function _generateId(el) {
    var str = el.tagName + el.className + el.src + el.href + el.textContent,
      i = str.length,
      sum = 0;
    while (i--) {
      sum += str.charCodeAt(i);
    }
    return sum.toString(36);
  }
  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName('input');
    var idx = inputs.length;
    while (idx--) {
      var el = inputs[idx];
      el.checked && savedInputChecked.push(el);
    }
  }
  function _nextTick(fn2) {
    return setTimeout(fn2, 0);
  }
  function _cancelNextTick(id) {
    return clearTimeout(id);
  }
  if (documentExists) {
    on2(document, 'touchmove', function (evt) {
      if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
        evt.preventDefault();
      }
    });
  }
  Sortable.utils = {
    on: on2,
    off,
    css,
    find,
    is: function is(el, selector) {
      return !!closest(el, selector, el, false);
    },
    extend,
    throttle: throttle2,
    closest,
    toggleClass,
    clone: clone2,
    index,
    nextTick: _nextTick,
    cancelNextTick: _cancelNextTick,
    detectDirection: _detectDirection,
    getChild,
  };
  Sortable.get = function (element) {
    return element[expando];
  };
  Sortable.mount = function () {
    for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins2[_key] = arguments[_key];
    }
    if (plugins2[0].constructor === Array) plugins2 = plugins2[0];
    plugins2.forEach(function (plugin2) {
      if (!plugin2.prototype || !plugin2.prototype.constructor) {
        throw 'Sortable: Mounted plugin must be a constructor function, not '.concat({}.toString.call(plugin2));
      }
      if (plugin2.utils) Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin2.utils);
      PluginManager.mount(plugin2);
    });
  };
  Sortable.create = function (el, options) {
    return new Sortable(el, options);
  };
  Sortable.version = version;
  var autoScrolls = [];
  var scrollEl;
  var scrollRootEl;
  var scrolling = false;
  var lastAutoScrollX;
  var lastAutoScrollY;
  var touchEvt$1;
  var pointerElemChangedInterval;
  function AutoScrollPlugin() {
    function AutoScroll() {
      this.defaults = {
        scroll: true,
        forceAutoScrollFallback: false,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        bubbleScroll: true,
      };
      for (var fn2 in this) {
        if (fn2.charAt(0) === '_' && typeof this[fn2] === 'function') {
          this[fn2] = this[fn2].bind(this);
        }
      }
    }
    AutoScroll.prototype = {
      dragStarted: function dragStarted(_ref) {
        var originalEvent = _ref.originalEvent;
        if (this.sortable.nativeDraggable) {
          on2(document, 'dragover', this._handleAutoScroll);
        } else {
          if (this.options.supportPointer) {
            on2(document, 'pointermove', this._handleFallbackAutoScroll);
          } else if (originalEvent.touches) {
            on2(document, 'touchmove', this._handleFallbackAutoScroll);
          } else {
            on2(document, 'mousemove', this._handleFallbackAutoScroll);
          }
        }
      },
      dragOverCompleted: function dragOverCompleted(_ref2) {
        var originalEvent = _ref2.originalEvent;
        if (!this.options.dragOverBubble && !originalEvent.rootEl) {
          this._handleAutoScroll(originalEvent);
        }
      },
      drop: function drop3() {
        if (this.sortable.nativeDraggable) {
          off(document, 'dragover', this._handleAutoScroll);
        } else {
          off(document, 'pointermove', this._handleFallbackAutoScroll);
          off(document, 'touchmove', this._handleFallbackAutoScroll);
          off(document, 'mousemove', this._handleFallbackAutoScroll);
        }
        clearPointerElemChangedInterval();
        clearAutoScrolls();
        cancelThrottle();
      },
      nulling: function nulling() {
        touchEvt$1 =
          scrollRootEl =
          scrollEl =
          scrolling =
          pointerElemChangedInterval =
          lastAutoScrollX =
          lastAutoScrollY =
            null;
        autoScrolls.length = 0;
      },
      _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
        this._handleAutoScroll(evt, true);
      },
      _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
        var _this = this;
        var x = (evt.touches ? evt.touches[0] : evt).clientX,
          y = (evt.touches ? evt.touches[0] : evt).clientY,
          elem = document.elementFromPoint(x, y);
        touchEvt$1 = evt;
        if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
          autoScroll(evt, this.options, elem, fallback);
          var ogElemScroller = getParentAutoScrollElement(elem, true);
          if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
            pointerElemChangedInterval && clearPointerElemChangedInterval();
            pointerElemChangedInterval = setInterval(function () {
              var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
              if (newElem !== ogElemScroller) {
                ogElemScroller = newElem;
                clearAutoScrolls();
              }
              autoScroll(evt, _this.options, newElem, fallback);
            }, 10);
            lastAutoScrollX = x;
            lastAutoScrollY = y;
          }
        } else {
          if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
            clearAutoScrolls();
            return;
          }
          autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
        }
      },
    };
    return _extends(AutoScroll, {
      pluginName: 'scroll',
      initializeByDefault: true,
    });
  }
  function clearAutoScrolls() {
    autoScrolls.forEach(function (autoScroll2) {
      clearInterval(autoScroll2.pid);
    });
    autoScrolls = [];
  }
  function clearPointerElemChangedInterval() {
    clearInterval(pointerElemChangedInterval);
  }
  var autoScroll = throttle2(function (evt, options, rootEl2, isFallback) {
    if (!options.scroll) return;
    var x = (evt.touches ? evt.touches[0] : evt).clientX,
      y = (evt.touches ? evt.touches[0] : evt).clientY,
      sens = options.scrollSensitivity,
      speed = options.scrollSpeed,
      winScroller = getWindowScrollingElement();
    var scrollThisInstance = false,
      scrollCustomFn;
    if (scrollRootEl !== rootEl2) {
      scrollRootEl = rootEl2;
      clearAutoScrolls();
      scrollEl = options.scroll;
      scrollCustomFn = options.scrollFn;
      if (scrollEl === true) {
        scrollEl = getParentAutoScrollElement(rootEl2, true);
      }
    }
    var layersOut = 0;
    var currentParent = scrollEl;
    do {
      var el = currentParent,
        rect = getRect(el),
        top2 = rect.top,
        bottom2 = rect.bottom,
        left2 = rect.left,
        right2 = rect.right,
        width = rect.width,
        height = rect.height,
        canScrollX = void 0,
        canScrollY = void 0,
        scrollWidth = el.scrollWidth,
        scrollHeight = el.scrollHeight,
        elCSS = css(el),
        scrollPosX = el.scrollLeft,
        scrollPosY = el.scrollTop;
      if (el === winScroller) {
        canScrollX =
          width < scrollWidth &&
          (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll' || elCSS.overflowX === 'visible');
        canScrollY =
          height < scrollHeight &&
          (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll' || elCSS.overflowY === 'visible');
      } else {
        canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll');
        canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll');
      }
      var vx =
        canScrollX &&
        (Math.abs(right2 - x) <= sens && scrollPosX + width < scrollWidth) -
          (Math.abs(left2 - x) <= sens && !!scrollPosX);
      var vy =
        canScrollY &&
        (Math.abs(bottom2 - y) <= sens && scrollPosY + height < scrollHeight) -
          (Math.abs(top2 - y) <= sens && !!scrollPosY);
      if (!autoScrolls[layersOut]) {
        for (var i = 0; i <= layersOut; i++) {
          if (!autoScrolls[i]) {
            autoScrolls[i] = {};
          }
        }
      }
      if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
        autoScrolls[layersOut].el = el;
        autoScrolls[layersOut].vx = vx;
        autoScrolls[layersOut].vy = vy;
        clearInterval(autoScrolls[layersOut].pid);
        if (vx != 0 || vy != 0) {
          scrollThisInstance = true;
          autoScrolls[layersOut].pid = setInterval(
            function () {
              if (isFallback && this.layer === 0) {
                Sortable.active._onTouchMove(touchEvt$1);
              }
              var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
              var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
              if (typeof scrollCustomFn === 'function') {
                if (
                  scrollCustomFn.call(
                    Sortable.dragged.parentNode[expando],
                    scrollOffsetX,
                    scrollOffsetY,
                    evt,
                    touchEvt$1,
                    autoScrolls[this.layer].el,
                  ) !== 'continue'
                ) {
                  return;
                }
              }
              scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
            }.bind({
              layer: layersOut,
            }),
            24,
          );
        }
      }
      layersOut++;
    } while (
      options.bubbleScroll &&
      currentParent !== winScroller &&
      (currentParent = getParentAutoScrollElement(currentParent, false))
    );
    scrolling = scrollThisInstance;
  }, 30);
  var drop = function drop2(_ref) {
    var originalEvent = _ref.originalEvent,
      putSortable2 = _ref.putSortable,
      dragEl2 = _ref.dragEl,
      activeSortable = _ref.activeSortable,
      dispatchSortableEvent = _ref.dispatchSortableEvent,
      hideGhostForTarget = _ref.hideGhostForTarget,
      unhideGhostForTarget = _ref.unhideGhostForTarget;
    if (!originalEvent) return;
    var toSortable = putSortable2 || activeSortable;
    hideGhostForTarget();
    var touch =
      originalEvent.changedTouches && originalEvent.changedTouches.length
        ? originalEvent.changedTouches[0]
        : originalEvent;
    var target = document.elementFromPoint(touch.clientX, touch.clientY);
    unhideGhostForTarget();
    if (toSortable && !toSortable.el.contains(target)) {
      dispatchSortableEvent('spill');
      this.onSpill({
        dragEl: dragEl2,
        putSortable: putSortable2,
      });
    }
  };
  function Revert() {}
  Revert.prototype = {
    startIndex: null,
    dragStart: function dragStart(_ref2) {
      var oldDraggableIndex2 = _ref2.oldDraggableIndex;
      this.startIndex = oldDraggableIndex2;
    },
    onSpill: function onSpill(_ref3) {
      var dragEl2 = _ref3.dragEl,
        putSortable2 = _ref3.putSortable;
      this.sortable.captureAnimationState();
      if (putSortable2) {
        putSortable2.captureAnimationState();
      }
      var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
      if (nextSibling) {
        this.sortable.el.insertBefore(dragEl2, nextSibling);
      } else {
        this.sortable.el.appendChild(dragEl2);
      }
      this.sortable.animateAll();
      if (putSortable2) {
        putSortable2.animateAll();
      }
    },
    drop,
  };
  _extends(Revert, {
    pluginName: 'revertOnSpill',
  });
  function Remove() {}
  Remove.prototype = {
    onSpill: function onSpill2(_ref4) {
      var dragEl2 = _ref4.dragEl,
        putSortable2 = _ref4.putSortable;
      var parentSortable = putSortable2 || this.sortable;
      parentSortable.captureAnimationState();
      dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
      parentSortable.animateAll();
    },
    drop,
  };
  _extends(Remove, {
    pluginName: 'removeOnSpill',
  });
  Sortable.mount(new AutoScrollPlugin());
  Sortable.mount(Remove, Revert);
  var sortable_esm_default = Sortable;
  function src_default2(Alpine22) {
    Alpine22.directive(
      'sort',
      (
        el,
        { value, modifiers, expression },
        { effect: effect7, evaluate: evaluate2, evaluateLater: evaluateLater2, cleanup: cleanup2 },
      ) => {
        if (value === 'config') {
          return;
        }
        if (value === 'handle') {
          return;
        }
        if (value === 'group') {
          return;
        }
        if (value === 'key' || value === 'item') {
          if ([void 0, null, ''].includes(expression)) return;
          el._x_sort_key = evaluate2(expression);
          return;
        }
        let preferences = {
          hideGhost: !modifiers.includes('ghost'),
          useHandles: !!el.querySelector('[x-sort\\:handle]'),
          group: getGroupName(el, modifiers),
        };
        let handleSort = generateSortHandler(expression, evaluateLater2);
        let config = getConfigurationOverrides(el, modifiers, evaluate2);
        let sortable = initSortable(el, config, preferences, (key, position) => {
          handleSort(key, position);
        });
        cleanup2(() => sortable.destroy());
      },
    );
  }
  function generateSortHandler(expression, evaluateLater2) {
    if ([void 0, null, ''].includes(expression)) return () => {};
    let handle = evaluateLater2(expression);
    return (key, position) => {
      Alpine.dontAutoEvaluateFunctions(() => {
        handle(
          // If a function is returned, call it with the key/position params...
          (received) => {
            if (typeof received === 'function') received(key, position);
          },
          // Provide $key and $position to the scope in case they want to call their own function...
          {
            scope: {
              // Supporting both `$item` AND `$key` ($key for BC)...
              $key: key,
              $item: key,
              $position: position,
            },
          },
        );
      });
    };
  }
  function getConfigurationOverrides(el, modifiers, evaluate2) {
    return el.hasAttribute('x-sort:config') ? evaluate2(el.getAttribute('x-sort:config')) : {};
  }
  function initSortable(el, config, preferences, handle) {
    let ghostRef;
    let options = {
      animation: 150,
      handle: preferences.useHandles ? '[x-sort\\:handle]' : null,
      group: preferences.group,
      filter(e) {
        if (!el.querySelector('[x-sort\\:item]')) return false;
        let itemHasAttribute = e.target.closest('[x-sort\\:item]');
        return itemHasAttribute ? false : true;
      },
      onSort(e) {
        if (e.from !== e.to) {
          if (e.to !== e.target) {
            return;
          }
        }
        let key = e.item._x_sort_key;
        let position = e.newIndex;
        if (key !== void 0 || key !== null) {
          handle(key, position);
        }
      },
      onStart() {
        document.body.classList.add('sorting');
        ghostRef = document.querySelector('.sortable-ghost');
        if (preferences.hideGhost && ghostRef) ghostRef.style.opacity = '0';
      },
      onEnd() {
        document.body.classList.remove('sorting');
        if (preferences.hideGhost && ghostRef) ghostRef.style.opacity = '1';
        ghostRef = void 0;
        keepElementsWithinMorphMarkers(el);
      },
    };
    return new sortable_esm_default(el, { ...options, ...config });
  }
  function keepElementsWithinMorphMarkers(el) {
    let cursor = el.firstChild;
    while (cursor.nextSibling) {
      if (cursor.textContent.trim() === '[if ENDBLOCK]><![endif]') {
        el.append(cursor);
        break;
      }
      cursor = cursor.nextSibling;
    }
  }
  function getGroupName(el, modifiers) {
    if (el.hasAttribute('x-sort:group')) {
      return el.getAttribute('x-sort:group');
    }
    return modifiers.indexOf('group') !== -1 ? modifiers[modifiers.indexOf('group') + 1] : null;
  }
  var module_default2 = src_default2;

  // ns-hugo:C:\Users\RazvanNicu\source\repos\hugo_alpine\assets\js\modules\fieldComp.js
  function fieldComp() {
    return {
      density: 'default',
      preview: false,
      validateTool: false,
      devTool: false,
      advancedTool: false,
      showToc: false,
      showEditor: false,
      addStepVisible: false,
      addSectionVisible: false,
      currentFieldSelected: 0,
      currentStepActive: 0,
      currentEditorSelected: 'form',
      currentStepSelected: 0,
      currentSectionSelected: 0,
      currentFieldSelected: 0,
      form: {},
      // Will be initialized from localStorage
      steps: [],
      // Will be initialized from localStorage
      newStep: {
        title: '',
        label: '',
        id: '',
        readOnly: false,
        visible: true,
        status: 'pending',
        disabled: false,
        formIndex: 0,
        sections: [],
      },
      newSection: {
        title: '',
        label: '',
      },
      newField: {
        name: '',
        label: '',
        type: 'text',
        // Default field type
      },
      legacy: false,
      // Will be initialized from localStorage
      isAtStart: true,
      isAtEnd: false,
      searchQuery: '',
      searchResults: {
        fields: [],
      },
      debounceTimeout: null,
      // Initialize the component
      init() {
        const storedData = localStorage.getItem('formData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          this.form = parsedData.form || [];
          this.steps = parsedData.steps || [];
          this.density = parsedData.density || 'default';
          this.validateTool = parsedData.validateTool || false;
          this.showToc = parsedData.showToc || false;
          this.showEditor = parsedData.showEditor || false;
          this.devTool = parsedData.devTool || false;
          this.preview = parsedData.preview || false;
          this.advancedTool = parsedData.advancedTool || false;
          this.currentStepSelected = parsedData.currentStepSelected || 0;
          this.currentSectionSelected = parsedData.currentSectionSelected || 0;
          this.currentFieldSelected = parsedData.currentFieldSelected || 0;
          this.addStepVisible = parsedData.addStepVisible || 0;
          this.addSectionVisible = parsedData.addSectionVisible || 0;
          this.currentEditorSelected = parsedData.currentEditorSelected ?? 'form';
        } else {
          this.form = {
            name: 'KYC_Charity',
            id: '123',
            actionButtons: {
              startButtons: [
                {
                  label: 'Cancel',
                  id: 'cancel-button',
                  icon: 'fa-solid fa-play',
                  type: 'button',
                  ui: 'outline',
                },
              ],
              endButtons: [
                {
                  label: 'Save',
                  id: 'save-button',
                  icon: 'fa-solid fa-play',
                  type: 'button',
                  ui: 'solid',
                },
              ],
            },
            steps: [
              {
                title: 'details',
                label: 'Details',
                id: 'step-01',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
                sections: [
                  {
                    title: 'details-section 1',
                    label: 'Details Section 1',
                    fields: [
                      {
                        name: 'Contact Category',
                        id: 'field-01',
                        readOnly: true,
                        visible: true,
                        disabled: false,
                        type: 'text',
                        valid: false,
                        touched: true,
                        link: 'some stuff',
                        sync: true,
                        mandatory: false,
                        help: 'We will never share your email with anyone else.',
                        label: 'Contact Category',
                        value: 'valField01',
                        alert: {
                          type: 'danger',
                          message: 'Message of the alert is this',
                        },
                      },
                      {
                        name: 'Date of birth',
                        id: 'field-02',
                        readOnly: false,
                        visible: true,
                        disabled: false,
                        type: 'date',
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: true,
                        label: 'Date of birth',
                        value: 'valField02',
                      },
                      {
                        name: 'Suitability Review Lookup',
                        id: 'field-03',
                        readOnly: true,
                        visible: true,
                        disabled: false,
                        type: 'switch',
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: false,
                        label: 'Suitability Review Lookup',
                        value: 'valField03',
                      },
                      {
                        name: 'Password',
                        id: 'password-04',
                        readOnly: false,
                        visible: true,
                        disabled: false,
                        type: 'password',
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: false,
                        label: 'Password',
                        value: 'valField04',
                        alert: {
                          type: 'warning',
                          message: 'Message of the alert is this',
                        },
                      },
                      {
                        name: 'Are you a UK resident for tax purposes?',
                        id: 'field-05',
                        readOnly: true,
                        visible: true,
                        disabled: false,
                        type: 'selector',
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: true,
                        label: 'Are you a UK resident for tax purposes?',
                        value: 'valField04',
                        option: [
                          { value: 'val1', label: 'Option 1' },
                          { value: 'val2', label: 'Option 2' },
                          { value: 'val3', label: 'Option 3' },
                          { value: 'val4', label: 'Option 4' },
                        ],
                      },
                      {
                        name: 'Budget',
                        id: 'field-06',
                        readOnly: false,
                        visible: true,
                        disabled: false,
                        type: 'number',
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: false,
                        label: 'Budget',
                        value: 'valField04',
                      },
                      {
                        name: 'Are you resident in any other country for tax purposes?',
                        id: 'field-07',
                        readOnly: false,
                        visible: true,
                        disabled: false,
                        type: 'textarea',
                        rows: 6,
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: false,
                        label: 'Are you resident in any other country for tax purposes?',
                        help: 'Are you resident in any other country for tax purposes?',
                        value: 'valField04',
                        alert: {
                          type: 'danger',
                          message: 'Message of the alert is this',
                        },
                      },
                      {
                        name: 'Are you in good health 149?',
                        id: 'field-08',
                        readOnly: false,
                        visible: true,
                        disabled: false,
                        type: 'form',
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: false,
                        label: 'Are you in good health 149?',
                        help: 'Please provide your tax identification or reference numbers',
                        value: 'valField04',
                      },
                      {
                        name: 'Are you in good health? - (inline)',
                        id: 'field-09',
                        readOnly: false,
                        visible: true,
                        disabled: false,
                        type: 'checkbox',
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: false,
                        label: 'Are you in good health? - (inline)',
                        help: 'This is inline - Please provide your tax identification or reference numbers',
                        inline: true,
                        option: [
                          { checked: false, label: 'Option 1' },
                          { checked: false, label: 'Option 2' },
                          { checked: false, label: 'Option 3' },
                          { checked: false, label: 'Option 4' },
                        ],
                      },
                      {
                        name: 'Are you in good health ?',
                        id: 'field-09',
                        readOnly: false,
                        visible: true,
                        disabled: false,
                        type: 'checkbox',
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: false,
                        label: 'Are you in good health ?',
                        help: 'Please provide your tax identification or reference numbers',
                        inline: false,
                        option: [
                          { checked: false, label: 'Option 1' },
                          { checked: false, label: 'Option 2' },
                          { checked: false, label: 'Option 3' },
                          { checked: false, label: 'Option 4' },
                        ],
                      },
                      {
                        name: 'Are you a smoker?',
                        id: 'field-10',
                        readOnly: false,
                        visible: true,
                        disabled: false,
                        type: 'text',
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: false,
                        label: 'Are you a smoker?',
                        help: 'Please provide additional information if you have answered \u2018No\u2019 above:',
                        value: 'valField04',
                      },
                    ],
                  },
                ],
              },
              {
                title: 'financial objectives',
                label: 'Financial Objectives',
                id: 'step-02',
                readOnly: true,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
                sections: [
                  {
                    title: 'recent-financial-objective',
                    label: 'Recent Financial objective',
                    fields: [
                      {
                        name: 'Date of objective',
                        id: 'field-020',
                        readOnly: false,
                        visible: true,
                        disabled: false,
                        type: 'date',
                        valid: true,
                        touched: false,
                        link: '',
                        sync: false,
                        mandatory: true,
                        label: 'Date of objective',
                        value: 'valField020',
                      },
                    ],
                  },
                ],
              },
              {
                title: 'communication details',
                label: 'Communication Details',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'hidden dynamic fields',
                label: 'Hidden Dynamic Fields',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
              {
                title: 'client specific',
                label: 'Client Specific',
                id: 'step-03',
                readOnly: false,
                visible: true,
                status: 'completed',
                disabled: false,
                formIndex: 0,
              },
            ],
          };
          this.addStepVisible = false;
          this.addSectionVisible = false;
          this.currentStepSelected = 0;
          this.currentSectionSelected = 0;
          this.currentFieldSelected = 0;
          this.currentEditorSelected = 'form';
        }
        this.$watch('form', () => this.saveToLocalStorage());
        this.$watch('density', () => this.saveToLocalStorage());
        this.$watch('showToc', () => this.saveToLocalStorage());
        this.$watch('showEditor', () => this.saveToLocalStorage());
        this.$watch('preview', () => this.saveToLocalStorage());
        this.$watch('validateTool', () => this.saveToLocalStorage());
        this.$watch('devTool', () => this.saveToLocalStorage());
        this.$watch('advancedTool', () => this.saveToLocalStorage());
        this.$watch('currentEditorSelected', () => this.saveToLocalStorage());
        this.$watch('currentStepSelected', () => this.saveToLocalStorage());
        this.$watch('currentSectionSelected', () => this.saveToLocalStorage());
        this.$watch('currentFieldSelected', () => this.saveToLocalStorage());
        this.$watch('addStepVisible', () => this.saveToLocalStorage());
        this.$watch('addSectionVisible', () => this.saveToLocalStorage());
      },
      async loadStaticForm() {
        try {
          const response = await fetch('/field/kyc-charity.json');
          if (!response.ok) {
            throw new Error('Failed to load the form.');
          }
          const formData = await response.json();
          this.form = formData;
          this.saveToLocalStorage();
          alert('KYC Charity Form loaded successfully!');
        } catch (error2) {
          console.error('Error loading the form:', error2);
          alert('Failed to load the form. Please try again.');
        }
      },
      navigateToField(stepIndex, sectionIndex, fieldIndex) {
        this.currentStepSelected = stepIndex;
        this.currentSectionSelected = sectionIndex;
        this.currentFieldSelected = fieldIndex;
        this.$nextTick(() => {
          const mainArea = document.querySelector('#mainArea');
          const fieldElement = mainArea?.querySelector(
            `[data-step-index="${stepIndex}"][data-section-index="${sectionIndex}"][data-field-index="${fieldIndex}"]`,
          );
          if (fieldElement) {
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            console.warn('Field element not found');
          }
        });
      },
      debounceSearch() {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
          this.performSearch();
        }, 300);
      },
      // Method to add a new step
      performSearch() {
        const query = this.searchQuery.toLowerCase().trim();
        this.searchResults = { fields: [] };
        if (!query) {
          return;
        }
        if (!this.form.steps || !Array.isArray(this.form.steps)) {
          console.warn('form.steps is undefined or not an array');
          return;
        }
        this.form.steps.forEach((step, stepIndex) => {
          if (!step.sections || !Array.isArray(step.sections)) {
            console.warn(`step.sections is undefined or not an array for stepIndex: ${stepIndex}`);
            return;
          }
          step.sections.forEach((section, sectionIndex) => {
            if (!section.fields || !Array.isArray(section.fields)) {
              console.warn(`section.fields is undefined or not an array for sectionIndex: ${sectionIndex}`);
              return;
            }
            section.fields.forEach((field, fieldIndex) => {
              for (const key in field) {
                if (
                  // check all key for fields
                  // typeof field[key] === 'string' && field[key].toLowerCase().includes(query)
                  (key === 'name' || key === 'label') &&
                  typeof field[key] === 'string' &&
                  field[key].toLowerCase().includes(query)
                ) {
                  this.searchResults.fields.push({
                    stepIndex,
                    sectionIndex,
                    fieldIndex,
                    fieldName: field.name,
                    fieldKey: key,
                    fieldValue: field[key],
                  });
                  break;
                }
              }
            });
          });
        });
      },
      // Save data to localStorage
      saveToLocalStorage() {
        const dataToStore = {
          form: this.form,
          steps: this.steps,
          showToc: this.showToc,
          showEditor: this.showEditor,
          density: this.density,
          validateTool: this.validateTool,
          devTool: this.devTool,
          advancedTool: this.advancedTool,
          preview: this.preview,
          currentEditorSelected: this.currentEditorSelected,
          currentStepSelected: this.currentStepSelected,
          currentSectionSelected: this.currentSectionSelected,
          currentFieldSelected: this.currentFieldSelected,
          addStepVisible: this.addStepVisible,
        };
        localStorage.setItem('formData', JSON.stringify(dataToStore));
      },
      // Method to set the current selected index
      selectEditor(editor) {
        if (this.currentEditorSelected === editor) {
          console.log('Editor selected:', this.currentEditorSelected);
          console.log('Editor already selected:', editor);
          this.currentEditorSelected = null;
        } else {
          this.currentEditorSelected = editor;
        }
      },
      selectField(index2) {
        this.currentFieldSelected = index2;
      },
      select(stepIndex, sectionIndex, fieldIndex) {
        if (stepIndex !== this.currentStepSelected) {
          this.currentStepSelected = stepIndex;
        } else {
        }
        if (sectionIndex !== this.currentSectionSelected) {
          this.currentSectionSelected = sectionIndex;
        } else {
        }
        if (fieldIndex !== this.currentFieldSelected) {
          this.currentFieldSelected = fieldIndex;
        } else {
        }
      },
      toggleAddSectionVisible() {
        this.addSectionVisible = !this.addSectionVisible;
      },
      toggleAddStepVisible() {
        this.addStepVisible = !this.addStepVisible;
      },
      toggleToc() {
        this.showToc = !this.showToc;
      },
      toggleEditor() {
        this.showEditor = !this.showEditor;
      },
      togglePreview() {
        this.preview = !this.preview;
      },
      toggleValidate() {
        this.validateTool = !this.validateTool;
      },
      toggleAdvanced() {
        this.advancedTool = !this.advancedTool;
      },
      toggleDevTool() {
        this.devTool = !this.devTool;
      },
      scrollSteps(direction) {
        const container = document.getElementById('scrollable-steps');
        const scrollAmount = container.offsetWidth;
        if (direction === 'next') {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else if (direction === 'prev') {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
        this.checkScrollPosition();
      },
      checkScrollPosition() {
        const container = document.getElementById('scrollable-steps');
        this.isAtStart = container.scrollLeft === 0;
        this.isAtEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth;
      },
      selectAndScroll(stepIndex) {
        this.select(stepIndex, 0, 0);
        this.selectStep(stepIndex);
      },
      // Method to add a new section
      addSection() {
        if (!this.newSection.title || !this.newSection.label) {
          alert('Please fill out all fields.');
          return;
        }
        const currentStep = this.form.steps[this.currentStepSelected];
        if (!currentStep) {
          alert('No step is selected or the step does not exist.');
          return;
        }
        if (!currentStep.sections) {
          currentStep.sections = [];
        }
        currentStep.sections.push({
          ...this.newSection,
          fields: [],
          // Initialize with an empty fields array
        });
        this.newSection = {
          title: '',
          label: '',
        };
        this.saveToLocalStorage();
        alert('Section added successfully!');
      },
      addStep() {
        if (!this.newStep.title || !this.newStep.label || !this.newStep.id) {
          alert('Please fill out all fields.');
          return;
        }
        this.form.steps.push({ ...this.newStep });
        this.newStep = {
          title: '',
          label: '',
          id: '',
          readOnly: false,
          visible: true,
          status: 'pending',
          disabled: false,
          formIndex: 0,
          sections: [],
        };
        this.saveToLocalStorage();
        this.selectStep(this.form.steps.length - 1);
        alert('Step added successfully!');
      },
      trashStep(stepIndex) {
        if (confirm('Are you sure you want to delete this step?')) {
          let prevStepIndex = stepIndex - 1;
          this.form.steps.splice(stepIndex, 1);
          if (this.currentStepSelected === stepIndex) {
            this.currentStepSelected = null;
            this.currentSectionSelected = null;
            this.currentFieldSelected = null;
          }
          if (prevStepIndex < 0) {
            this.selectStep(0);
          } else {
            this.selectStep(prevStepIndex);
          }
        }
      },
      addField() {
        if (!this.newField.name || !this.newField.label) {
          alert('Please fill out all fields.');
          return;
        }
        const currentSection = this.form.steps?.[this.currentStepSelected]?.sections?.[this.currentSectionSelected];
        if (!currentSection) {
          alert('No section is selected or the section does not exist.');
          return;
        }
        if (!currentSection.fields) {
          currentSection.fields = [];
        }
        const fieldId = `${this.newField.name.toLowerCase().replace(/\s+/g, '-')}-step${this.currentStepSelected}-section${this.currentSectionSelected}-field${currentSection.fields.length}`;
        currentSection.fields.push({
          ...this.newField,
          id: fieldId,
          // Automatically generated ID
          value: '',
          // Default value
          mandatory: false,
          readOnly: false,
          help: '',
          option: [],
          // For selector or checkbox types
        });
        this.newField = {
          name: '',
          label: '',
          type: 'text',
        };
        this.saveToLocalStorage();
        alert('Field added successfully!');
      },
      editField(fieldIndex) {
        this.currentFieldSelected = fieldIndex;
        this.currentEditorSelected = 'field';
      },
      deleteField(fieldIndex) {
        if (confirm('Are you sure you want to delete this field?')) {
          this.form.steps[this.currentStepSelected].sections[this.currentSectionSelected].fields.splice(fieldIndex, 1);
          this.saveToLocalStorage();
        }
      },
      selectStep(stepIndex) {
        this.currentStepSelected = stepIndex;
        const container = document.getElementById('scrollable-steps');
        const stepElement = container.children[stepIndex];
        if (stepElement) {
          const containerLeft = container.scrollLeft;
          const containerRight = container.scrollLeft + container.offsetWidth;
          const stepLeft = stepElement.offsetLeft;
          const stepRight = stepElement.offsetLeft + stepElement.offsetWidth;
          if (stepLeft < containerLeft) {
            container.scrollTo({ left: stepLeft, behavior: 'smooth' });
          } else if (stepRight > containerRight) {
            container.scrollTo({ left: container.scrollLeft + (stepRight - containerRight), behavior: 'smooth' });
          }
        }
        this.checkScrollPosition();
      },
      // Method to download the form as a JSON file
      downloadForm() {
        const dataStr = JSON.stringify(this.form, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'form.json';
        a.click();
        URL.revokeObjectURL(url);
      },
      // Method to load a JSON file and update the form
      loadForm(event) {
        const file = event.target.files[0];
        if (!file) {
          alert('No file selected.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            this.form = jsonData;
            this.saveToLocalStorage();
            alert('Form loaded successfully!');
          } catch (error2) {
            alert('Invalid JSON file.');
            console.error('Error loading form:', error2);
          }
        };
        reader.readAsText(file);
      },
      getClass(field, stepIndex, sectionIndex, fieldIndex) {
        const isSelected =
          this.currentStepSelected === stepIndex &&
          this.currentSectionSelected === sectionIndex &&
          this.currentFieldSelected === fieldIndex;
        const classes = {
          'field-selected': isSelected,
          // Add a class if the field is selected
          'field-readonly': field.readOnly,
          // Add a class if the field is read-only
          'field-mandatory': field.mandatory,
          // Add a class if the field is mandatory
        };
        if (this.density === 'compact') {
          if (field.readOnly) {
            Object.assign(classes, {
              border: true,
              'border-dark': true,
              'border-2': true,
              'border-doted': true,
              'text-body-tertiary': true,
            });
            if (isSelected) {
              Object.assign(classes, {
                'shadow-sm': true,
                'ring-3': true,
                'ring-solid': true,
                'ring-offset-2': true,
                'ring-selected': true,
              });
            }
          } else {
            Object.assign(classes, {
              'shadow-sm': true,
              border: true,
              'border-1': true,
              'border-transparent': true,
            });
            if (isSelected) {
              Object.assign(classes, {
                'ring-3': true,
                'ring-solid': true,
                'ring-offset-2': true,
                'ring-selected': true,
              });
            }
          }
        } else {
          if (field.readOnly) {
            Object.assign(classes, {
              'xopacity-75': true,
              'border-doted': true,
              border: true,
              'border-dark': true,
              'border-2': true,
              'text-body-tertiary': true,
            });
            if (isSelected) {
              Object.assign(classes, {
                'ring-3': true,
                'ring-solid': true,
                'ring-offset-2': true,
                'ring-selected': true,
              });
            }
          } else {
            Object.assign(classes, {
              border: true,
              'border-2': true,
            });
            if (isSelected) {
              Object.assign(classes, {
                'ring-3': true,
                'ring-solid': true,
                'ring-offset-2': true,
                'ring-selected': true,
              });
            }
          }
        }
        return classes;
      },
    };
  }

  // node_modules/@popperjs/core/lib/enums.js
  var top = 'top';
  var bottom = 'bottom';
  var right = 'right';
  var left = 'left';
  var auto = 'auto';
  var basePlacements = [top, bottom, right, left];
  var start2 = 'start';
  var end = 'end';
  var clippingParents = 'clippingParents';
  var viewport = 'viewport';
  var popper = 'popper';
  var reference = 'reference';
  var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function (acc, placement) {
    return acc.concat([placement + '-' + start2, placement + '-' + end]);
  }, []);
  var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function (acc, placement) {
    return acc.concat([placement, placement + '-' + start2, placement + '-' + end]);
  }, []);
  var beforeRead = 'beforeRead';
  var read = 'read';
  var afterRead = 'afterRead';
  var beforeMain = 'beforeMain';
  var main = 'main';
  var afterMain = 'afterMain';
  var beforeWrite = 'beforeWrite';
  var write = 'write';
  var afterWrite = 'afterWrite';
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

  // node_modules/@popperjs/core/lib/dom-utils/getNodeName.js
  function getNodeName(element) {
    return element ? (element.nodeName || '').toLowerCase() : null;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getWindow.js
  function getWindow(node) {
    if (node == null) {
      return window;
    }
    if (node.toString() !== '[object Window]') {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }
    return node;
  }

  // node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
  function isElement(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }
  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }
  function isShadowRoot(node) {
    if (typeof ShadowRoot === 'undefined') {
      return false;
    }
    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }

  // node_modules/@popperjs/core/lib/modifiers/applyStyles.js
  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function (name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name];
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (name2) {
        var value = attributes[name2];
        if (value === false) {
          element.removeAttribute(name2);
        } else {
          element.setAttribute(name2, value === true ? '' : value);
        }
      });
    });
  }
  function effect3(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: '0',
        top: '0',
        margin: '0',
      },
      arrow: {
        position: 'absolute',
      },
      reference: {},
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;
    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }
    return function () {
      Object.keys(state.elements).forEach(function (name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
        var style = styleProperties.reduce(function (style2, property) {
          style2[property] = '';
          return style2;
        }, {});
        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }
        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function (attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  }
  var applyStyles_default = {
    name: 'applyStyles',
    enabled: true,
    phase: 'write',
    fn: applyStyles,
    effect: effect3,
    requires: ['computeStyles'],
  };

  // node_modules/@popperjs/core/lib/utils/getBasePlacement.js
  function getBasePlacement(placement) {
    return placement.split('-')[0];
  }

  // node_modules/@popperjs/core/lib/utils/math.js
  var max = Math.max;
  var min = Math.min;
  var round = Math.round;

  // node_modules/@popperjs/core/lib/utils/userAgent.js
  function getUAString() {
    var uaData = navigator.userAgentData;
    if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
      return uaData.brands
        .map(function (item) {
          return item.brand + '/' + item.version;
        })
        .join(' ');
    }
    return navigator.userAgent;
  }

  // node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
  function isLayoutViewport() {
    return !/^((?!chrome|android).)*safari/i.test(getUAString());
  }

  // node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
  function getBoundingClientRect(element, includeScale, isFixedStrategy) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    var clientRect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;
    if (includeScale && isHTMLElement(element)) {
      scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
      scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
    }
    var _ref = isElement(element) ? getWindow(element) : window,
      visualViewport = _ref.visualViewport;
    var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
    var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
    var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
    var width = clientRect.width / scaleX;
    var height = clientRect.height / scaleY;
    return {
      width,
      height,
      top: y,
      right: x + width,
      bottom: y + height,
      left: x,
      x,
      y,
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js
  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element);
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }
    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }
    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width,
      height,
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/contains.js
  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode();
    if (parent.contains(child)) {
      return true;
    } else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;
      do {
        if (next && parent.isSameNode(next)) {
          return true;
        }
        next = next.parentNode || next.host;
      } while (next);
    }
    return false;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
  function getComputedStyle2(element) {
    return getWindow(element).getComputedStyle(element);
  }

  // node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
  function isTableElement(element) {
    return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
  function getDocumentElement(element) {
    return (
      (isElement(element)
        ? element.ownerDocument
        : // $FlowFixMe[prop-missing]
          element.document) || window.document
    ).documentElement;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
  function getParentNode(element) {
    if (getNodeName(element) === 'html') {
      return element;
    }
    return (
      // this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
      element.parentNode || // DOM Element detected
      (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element)
    );
  }

  // node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
  function getTrueOffsetParent(element) {
    if (
      !isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
      getComputedStyle2(element).position === 'fixed'
    ) {
      return null;
    }
    return element.offsetParent;
  }
  function getContainingBlock(element) {
    var isFirefox = /firefox/i.test(getUAString());
    var isIE = /Trident/i.test(getUAString());
    if (isIE && isHTMLElement(element)) {
      var elementCss = getComputedStyle2(element);
      if (elementCss.position === 'fixed') {
        return null;
      }
    }
    var currentNode = getParentNode(element);
    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }
    while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
      var css2 = getComputedStyle2(currentNode);
      if (
        css2.transform !== 'none' ||
        css2.perspective !== 'none' ||
        css2.contain === 'paint' ||
        ['transform', 'perspective'].indexOf(css2.willChange) !== -1 ||
        (isFirefox && css2.willChange === 'filter') ||
        (isFirefox && css2.filter && css2.filter !== 'none')
      ) {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return null;
  }
  function getOffsetParent(element) {
    var window2 = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === 'static') {
      offsetParent = getTrueOffsetParent(offsetParent);
    }
    if (
      offsetParent &&
      (getNodeName(offsetParent) === 'html' ||
        (getNodeName(offsetParent) === 'body' && getComputedStyle2(offsetParent).position === 'static'))
    ) {
      return window2;
    }
    return offsetParent || getContainingBlock(element) || window2;
  }

  // node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
  function getMainAxisFromPlacement(placement) {
    return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
  }

  // node_modules/@popperjs/core/lib/utils/within.js
  function within(min2, value, max2) {
    return max(min2, min(value, max2));
  }
  function withinMaxClamp(min2, value, max2) {
    var v = within(min2, value, max2);
    return v > max2 ? max2 : v;
  }

  // node_modules/@popperjs/core/lib/utils/getFreshSideObject.js
  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
  }

  // node_modules/@popperjs/core/lib/utils/mergePaddingObject.js
  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }

  // node_modules/@popperjs/core/lib/utils/expandToHashMap.js
  function expandToHashMap(value, keys) {
    return keys.reduce(function (hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }

  // node_modules/@popperjs/core/lib/modifiers/arrow.js
  var toPaddingObject = function toPaddingObject2(padding, state) {
    padding =
      typeof padding === 'function'
        ? padding(
            Object.assign({}, state.rects, {
              placement: state.placement,
            }),
          )
        : padding;
    return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  };
  function arrow(_ref) {
    var _state$modifiersData$;
    var state = _ref.state,
      name = _ref.name,
      options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? 'height' : 'width';
    if (!arrowElement || !popperOffsets2) {
      return;
    }
    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === 'y' ? top : left;
    var maxProp = axis === 'y' ? bottom : right;
    var endDiff =
      state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
    var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent
      ? axis === 'y'
        ? arrowOffsetParent.clientHeight || 0
        : arrowOffsetParent.clientWidth || 0
      : 0;
    var centerToReference = endDiff / 2 - startDiff / 2;
    var min2 = paddingObject[minProp];
    var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset2 = within(min2, center, max2);
    var axisProp = axis;
    state.modifiersData[name] =
      ((_state$modifiersData$ = {}),
      (_state$modifiersData$[axisProp] = offset2),
      (_state$modifiersData$.centerOffset = offset2 - center),
      _state$modifiersData$);
  }
  function effect4(_ref2) {
    var state = _ref2.state,
      options = _ref2.options;
    var _options$element = options.element,
      arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;
    if (arrowElement == null) {
      return;
    }
    if (typeof arrowElement === 'string') {
      arrowElement = state.elements.popper.querySelector(arrowElement);
      if (!arrowElement) {
        return;
      }
    }
    if (!contains(state.elements.popper, arrowElement)) {
      return;
    }
    state.elements.arrow = arrowElement;
  }
  var arrow_default = {
    name: 'arrow',
    enabled: true,
    phase: 'main',
    fn: arrow,
    effect: effect4,
    requires: ['popperOffsets'],
    requiresIfExists: ['preventOverflow'],
  };

  // node_modules/@popperjs/core/lib/utils/getVariation.js
  function getVariation(placement) {
    return placement.split('-')[1];
  }

  // node_modules/@popperjs/core/lib/modifiers/computeStyles.js
  var unsetSides = {
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
  };
  function roundOffsetsByDPR(_ref, win) {
    var x = _ref.x,
      y = _ref.y;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x * dpr) / dpr || 0,
      y: round(y * dpr) / dpr || 0,
    };
  }
  function mapToStyles(_ref2) {
    var _Object$assign2;
    var popper2 = _ref2.popper,
      popperRect = _ref2.popperRect,
      placement = _ref2.placement,
      variation = _ref2.variation,
      offsets = _ref2.offsets,
      position = _ref2.position,
      gpuAcceleration = _ref2.gpuAcceleration,
      adaptive = _ref2.adaptive,
      roundOffsets = _ref2.roundOffsets,
      isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x,
      x = _offsets$x === void 0 ? 0 : _offsets$x,
      _offsets$y = offsets.y,
      y = _offsets$y === void 0 ? 0 : _offsets$y;
    var _ref3 =
      typeof roundOffsets === 'function'
        ? roundOffsets({
            x,
            y,
          })
        : {
            x,
            y,
          };
    x = _ref3.x;
    y = _ref3.y;
    var hasX = offsets.hasOwnProperty('x');
    var hasY = offsets.hasOwnProperty('y');
    var sideX = left;
    var sideY = top;
    var win = window;
    if (adaptive) {
      var offsetParent = getOffsetParent(popper2);
      var heightProp = 'clientHeight';
      var widthProp = 'clientWidth';
      if (offsetParent === getWindow(popper2)) {
        offsetParent = getDocumentElement(popper2);
        if (getComputedStyle2(offsetParent).position !== 'static' && position === 'absolute') {
          heightProp = 'scrollHeight';
          widthProp = 'scrollWidth';
        }
      }
      offsetParent = offsetParent;
      if (placement === top || ((placement === left || placement === right) && variation === end)) {
        sideY = bottom;
        var offsetY =
          isFixed && offsetParent === win && win.visualViewport
            ? win.visualViewport.height
            : // $FlowFixMe[prop-missing]
              offsetParent[heightProp];
        y -= offsetY - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }
      if (placement === left || ((placement === top || placement === bottom) && variation === end)) {
        sideX = right;
        var offsetX =
          isFixed && offsetParent === win && win.visualViewport
            ? win.visualViewport.width
            : // $FlowFixMe[prop-missing]
              offsetParent[widthProp];
        x -= offsetX - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }
    var commonStyles = Object.assign(
      {
        position,
      },
      adaptive && unsetSides,
    );
    var _ref4 =
      roundOffsets === true
        ? roundOffsetsByDPR(
            {
              x,
              y,
            },
            getWindow(popper2),
          )
        : {
            x,
            y,
          };
    x = _ref4.x;
    y = _ref4.y;
    if (gpuAcceleration) {
      var _Object$assign;
      return Object.assign(
        {},
        commonStyles,
        ((_Object$assign = {}),
        (_Object$assign[sideY] = hasY ? '0' : ''),
        (_Object$assign[sideX] = hasX ? '0' : ''),
        (_Object$assign.transform =
          (win.devicePixelRatio || 1) <= 1
            ? 'translate(' + x + 'px, ' + y + 'px)'
            : 'translate3d(' + x + 'px, ' + y + 'px, 0)'),
        _Object$assign),
      );
    }
    return Object.assign(
      {},
      commonStyles,
      ((_Object$assign2 = {}),
      (_Object$assign2[sideY] = hasY ? y + 'px' : ''),
      (_Object$assign2[sideX] = hasX ? x + 'px' : ''),
      (_Object$assign2.transform = ''),
      _Object$assign2),
    );
  }
  function computeStyles(_ref5) {
    var state = _ref5.state,
      options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration,
      gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
      _options$adaptive = options.adaptive,
      adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
      _options$roundOffsets = options.roundOffsets,
      roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration,
      isFixed: state.options.strategy === 'fixed',
    };
    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign(
        {},
        state.styles.popper,
        mapToStyles(
          Object.assign({}, commonStyles, {
            offsets: state.modifiersData.popperOffsets,
            position: state.options.strategy,
            adaptive,
            roundOffsets,
          }),
        ),
      );
    }
    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign(
        {},
        state.styles.arrow,
        mapToStyles(
          Object.assign({}, commonStyles, {
            offsets: state.modifiersData.arrow,
            position: 'absolute',
            adaptive: false,
            roundOffsets,
          }),
        ),
      );
    }
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-placement': state.placement,
    });
  }
  var computeStyles_default = {
    name: 'computeStyles',
    enabled: true,
    phase: 'beforeWrite',
    fn: computeStyles,
    data: {},
  };

  // node_modules/@popperjs/core/lib/modifiers/eventListeners.js
  var passive = {
    passive: true,
  };
  function effect5(_ref) {
    var state = _ref.state,
      instance = _ref.instance,
      options = _ref.options;
    var _options$scroll = options.scroll,
      scroll = _options$scroll === void 0 ? true : _options$scroll,
      _options$resize = options.resize,
      resize = _options$resize === void 0 ? true : _options$resize;
    var window2 = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.addEventListener('scroll', instance.update, passive);
      });
    }
    if (resize) {
      window2.addEventListener('resize', instance.update, passive);
    }
    return function () {
      if (scroll) {
        scrollParents.forEach(function (scrollParent) {
          scrollParent.removeEventListener('scroll', instance.update, passive);
        });
      }
      if (resize) {
        window2.removeEventListener('resize', instance.update, passive);
      }
    };
  }
  var eventListeners_default = {
    name: 'eventListeners',
    enabled: true,
    phase: 'write',
    fn: function fn() {},
    effect: effect5,
    data: {},
  };

  // node_modules/@popperjs/core/lib/utils/getOppositePlacement.js
  var hash = {
    left: 'right',
    right: 'left',
    bottom: 'top',
    top: 'bottom',
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function (matched) {
      return hash[matched];
    });
  }

  // node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js
  var hash2 = {
    start: 'end',
    end: 'start',
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function (matched) {
      return hash2[matched];
    });
  }

  // node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft,
      scrollTop,
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
  function getWindowScrollBarX(element) {
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js
  function getViewportRect(element, strategy) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      var layoutViewport = isLayoutViewport();
      if (layoutViewport || (!layoutViewport && strategy === 'fixed')) {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x: x + getWindowScrollBarX(element),
      y,
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js
  function getDocumentRect(element) {
    var _element$ownerDocumen;
    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;
    if (getComputedStyle2(body || html).direction === 'rtl') {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }
    return {
      width,
      height,
      x,
      y,
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
  function isScrollParent(element) {
    var _getComputedStyle = getComputedStyle2(element),
      overflow = _getComputedStyle.overflow,
      overflowX = _getComputedStyle.overflowX,
      overflowY = _getComputedStyle.overflowY;
    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }

  // node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
  function getScrollParent(node) {
    if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
      return node.ownerDocument.body;
    }
    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }
    return getScrollParent(getParentNode(node));
  }

  // node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
  function listScrollParents(element, list) {
    var _element$ownerDocumen;
    if (list === void 0) {
      list = [];
    }
    var scrollParent = getScrollParent(element);
    var isBody =
      scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody
      ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : [])
      : scrollParent;
    var updatedList = list.concat(target);
    return isBody
      ? updatedList
      : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
        updatedList.concat(listScrollParents(getParentNode(target)));
  }

  // node_modules/@popperjs/core/lib/utils/rectToClientRect.js
  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height,
    });
  }

  // node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js
  function getInnerBoundingClientRect(element, strategy) {
    var rect = getBoundingClientRect(element, false, strategy === 'fixed');
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  function getClientRectFromMixedType(element, clippingParent, strategy) {
    return clippingParent === viewport
      ? rectToClientRect(getViewportRect(element, strategy))
      : isElement(clippingParent)
        ? getInnerBoundingClientRect(clippingParent, strategy)
        : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  }
  function getClippingParents(element) {
    var clippingParents2 = listScrollParents(getParentNode(element));
    var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle2(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
    if (!isElement(clipperElement)) {
      return [];
    }
    return clippingParents2.filter(function (clippingParent) {
      return (
        isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body'
      );
    });
  }
  function getClippingRect(element, boundary, rootBoundary, strategy) {
    var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
    var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents2[0];
    var clippingRect = clippingParents2.reduce(
      function (accRect, clippingParent) {
        var rect = getClientRectFromMixedType(element, clippingParent, strategy);
        accRect.top = max(rect.top, accRect.top);
        accRect.right = min(rect.right, accRect.right);
        accRect.bottom = min(rect.bottom, accRect.bottom);
        accRect.left = max(rect.left, accRect.left);
        return accRect;
      },
      getClientRectFromMixedType(element, firstClippingParent, strategy),
    );
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }

  // node_modules/@popperjs/core/lib/utils/computeOffsets.js
  function computeOffsets(_ref) {
    var reference2 = _ref.reference,
      element = _ref.element,
      placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference2.x + reference2.width / 2 - element.width / 2;
    var commonY = reference2.y + reference2.height / 2 - element.height / 2;
    var offsets;
    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference2.y - element.height,
        };
        break;
      case bottom:
        offsets = {
          x: commonX,
          y: reference2.y + reference2.height,
        };
        break;
      case right:
        offsets = {
          x: reference2.x + reference2.width,
          y: commonY,
        };
        break;
      case left:
        offsets = {
          x: reference2.x - element.width,
          y: commonY,
        };
        break;
      default:
        offsets = {
          x: reference2.x,
          y: reference2.y,
        };
    }
    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
    if (mainAxis != null) {
      var len = mainAxis === 'y' ? 'height' : 'width';
      switch (variation) {
        case start2:
          offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
          break;
        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
          break;
        default:
      }
    }
    return offsets;
  }

  // node_modules/@popperjs/core/lib/utils/detectOverflow.js
  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options,
      _options$placement = _options.placement,
      placement = _options$placement === void 0 ? state.placement : _options$placement,
      _options$strategy = _options.strategy,
      strategy = _options$strategy === void 0 ? state.strategy : _options$strategy,
      _options$boundary = _options.boundary,
      boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
      _options$rootBoundary = _options.rootBoundary,
      rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
      _options$elementConte = _options.elementContext,
      elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
      _options$altBoundary = _options.altBoundary,
      altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
      _options$padding = _options.padding,
      padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(
      typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements),
    );
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(
      isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper),
      boundary,
      rootBoundary,
      strategy,
    );
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets2 = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      strategy: 'absolute',
      placement,
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right,
    };
    var offsetData = state.modifiersData.offset;
    if (elementContext === popper && offsetData) {
      var offset2 = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function (key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
        overflowOffsets[key] += offset2[axis] * multiply;
      });
    }
    return overflowOffsets;
  }

  // node_modules/@popperjs/core/lib/utils/computeAutoPlacement.js
  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options,
      placement = _options.placement,
      boundary = _options.boundary,
      rootBoundary = _options.rootBoundary,
      padding = _options.padding,
      flipVariations = _options.flipVariations,
      _options$allowedAutoP = _options.allowedAutoPlacements,
      allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements2 = variation
      ? flipVariations
        ? variationPlacements
        : variationPlacements.filter(function (placement2) {
            return getVariation(placement2) === variation;
          })
      : basePlacements;
    var allowedPlacements = placements2.filter(function (placement2) {
      return allowedAutoPlacements.indexOf(placement2) >= 0;
    });
    if (allowedPlacements.length === 0) {
      allowedPlacements = placements2;
    }
    var overflows = allowedPlacements.reduce(function (acc, placement2) {
      acc[placement2] = detectOverflow(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding,
      })[getBasePlacement(placement2)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function (a, b) {
      return overflows[a] - overflows[b];
    });
  }

  // node_modules/@popperjs/core/lib/modifiers/flip.js
  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }
    var oppositePlacement = getOppositePlacement(placement);
    return [
      getOppositeVariationPlacement(placement),
      oppositePlacement,
      getOppositeVariationPlacement(oppositePlacement),
    ];
  }
  function flip(_ref) {
    var state = _ref.state,
      options = _ref.options,
      name = _ref.name;
    if (state.modifiersData[name]._skip) {
      return;
    }
    var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
      specifiedFallbackPlacements = options.fallbackPlacements,
      padding = options.padding,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      _options$flipVariatio = options.flipVariations,
      flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
      allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements =
      specifiedFallbackPlacements ||
      (isBasePlacement || !flipVariations
        ? [getOppositePlacement(preferredPlacement)]
        : getExpandedFallbackPlacements(preferredPlacement));
    var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement2) {
      return acc.concat(
        getBasePlacement(placement2) === auto
          ? computeAutoPlacement(state, {
              placement: placement2,
              boundary,
              rootBoundary,
              padding,
              flipVariations,
              allowedAutoPlacements,
            })
          : placement2,
      );
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = /* @__PURE__ */ new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements2[0];
    for (var i = 0; i < placements2.length; i++) {
      var placement = placements2[i];
      var _basePlacement = getBasePlacement(placement);
      var isStartVariation = getVariation(placement) === start2;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? 'width' : 'height';
      var overflow = detectOverflow(state, {
        placement,
        boundary,
        rootBoundary,
        altBoundary,
        padding,
      });
      var mainVariationSide = isVertical ? (isStartVariation ? right : left) : isStartVariation ? bottom : top;
      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }
      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];
      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }
      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }
      if (
        checks.every(function (check) {
          return check;
        })
      ) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }
      checksMap.set(placement, checks);
    }
    if (makeFallbackChecks) {
      var numberOfChecks = flipVariations ? 3 : 1;
      var _loop = function _loop2(_i2) {
        var fittingPlacement = placements2.find(function (placement2) {
          var checks2 = checksMap.get(placement2);
          if (checks2) {
            return checks2.slice(0, _i2).every(function (check) {
              return check;
            });
          }
        });
        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return 'break';
        }
      };
      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);
        if (_ret === 'break') break;
      }
    }
    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  }
  var flip_default = {
    name: 'flip',
    enabled: true,
    phase: 'main',
    fn: flip,
    requiresIfExists: ['offset'],
    data: {
      _skip: false,
    },
  };

  // node_modules/@popperjs/core/lib/modifiers/hide.js
  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0,
      };
    }
    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x,
    };
  }
  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function (side) {
      return overflow[side] >= 0;
    });
  }
  function hide(_ref) {
    var state = _ref.state,
      name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: 'reference',
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true,
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets,
      popperEscapeOffsets,
      isReferenceHidden,
      hasPopperEscaped,
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-reference-hidden': isReferenceHidden,
      'data-popper-escaped': hasPopperEscaped,
    });
  }
  var hide_default = {
    name: 'hide',
    enabled: true,
    phase: 'main',
    requiresIfExists: ['preventOverflow'],
    fn: hide,
  };

  // node_modules/@popperjs/core/lib/modifiers/offset.js
  function distanceAndSkiddingToXY(placement, rects, offset2) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
    var _ref =
        typeof offset2 === 'function'
          ? offset2(
              Object.assign({}, rects, {
                placement,
              }),
            )
          : offset2,
      skidding = _ref[0],
      distance = _ref[1];
    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0
      ? {
          x: distance,
          y: skidding,
        }
      : {
          x: skidding,
          y: distance,
        };
  }
  function offset(_ref2) {
    var state = _ref2.state,
      options = _ref2.options,
      name = _ref2.name;
    var _options$offset = options.offset,
      offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data2 = placements.reduce(function (acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
      return acc;
    }, {});
    var _data$state$placement = data2[state.placement],
      x = _data$state$placement.x,
      y = _data$state$placement.y;
    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }
    state.modifiersData[name] = data2;
  }
  var offset_default = {
    name: 'offset',
    enabled: true,
    phase: 'main',
    requires: ['popperOffsets'],
    fn: offset,
  };

  // node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
  function popperOffsets(_ref) {
    var state = _ref.state,
      name = _ref.name;
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      strategy: 'absolute',
      placement: state.placement,
    });
  }
  var popperOffsets_default = {
    name: 'popperOffsets',
    enabled: true,
    phase: 'read',
    fn: popperOffsets,
    data: {},
  };

  // node_modules/@popperjs/core/lib/utils/getAltAxis.js
  function getAltAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
  }

  // node_modules/@popperjs/core/lib/modifiers/preventOverflow.js
  function preventOverflow(_ref) {
    var state = _ref.state,
      options = _ref.options,
      name = _ref.name;
    var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      padding = options.padding,
      _options$tether = options.tether,
      tether = _options$tether === void 0 ? true : _options$tether,
      _options$tetherOffset = options.tetherOffset,
      tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary,
      rootBoundary,
      padding,
      altBoundary,
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue =
      typeof tetherOffset === 'function'
        ? tetherOffset(
            Object.assign({}, state.rects, {
              placement: state.placement,
            }),
          )
        : tetherOffset;
    var normalizedTetherOffsetValue =
      typeof tetherOffsetValue === 'number'
        ? {
            mainAxis: tetherOffsetValue,
            altAxis: tetherOffsetValue,
          }
        : Object.assign(
            {
              mainAxis: 0,
              altAxis: 0,
            },
            tetherOffsetValue,
          );
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data2 = {
      x: 0,
      y: 0,
    };
    if (!popperOffsets2) {
      return;
    }
    if (checkMainAxis) {
      var _offsetModifierState$;
      var mainSide = mainAxis === 'y' ? top : left;
      var altSide = mainAxis === 'y' ? bottom : right;
      var len = mainAxis === 'y' ? 'height' : 'width';
      var offset2 = popperOffsets2[mainAxis];
      var min2 = offset2 + overflow[mainSide];
      var max2 = offset2 - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start2 ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start2 ? -popperRect[len] : -referenceRect[len];
      var arrowElement = state.elements.arrow;
      var arrowRect =
        tether && arrowElement
          ? getLayoutRect(arrowElement)
          : {
              width: 0,
              height: 0,
            };
      var arrowPaddingObject = state.modifiersData['arrow#persistent']
        ? state.modifiersData['arrow#persistent'].padding
        : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide];
      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement
        ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis
        : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement
        ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis
        : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent
        ? mainAxis === 'y'
          ? arrowOffsetParent.clientTop || 0
          : arrowOffsetParent.clientLeft || 0
        : 0;
      var offsetModifierValue =
        (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null
          ? _offsetModifierState$
          : 0;
      var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset2 + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min2, tetherMin) : min2, offset2, tether ? max(max2, tetherMax) : max2);
      popperOffsets2[mainAxis] = preventedOffset;
      data2[mainAxis] = preventedOffset - offset2;
    }
    if (checkAltAxis) {
      var _offsetModifierState$2;
      var _mainSide = mainAxis === 'x' ? top : left;
      var _altSide = mainAxis === 'x' ? bottom : right;
      var _offset = popperOffsets2[altAxis];
      var _len = altAxis === 'y' ? 'height' : 'width';
      var _min = _offset + overflow[_mainSide];
      var _max = _offset - overflow[_altSide];
      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
      var _offsetModifierValue =
        (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null
          ? _offsetModifierState$2
          : 0;
      var _tetherMin = isOriginSide
        ? _min
        : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
      var _tetherMax = isOriginSide
        ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis
        : _max;
      var _preventedOffset =
        tether && isOriginSide
          ? withinMaxClamp(_tetherMin, _offset, _tetherMax)
          : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
      popperOffsets2[altAxis] = _preventedOffset;
      data2[altAxis] = _preventedOffset - _offset;
    }
    state.modifiersData[name] = data2;
  }
  var preventOverflow_default = {
    name: 'preventOverflow',
    enabled: true,
    phase: 'main',
    fn: preventOverflow,
    requiresIfExists: ['offset'],
  };

  // node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop,
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }

  // node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  }
  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0,
    };
    var offsets = {
      x: 0,
      y: 0,
    };
    if (isOffsetParentAnElement || (!isOffsetParentAnElement && !isFixed)) {
      if (
        getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
        isScrollParent(documentElement)
      ) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height,
    };
  }

  // node_modules/@popperjs/core/lib/utils/orderModifiers.js
  function order(modifiers) {
    var map = /* @__PURE__ */ new Map();
    var visited = /* @__PURE__ */ new Set();
    var result = [];
    modifiers.forEach(function (modifier) {
      map.set(modifier.name, modifier);
    });
    function sort2(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function (dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);
          if (depModifier) {
            sort2(depModifier);
          }
        }
      });
      result.push(modifier);
    }
    modifiers.forEach(function (modifier) {
      if (!visited.has(modifier.name)) {
        sort2(modifier);
      }
    });
    return result;
  }
  function orderModifiers(modifiers) {
    var orderedModifiers = order(modifiers);
    return modifierPhases.reduce(function (acc, phase) {
      return acc.concat(
        orderedModifiers.filter(function (modifier) {
          return modifier.phase === phase;
        }),
      );
    }, []);
  }

  // node_modules/@popperjs/core/lib/utils/debounce.js
  function debounce2(fn2) {
    var pending;
    return function () {
      if (!pending) {
        pending = new Promise(function (resolve) {
          Promise.resolve().then(function () {
            pending = void 0;
            resolve(fn2());
          });
        });
      }
      return pending;
    };
  }

  // node_modules/@popperjs/core/lib/utils/mergeByName.js
  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function (merged2, current) {
      var existing = merged2[current.name];
      merged2[current.name] = existing
        ? Object.assign({}, existing, current, {
            options: Object.assign({}, existing.options, current.options),
            data: Object.assign({}, existing.data, current.data),
          })
        : current;
      return merged2;
    }, {});
    return Object.keys(merged).map(function (key) {
      return merged[key];
    });
  }

  // node_modules/@popperjs/core/lib/createPopper.js
  var DEFAULT_OPTIONS = {
    placement: 'bottom',
    modifiers: [],
    strategy: 'absolute',
  };
  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return !args.some(function (element) {
      return !(element && typeof element.getBoundingClientRect === 'function');
    });
  }
  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }
    var _generatorOptions = generatorOptions,
      _generatorOptions$def = _generatorOptions.defaultModifiers,
      defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
      _generatorOptions$def2 = _generatorOptions.defaultOptions,
      defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper2(reference2, popper2, options) {
      if (options === void 0) {
        options = defaultOptions;
      }
      var state = {
        placement: 'bottom',
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
        modifiersData: {},
        elements: {
          reference: reference2,
          popper: popper2,
        },
        attributes: {},
        styles: {},
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state,
        setOptions: function setOptions(setOptionsAction) {
          var options2 = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions, state.options, options2);
          state.scrollParents = {
            reference: isElement(reference2)
              ? listScrollParents(reference2)
              : reference2.contextElement
                ? listScrollParents(reference2.contextElement)
                : [],
            popper: listScrollParents(popper2),
          };
          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
          state.orderedModifiers = orderedModifiers.filter(function (m) {
            return m.enabled;
          });
          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }
          var _state$elements = state.elements,
            reference3 = _state$elements.reference,
            popper3 = _state$elements.popper;
          if (!areValidElements(reference3, popper3)) {
            return;
          }
          state.rects = {
            reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === 'fixed'),
            popper: getLayoutRect(popper3),
          };
          state.reset = false;
          state.placement = state.options.placement;
          state.orderedModifiers.forEach(function (modifier) {
            return (state.modifiersData[modifier.name] = Object.assign({}, modifier.data));
          });
          for (var index2 = 0; index2 < state.orderedModifiers.length; index2++) {
            if (state.reset === true) {
              state.reset = false;
              index2 = -1;
              continue;
            }
            var _state$orderedModifie = state.orderedModifiers[index2],
              fn2 = _state$orderedModifie.fn,
              _state$orderedModifie2 = _state$orderedModifie.options,
              _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
              name = _state$orderedModifie.name;
            if (typeof fn2 === 'function') {
              state =
                fn2({
                  state,
                  options: _options,
                  name,
                  instance,
                }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce2(function () {
          return new Promise(function (resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy2() {
          cleanupModifierEffects();
          isDestroyed = true;
        },
      };
      if (!areValidElements(reference2, popper2)) {
        return instance;
      }
      instance.setOptions(options).then(function (state2) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state2);
        }
      });
      function runModifierEffects() {
        state.orderedModifiers.forEach(function (_ref) {
          var name = _ref.name,
            _ref$options = _ref.options,
            options2 = _ref$options === void 0 ? {} : _ref$options,
            effect7 = _ref.effect;
          if (typeof effect7 === 'function') {
            var cleanupFn = effect7({
              state,
              name,
              instance,
              options: options2,
            });
            var noopFn = function noopFn2() {};
            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }
      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function (fn2) {
          return fn2();
        });
        effectCleanupFns = [];
      }
      return instance;
    };
  }

  // node_modules/@popperjs/core/lib/popper.js
  var defaultModifiers = [
    eventListeners_default,
    popperOffsets_default,
    computeStyles_default,
    applyStyles_default,
    offset_default,
    flip_default,
    preventOverflow_default,
    arrow_default,
    hide_default,
  ];
  var createPopper = /* @__PURE__ */ popperGenerator({
    defaultModifiers,
  });

  // node_modules/tippy.js/dist/tippy.esm.js
  var BOX_CLASS = 'tippy-box';
  var CONTENT_CLASS = 'tippy-content';
  var BACKDROP_CLASS = 'tippy-backdrop';
  var ARROW_CLASS = 'tippy-arrow';
  var SVG_ARROW_CLASS = 'tippy-svg-arrow';
  var TOUCH_OPTIONS = {
    passive: true,
    capture: true,
  };
  var TIPPY_DEFAULT_APPEND_TO = function TIPPY_DEFAULT_APPEND_TO2() {
    return document.body;
  };
  function hasOwnProperty2(obj, key) {
    return {}.hasOwnProperty.call(obj, key);
  }
  function getValueAtIndexOrReturn(value, index2, defaultValue) {
    if (Array.isArray(value)) {
      var v = value[index2];
      return v == null ? (Array.isArray(defaultValue) ? defaultValue[index2] : defaultValue) : v;
    }
    return value;
  }
  function isType(value, type) {
    var str = {}.toString.call(value);
    return str.indexOf('[object') === 0 && str.indexOf(type + ']') > -1;
  }
  function invokeWithArgsOrReturn(value, args) {
    return typeof value === 'function' ? value.apply(void 0, args) : value;
  }
  function debounce3(fn2, ms) {
    if (ms === 0) {
      return fn2;
    }
    var timeout;
    return function (arg) {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn2(arg);
      }, ms);
    };
  }
  function removeProperties(obj, keys) {
    var clone3 = Object.assign({}, obj);
    keys.forEach(function (key) {
      delete clone3[key];
    });
    return clone3;
  }
  function splitBySpaces(value) {
    return value.split(/\s+/).filter(Boolean);
  }
  function normalizeToArray(value) {
    return [].concat(value);
  }
  function pushIfUnique(arr, value) {
    if (arr.indexOf(value) === -1) {
      arr.push(value);
    }
  }
  function unique(arr) {
    return arr.filter(function (item, index2) {
      return arr.indexOf(item) === index2;
    });
  }
  function getBasePlacement2(placement) {
    return placement.split('-')[0];
  }
  function arrayFrom(value) {
    return [].slice.call(value);
  }
  function removeUndefinedProps(obj) {
    return Object.keys(obj).reduce(function (acc, key) {
      if (obj[key] !== void 0) {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  }
  function div() {
    return document.createElement('div');
  }
  function isElement2(value) {
    return ['Element', 'Fragment'].some(function (type) {
      return isType(value, type);
    });
  }
  function isNodeList(value) {
    return isType(value, 'NodeList');
  }
  function isMouseEvent(value) {
    return isType(value, 'MouseEvent');
  }
  function isReferenceElement(value) {
    return !!(value && value._tippy && value._tippy.reference === value);
  }
  function getArrayOfElements(value) {
    if (isElement2(value)) {
      return [value];
    }
    if (isNodeList(value)) {
      return arrayFrom(value);
    }
    if (Array.isArray(value)) {
      return value;
    }
    return arrayFrom(document.querySelectorAll(value));
  }
  function setTransitionDuration(els, value) {
    els.forEach(function (el) {
      if (el) {
        el.style.transitionDuration = value + 'ms';
      }
    });
  }
  function setVisibilityState(els, state) {
    els.forEach(function (el) {
      if (el) {
        el.setAttribute('data-state', state);
      }
    });
  }
  function getOwnerDocument(elementOrElements) {
    var _element$ownerDocumen;
    var _normalizeToArray = normalizeToArray(elementOrElements),
      element = _normalizeToArray[0];
    return element != null && (_element$ownerDocumen = element.ownerDocument) != null && _element$ownerDocumen.body
      ? element.ownerDocument
      : document;
  }
  function isCursorOutsideInteractiveBorder(popperTreeData, event) {
    var clientX = event.clientX,
      clientY = event.clientY;
    return popperTreeData.every(function (_ref) {
      var popperRect = _ref.popperRect,
        popperState = _ref.popperState,
        props = _ref.props;
      var interactiveBorder = props.interactiveBorder;
      var basePlacement = getBasePlacement2(popperState.placement);
      var offsetData = popperState.modifiersData.offset;
      if (!offsetData) {
        return true;
      }
      var topDistance = basePlacement === 'bottom' ? offsetData.top.y : 0;
      var bottomDistance = basePlacement === 'top' ? offsetData.bottom.y : 0;
      var leftDistance = basePlacement === 'right' ? offsetData.left.x : 0;
      var rightDistance = basePlacement === 'left' ? offsetData.right.x : 0;
      var exceedsTop = popperRect.top - clientY + topDistance > interactiveBorder;
      var exceedsBottom = clientY - popperRect.bottom - bottomDistance > interactiveBorder;
      var exceedsLeft = popperRect.left - clientX + leftDistance > interactiveBorder;
      var exceedsRight = clientX - popperRect.right - rightDistance > interactiveBorder;
      return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
    });
  }
  function updateTransitionEndListener(box, action, listener) {
    var method = action + 'EventListener';
    ['transitionend', 'webkitTransitionEnd'].forEach(function (event) {
      box[method](event, listener);
    });
  }
  function actualContains(parent, child) {
    var target = child;
    while (target) {
      var _target$getRootNode;
      if (parent.contains(target)) {
        return true;
      }
      target =
        target.getRootNode == null
          ? void 0
          : (_target$getRootNode = target.getRootNode()) == null
            ? void 0
            : _target$getRootNode.host;
    }
    return false;
  }
  var currentInput = {
    isTouch: false,
  };
  var lastMouseMoveTime = 0;
  function onDocumentTouchStart() {
    if (currentInput.isTouch) {
      return;
    }
    currentInput.isTouch = true;
    if (window.performance) {
      document.addEventListener('mousemove', onDocumentMouseMove);
    }
  }
  function onDocumentMouseMove() {
    var now = performance.now();
    if (now - lastMouseMoveTime < 20) {
      currentInput.isTouch = false;
      document.removeEventListener('mousemove', onDocumentMouseMove);
    }
    lastMouseMoveTime = now;
  }
  function onWindowBlur() {
    var activeElement = document.activeElement;
    if (isReferenceElement(activeElement)) {
      var instance = activeElement._tippy;
      if (activeElement.blur && !instance.state.isVisible) {
        activeElement.blur();
      }
    }
  }
  function bindGlobalEventListeners() {
    document.addEventListener('touchstart', onDocumentTouchStart, TOUCH_OPTIONS);
    window.addEventListener('blur', onWindowBlur);
  }
  var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  var isIE11 = isBrowser
    ? // @ts-ignore
      !!window.msCrypto
    : false;
  function createMemoryLeakWarning(method) {
    var txt = method === 'destroy' ? 'n already-' : ' ';
    return [
      method + '() was called on a' + txt + 'destroyed instance. This is a no-op but',
      'indicates a potential memory leak.',
    ].join(' ');
  }
  function clean(value) {
    var spacesAndTabs = /[ \t]{2,}/g;
    var lineStartWithSpaces = /^[ \t]*/gm;
    return value.replace(spacesAndTabs, ' ').replace(lineStartWithSpaces, '').trim();
  }
  function getDevMessage(message) {
    return clean(
      '\n  %ctippy.js\n\n  %c' +
        clean(message) +
        '\n\n  %c\u{1F477}\u200D This is a development-only message. It will be removed in production.\n  ',
    );
  }
  function getFormattedMessage(message) {
    return [
      getDevMessage(message),
      // title
      'color: #00C584; font-size: 1.3em; font-weight: bold;',
      // message
      'line-height: 1.5',
      // footer
      'color: #a6a095;',
    ];
  }
  var visitedMessages;
  if (true) {
    resetVisitedMessages();
  }
  function resetVisitedMessages() {
    visitedMessages = /* @__PURE__ */ new Set();
  }
  function warnWhen(condition, message) {
    if (condition && !visitedMessages.has(message)) {
      var _console;
      visitedMessages.add(message);
      (_console = console).warn.apply(_console, getFormattedMessage(message));
    }
  }
  function errorWhen(condition, message) {
    if (condition && !visitedMessages.has(message)) {
      var _console2;
      visitedMessages.add(message);
      (_console2 = console).error.apply(_console2, getFormattedMessage(message));
    }
  }
  function validateTargets(targets) {
    var didPassFalsyValue = !targets;
    var didPassPlainObject = Object.prototype.toString.call(targets) === '[object Object]' && !targets.addEventListener;
    errorWhen(
      didPassFalsyValue,
      [
        'tippy() was passed',
        '`' + String(targets) + '`',
        'as its targets (first) argument. Valid types are: String, Element,',
        'Element[], or NodeList.',
      ].join(' '),
    );
    errorWhen(
      didPassPlainObject,
      [
        'tippy() was passed a plain object which is not supported as an argument',
        'for virtual positioning. Use props.getReferenceClientRect instead.',
      ].join(' '),
    );
  }
  var pluginProps = {
    animateFill: false,
    followCursor: false,
    inlinePositioning: false,
    sticky: false,
  };
  var renderProps = {
    allowHTML: false,
    animation: 'fade',
    arrow: true,
    content: '',
    inertia: false,
    maxWidth: 350,
    role: 'tooltip',
    theme: '',
    zIndex: 9999,
  };
  var defaultProps = Object.assign(
    {
      appendTo: TIPPY_DEFAULT_APPEND_TO,
      aria: {
        content: 'auto',
        expanded: 'auto',
      },
      delay: 0,
      duration: [300, 250],
      getReferenceClientRect: null,
      hideOnClick: true,
      ignoreAttributes: false,
      interactive: false,
      interactiveBorder: 2,
      interactiveDebounce: 0,
      moveTransition: '',
      offset: [0, 10],
      onAfterUpdate: function onAfterUpdate() {},
      onBeforeUpdate: function onBeforeUpdate() {},
      onCreate: function onCreate() {},
      onDestroy: function onDestroy() {},
      onHidden: function onHidden() {},
      onHide: function onHide() {},
      onMount: function onMount() {},
      onShow: function onShow() {},
      onShown: function onShown() {},
      onTrigger: function onTrigger() {},
      onUntrigger: function onUntrigger() {},
      onClickOutside: function onClickOutside() {},
      placement: 'top',
      plugins: [],
      popperOptions: {},
      render: null,
      showOnCreate: false,
      touch: true,
      trigger: 'mouseenter focus',
      triggerTarget: null,
    },
    pluginProps,
    renderProps,
  );
  var defaultKeys = Object.keys(defaultProps);
  var setDefaultProps = function setDefaultProps2(partialProps) {
    if (true) {
      validateProps(partialProps, []);
    }
    var keys = Object.keys(partialProps);
    keys.forEach(function (key) {
      defaultProps[key] = partialProps[key];
    });
  };
  function getExtendedPassedProps(passedProps) {
    var plugins2 = passedProps.plugins || [];
    var pluginProps2 = plugins2.reduce(function (acc, plugin2) {
      var name = plugin2.name,
        defaultValue = plugin2.defaultValue;
      if (name) {
        var _name;
        acc[name] =
          passedProps[name] !== void 0
            ? passedProps[name]
            : (_name = defaultProps[name]) != null
              ? _name
              : defaultValue;
      }
      return acc;
    }, {});
    return Object.assign({}, passedProps, pluginProps2);
  }
  function getDataAttributeProps(reference2, plugins2) {
    var propKeys = plugins2
      ? Object.keys(
          getExtendedPassedProps(
            Object.assign({}, defaultProps, {
              plugins: plugins2,
            }),
          ),
        )
      : defaultKeys;
    var props = propKeys.reduce(function (acc, key) {
      var valueAsString = (reference2.getAttribute('data-tippy-' + key) || '').trim();
      if (!valueAsString) {
        return acc;
      }
      if (key === 'content') {
        acc[key] = valueAsString;
      } else {
        try {
          acc[key] = JSON.parse(valueAsString);
        } catch (e) {
          acc[key] = valueAsString;
        }
      }
      return acc;
    }, {});
    return props;
  }
  function evaluateProps(reference2, props) {
    var out = Object.assign(
      {},
      props,
      {
        content: invokeWithArgsOrReturn(props.content, [reference2]),
      },
      props.ignoreAttributes ? {} : getDataAttributeProps(reference2, props.plugins),
    );
    out.aria = Object.assign({}, defaultProps.aria, out.aria);
    out.aria = {
      expanded: out.aria.expanded === 'auto' ? props.interactive : out.aria.expanded,
      content: out.aria.content === 'auto' ? (props.interactive ? null : 'describedby') : out.aria.content,
    };
    return out;
  }
  function validateProps(partialProps, plugins2) {
    if (partialProps === void 0) {
      partialProps = {};
    }
    if (plugins2 === void 0) {
      plugins2 = [];
    }
    var keys = Object.keys(partialProps);
    keys.forEach(function (prop) {
      var nonPluginProps = removeProperties(defaultProps, Object.keys(pluginProps));
      var didPassUnknownProp = !hasOwnProperty2(nonPluginProps, prop);
      if (didPassUnknownProp) {
        didPassUnknownProp =
          plugins2.filter(function (plugin2) {
            return plugin2.name === prop;
          }).length === 0;
      }
      warnWhen(
        didPassUnknownProp,
        [
          '`' + prop + '`',
          "is not a valid prop. You may have spelled it incorrectly, or if it's",
          'a plugin, forgot to pass it in an array as props.plugins.',
          '\n\n',
          'All props: https://atomiks.github.io/tippyjs/v6/all-props/\n',
          'Plugins: https://atomiks.github.io/tippyjs/v6/plugins/',
        ].join(' '),
      );
    });
  }
  var innerHTML = function innerHTML2() {
    return 'innerHTML';
  };
  function dangerouslySetInnerHTML(element, html) {
    element[innerHTML()] = html;
  }
  function createArrowElement(value) {
    var arrow2 = div();
    if (value === true) {
      arrow2.className = ARROW_CLASS;
    } else {
      arrow2.className = SVG_ARROW_CLASS;
      if (isElement2(value)) {
        arrow2.appendChild(value);
      } else {
        dangerouslySetInnerHTML(arrow2, value);
      }
    }
    return arrow2;
  }
  function setContent(content, props) {
    if (isElement2(props.content)) {
      dangerouslySetInnerHTML(content, '');
      content.appendChild(props.content);
    } else if (typeof props.content !== 'function') {
      if (props.allowHTML) {
        dangerouslySetInnerHTML(content, props.content);
      } else {
        content.textContent = props.content;
      }
    }
  }
  function getChildren(popper2) {
    var box = popper2.firstElementChild;
    var boxChildren = arrayFrom(box.children);
    return {
      box,
      content: boxChildren.find(function (node) {
        return node.classList.contains(CONTENT_CLASS);
      }),
      arrow: boxChildren.find(function (node) {
        return node.classList.contains(ARROW_CLASS) || node.classList.contains(SVG_ARROW_CLASS);
      }),
      backdrop: boxChildren.find(function (node) {
        return node.classList.contains(BACKDROP_CLASS);
      }),
    };
  }
  function render(instance) {
    var popper2 = div();
    var box = div();
    box.className = BOX_CLASS;
    box.setAttribute('data-state', 'hidden');
    box.setAttribute('tabindex', '-1');
    var content = div();
    content.className = CONTENT_CLASS;
    content.setAttribute('data-state', 'hidden');
    setContent(content, instance.props);
    popper2.appendChild(box);
    box.appendChild(content);
    onUpdate(instance.props, instance.props);
    function onUpdate(prevProps, nextProps) {
      var _getChildren = getChildren(popper2),
        box2 = _getChildren.box,
        content2 = _getChildren.content,
        arrow2 = _getChildren.arrow;
      if (nextProps.theme) {
        box2.setAttribute('data-theme', nextProps.theme);
      } else {
        box2.removeAttribute('data-theme');
      }
      if (typeof nextProps.animation === 'string') {
        box2.setAttribute('data-animation', nextProps.animation);
      } else {
        box2.removeAttribute('data-animation');
      }
      if (nextProps.inertia) {
        box2.setAttribute('data-inertia', '');
      } else {
        box2.removeAttribute('data-inertia');
      }
      box2.style.maxWidth = typeof nextProps.maxWidth === 'number' ? nextProps.maxWidth + 'px' : nextProps.maxWidth;
      if (nextProps.role) {
        box2.setAttribute('role', nextProps.role);
      } else {
        box2.removeAttribute('role');
      }
      if (prevProps.content !== nextProps.content || prevProps.allowHTML !== nextProps.allowHTML) {
        setContent(content2, instance.props);
      }
      if (nextProps.arrow) {
        if (!arrow2) {
          box2.appendChild(createArrowElement(nextProps.arrow));
        } else if (prevProps.arrow !== nextProps.arrow) {
          box2.removeChild(arrow2);
          box2.appendChild(createArrowElement(nextProps.arrow));
        }
      } else if (arrow2) {
        box2.removeChild(arrow2);
      }
    }
    return {
      popper: popper2,
      onUpdate,
    };
  }
  render.$$tippy = true;
  var idCounter = 1;
  var mouseMoveListeners = [];
  var mountedInstances = [];
  function createTippy(reference2, passedProps) {
    var props = evaluateProps(
      reference2,
      Object.assign({}, defaultProps, getExtendedPassedProps(removeUndefinedProps(passedProps))),
    );
    var showTimeout;
    var hideTimeout;
    var scheduleHideAnimationFrame;
    var isVisibleFromClick = false;
    var didHideDueToDocumentMouseDown = false;
    var didTouchMove = false;
    var ignoreOnFirstUpdate = false;
    var lastTriggerEvent;
    var currentTransitionEndListener;
    var onFirstUpdate;
    var listeners = [];
    var debouncedOnMouseMove = debounce3(onMouseMove, props.interactiveDebounce);
    var currentTarget;
    var id = idCounter++;
    var popperInstance = null;
    var plugins2 = unique(props.plugins);
    var state = {
      // Is the instance currently enabled?
      isEnabled: true,
      // Is the tippy currently showing and not transitioning out?
      isVisible: false,
      // Has the instance been destroyed?
      isDestroyed: false,
      // Is the tippy currently mounted to the DOM?
      isMounted: false,
      // Has the tippy finished transitioning in?
      isShown: false,
    };
    var instance = {
      // properties
      id,
      reference: reference2,
      popper: div(),
      popperInstance,
      props,
      state,
      plugins: plugins2,
      // methods
      clearDelayTimeouts,
      setProps,
      setContent: setContent2,
      show,
      hide: hide2,
      hideWithInteractivity,
      enable,
      disable,
      unmount,
      destroy: destroy2,
    };
    if (!props.render) {
      if (true) {
        errorWhen(true, 'render() function has not been supplied.');
      }
      return instance;
    }
    var _props$render = props.render(instance),
      popper2 = _props$render.popper,
      onUpdate = _props$render.onUpdate;
    popper2.setAttribute('data-tippy-root', '');
    popper2.id = 'tippy-' + instance.id;
    instance.popper = popper2;
    reference2._tippy = instance;
    popper2._tippy = instance;
    var pluginsHooks = plugins2.map(function (plugin2) {
      return plugin2.fn(instance);
    });
    var hasAriaExpanded = reference2.hasAttribute('aria-expanded');
    addListeners();
    handleAriaExpandedAttribute();
    handleStyles();
    invokeHook('onCreate', [instance]);
    if (props.showOnCreate) {
      scheduleShow();
    }
    popper2.addEventListener('mouseenter', function () {
      if (instance.props.interactive && instance.state.isVisible) {
        instance.clearDelayTimeouts();
      }
    });
    popper2.addEventListener('mouseleave', function () {
      if (instance.props.interactive && instance.props.trigger.indexOf('mouseenter') >= 0) {
        getDocument().addEventListener('mousemove', debouncedOnMouseMove);
      }
    });
    return instance;
    function getNormalizedTouchSettings() {
      var touch = instance.props.touch;
      return Array.isArray(touch) ? touch : [touch, 0];
    }
    function getIsCustomTouchBehavior() {
      return getNormalizedTouchSettings()[0] === 'hold';
    }
    function getIsDefaultRenderFn() {
      var _instance$props$rende;
      return !!((_instance$props$rende = instance.props.render) != null && _instance$props$rende.$$tippy);
    }
    function getCurrentTarget() {
      return currentTarget || reference2;
    }
    function getDocument() {
      var parent = getCurrentTarget().parentNode;
      return parent ? getOwnerDocument(parent) : document;
    }
    function getDefaultTemplateChildren() {
      return getChildren(popper2);
    }
    function getDelay(isShow) {
      if (
        (instance.state.isMounted && !instance.state.isVisible) ||
        currentInput.isTouch ||
        (lastTriggerEvent && lastTriggerEvent.type === 'focus')
      ) {
        return 0;
      }
      return getValueAtIndexOrReturn(instance.props.delay, isShow ? 0 : 1, defaultProps.delay);
    }
    function handleStyles(fromHide) {
      if (fromHide === void 0) {
        fromHide = false;
      }
      popper2.style.pointerEvents = instance.props.interactive && !fromHide ? '' : 'none';
      popper2.style.zIndex = '' + instance.props.zIndex;
    }
    function invokeHook(hook, args, shouldInvokePropsHook) {
      if (shouldInvokePropsHook === void 0) {
        shouldInvokePropsHook = true;
      }
      pluginsHooks.forEach(function (pluginHooks) {
        if (pluginHooks[hook]) {
          pluginHooks[hook].apply(pluginHooks, args);
        }
      });
      if (shouldInvokePropsHook) {
        var _instance$props;
        (_instance$props = instance.props)[hook].apply(_instance$props, args);
      }
    }
    function handleAriaContentAttribute() {
      var aria = instance.props.aria;
      if (!aria.content) {
        return;
      }
      var attr = 'aria-' + aria.content;
      var id2 = popper2.id;
      var nodes = normalizeToArray(instance.props.triggerTarget || reference2);
      nodes.forEach(function (node) {
        var currentValue = node.getAttribute(attr);
        if (instance.state.isVisible) {
          node.setAttribute(attr, currentValue ? currentValue + ' ' + id2 : id2);
        } else {
          var nextValue = currentValue && currentValue.replace(id2, '').trim();
          if (nextValue) {
            node.setAttribute(attr, nextValue);
          } else {
            node.removeAttribute(attr);
          }
        }
      });
    }
    function handleAriaExpandedAttribute() {
      if (hasAriaExpanded || !instance.props.aria.expanded) {
        return;
      }
      var nodes = normalizeToArray(instance.props.triggerTarget || reference2);
      nodes.forEach(function (node) {
        if (instance.props.interactive) {
          node.setAttribute(
            'aria-expanded',
            instance.state.isVisible && node === getCurrentTarget() ? 'true' : 'false',
          );
        } else {
          node.removeAttribute('aria-expanded');
        }
      });
    }
    function cleanupInteractiveMouseListeners() {
      getDocument().removeEventListener('mousemove', debouncedOnMouseMove);
      mouseMoveListeners = mouseMoveListeners.filter(function (listener) {
        return listener !== debouncedOnMouseMove;
      });
    }
    function onDocumentPress(event) {
      if (currentInput.isTouch) {
        if (didTouchMove || event.type === 'mousedown') {
          return;
        }
      }
      var actualTarget = (event.composedPath && event.composedPath()[0]) || event.target;
      if (instance.props.interactive && actualContains(popper2, actualTarget)) {
        return;
      }
      if (
        normalizeToArray(instance.props.triggerTarget || reference2).some(function (el) {
          return actualContains(el, actualTarget);
        })
      ) {
        if (currentInput.isTouch) {
          return;
        }
        if (instance.state.isVisible && instance.props.trigger.indexOf('click') >= 0) {
          return;
        }
      } else {
        invokeHook('onClickOutside', [instance, event]);
      }
      if (instance.props.hideOnClick === true) {
        instance.clearDelayTimeouts();
        instance.hide();
        didHideDueToDocumentMouseDown = true;
        setTimeout(function () {
          didHideDueToDocumentMouseDown = false;
        });
        if (!instance.state.isMounted) {
          removeDocumentPress();
        }
      }
    }
    function onTouchMove() {
      didTouchMove = true;
    }
    function onTouchStart() {
      didTouchMove = false;
    }
    function addDocumentPress() {
      var doc = getDocument();
      doc.addEventListener('mousedown', onDocumentPress, true);
      doc.addEventListener('touchend', onDocumentPress, TOUCH_OPTIONS);
      doc.addEventListener('touchstart', onTouchStart, TOUCH_OPTIONS);
      doc.addEventListener('touchmove', onTouchMove, TOUCH_OPTIONS);
    }
    function removeDocumentPress() {
      var doc = getDocument();
      doc.removeEventListener('mousedown', onDocumentPress, true);
      doc.removeEventListener('touchend', onDocumentPress, TOUCH_OPTIONS);
      doc.removeEventListener('touchstart', onTouchStart, TOUCH_OPTIONS);
      doc.removeEventListener('touchmove', onTouchMove, TOUCH_OPTIONS);
    }
    function onTransitionedOut(duration, callback) {
      onTransitionEnd(duration, function () {
        if (!instance.state.isVisible && popper2.parentNode && popper2.parentNode.contains(popper2)) {
          callback();
        }
      });
    }
    function onTransitionedIn(duration, callback) {
      onTransitionEnd(duration, callback);
    }
    function onTransitionEnd(duration, callback) {
      var box = getDefaultTemplateChildren().box;
      function listener(event) {
        if (event.target === box) {
          updateTransitionEndListener(box, 'remove', listener);
          callback();
        }
      }
      if (duration === 0) {
        return callback();
      }
      updateTransitionEndListener(box, 'remove', currentTransitionEndListener);
      updateTransitionEndListener(box, 'add', listener);
      currentTransitionEndListener = listener;
    }
    function on3(eventType, handler4, options) {
      if (options === void 0) {
        options = false;
      }
      var nodes = normalizeToArray(instance.props.triggerTarget || reference2);
      nodes.forEach(function (node) {
        node.addEventListener(eventType, handler4, options);
        listeners.push({
          node,
          eventType,
          handler: handler4,
          options,
        });
      });
    }
    function addListeners() {
      if (getIsCustomTouchBehavior()) {
        on3('touchstart', onTrigger2, {
          passive: true,
        });
        on3('touchend', onMouseLeave, {
          passive: true,
        });
      }
      splitBySpaces(instance.props.trigger).forEach(function (eventType) {
        if (eventType === 'manual') {
          return;
        }
        on3(eventType, onTrigger2);
        switch (eventType) {
          case 'mouseenter':
            on3('mouseleave', onMouseLeave);
            break;
          case 'focus':
            on3(isIE11 ? 'focusout' : 'blur', onBlurOrFocusOut);
            break;
          case 'focusin':
            on3('focusout', onBlurOrFocusOut);
            break;
        }
      });
    }
    function removeListeners() {
      listeners.forEach(function (_ref) {
        var node = _ref.node,
          eventType = _ref.eventType,
          handler4 = _ref.handler,
          options = _ref.options;
        node.removeEventListener(eventType, handler4, options);
      });
      listeners = [];
    }
    function onTrigger2(event) {
      var _lastTriggerEvent;
      var shouldScheduleClickHide = false;
      if (!instance.state.isEnabled || isEventListenerStopped(event) || didHideDueToDocumentMouseDown) {
        return;
      }
      var wasFocused = ((_lastTriggerEvent = lastTriggerEvent) == null ? void 0 : _lastTriggerEvent.type) === 'focus';
      lastTriggerEvent = event;
      currentTarget = event.currentTarget;
      handleAriaExpandedAttribute();
      if (!instance.state.isVisible && isMouseEvent(event)) {
        mouseMoveListeners.forEach(function (listener) {
          return listener(event);
        });
      }
      if (
        event.type === 'click' &&
        (instance.props.trigger.indexOf('mouseenter') < 0 || isVisibleFromClick) &&
        instance.props.hideOnClick !== false &&
        instance.state.isVisible
      ) {
        shouldScheduleClickHide = true;
      } else {
        scheduleShow(event);
      }
      if (event.type === 'click') {
        isVisibleFromClick = !shouldScheduleClickHide;
      }
      if (shouldScheduleClickHide && !wasFocused) {
        scheduleHide(event);
      }
    }
    function onMouseMove(event) {
      var target = event.target;
      var isCursorOverReferenceOrPopper = getCurrentTarget().contains(target) || popper2.contains(target);
      if (event.type === 'mousemove' && isCursorOverReferenceOrPopper) {
        return;
      }
      var popperTreeData = getNestedPopperTree()
        .concat(popper2)
        .map(function (popper3) {
          var _instance$popperInsta;
          var instance2 = popper3._tippy;
          var state2 =
            (_instance$popperInsta = instance2.popperInstance) == null ? void 0 : _instance$popperInsta.state;
          if (state2) {
            return {
              popperRect: popper3.getBoundingClientRect(),
              popperState: state2,
              props,
            };
          }
          return null;
        })
        .filter(Boolean);
      if (isCursorOutsideInteractiveBorder(popperTreeData, event)) {
        cleanupInteractiveMouseListeners();
        scheduleHide(event);
      }
    }
    function onMouseLeave(event) {
      var shouldBail =
        isEventListenerStopped(event) || (instance.props.trigger.indexOf('click') >= 0 && isVisibleFromClick);
      if (shouldBail) {
        return;
      }
      if (instance.props.interactive) {
        instance.hideWithInteractivity(event);
        return;
      }
      scheduleHide(event);
    }
    function onBlurOrFocusOut(event) {
      if (instance.props.trigger.indexOf('focusin') < 0 && event.target !== getCurrentTarget()) {
        return;
      }
      if (instance.props.interactive && event.relatedTarget && popper2.contains(event.relatedTarget)) {
        return;
      }
      scheduleHide(event);
    }
    function isEventListenerStopped(event) {
      return currentInput.isTouch ? getIsCustomTouchBehavior() !== event.type.indexOf('touch') >= 0 : false;
    }
    function createPopperInstance() {
      destroyPopperInstance();
      var _instance$props2 = instance.props,
        popperOptions = _instance$props2.popperOptions,
        placement = _instance$props2.placement,
        offset2 = _instance$props2.offset,
        getReferenceClientRect = _instance$props2.getReferenceClientRect,
        moveTransition = _instance$props2.moveTransition;
      var arrow2 = getIsDefaultRenderFn() ? getChildren(popper2).arrow : null;
      var computedReference = getReferenceClientRect
        ? {
            getBoundingClientRect: getReferenceClientRect,
            contextElement: getReferenceClientRect.contextElement || getCurrentTarget(),
          }
        : reference2;
      var tippyModifier = {
        name: '$$tippy',
        enabled: true,
        phase: 'beforeWrite',
        requires: ['computeStyles'],
        fn: function fn2(_ref2) {
          var state2 = _ref2.state;
          if (getIsDefaultRenderFn()) {
            var _getDefaultTemplateCh = getDefaultTemplateChildren(),
              box = _getDefaultTemplateCh.box;
            ['placement', 'reference-hidden', 'escaped'].forEach(function (attr) {
              if (attr === 'placement') {
                box.setAttribute('data-placement', state2.placement);
              } else {
                if (state2.attributes.popper['data-popper-' + attr]) {
                  box.setAttribute('data-' + attr, '');
                } else {
                  box.removeAttribute('data-' + attr);
                }
              }
            });
            state2.attributes.popper = {};
          }
        },
      };
      var modifiers = [
        {
          name: 'offset',
          options: {
            offset: offset2,
          },
        },
        {
          name: 'preventOverflow',
          options: {
            padding: {
              top: 2,
              bottom: 2,
              left: 5,
              right: 5,
            },
          },
        },
        {
          name: 'flip',
          options: {
            padding: 5,
          },
        },
        {
          name: 'computeStyles',
          options: {
            adaptive: !moveTransition,
          },
        },
        tippyModifier,
      ];
      if (getIsDefaultRenderFn() && arrow2) {
        modifiers.push({
          name: 'arrow',
          options: {
            element: arrow2,
            padding: 3,
          },
        });
      }
      modifiers.push.apply(modifiers, (popperOptions == null ? void 0 : popperOptions.modifiers) || []);
      instance.popperInstance = createPopper(
        computedReference,
        popper2,
        Object.assign({}, popperOptions, {
          placement,
          onFirstUpdate,
          modifiers,
        }),
      );
    }
    function destroyPopperInstance() {
      if (instance.popperInstance) {
        instance.popperInstance.destroy();
        instance.popperInstance = null;
      }
    }
    function mount2() {
      var appendTo = instance.props.appendTo;
      var parentNode;
      var node = getCurrentTarget();
      if ((instance.props.interactive && appendTo === TIPPY_DEFAULT_APPEND_TO) || appendTo === 'parent') {
        parentNode = node.parentNode;
      } else {
        parentNode = invokeWithArgsOrReturn(appendTo, [node]);
      }
      if (!parentNode.contains(popper2)) {
        parentNode.appendChild(popper2);
      }
      instance.state.isMounted = true;
      createPopperInstance();
      if (true) {
        warnWhen(
          instance.props.interactive && appendTo === defaultProps.appendTo && node.nextElementSibling !== popper2,
          [
            'Interactive tippy element may not be accessible via keyboard',
            'navigation because it is not directly after the reference element',
            'in the DOM source order.',
            '\n\n',
            'Using a wrapper <div> or <span> tag around the reference element',
            'solves this by creating a new parentNode context.',
            '\n\n',
            'Specifying `appendTo: document.body` silences this warning, but it',
            'assumes you are using a focus management solution to handle',
            'keyboard navigation.',
            '\n\n',
            'See: https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity',
          ].join(' '),
        );
      }
    }
    function getNestedPopperTree() {
      return arrayFrom(popper2.querySelectorAll('[data-tippy-root]'));
    }
    function scheduleShow(event) {
      instance.clearDelayTimeouts();
      if (event) {
        invokeHook('onTrigger', [instance, event]);
      }
      addDocumentPress();
      var delay = getDelay(true);
      var _getNormalizedTouchSe = getNormalizedTouchSettings(),
        touchValue = _getNormalizedTouchSe[0],
        touchDelay = _getNormalizedTouchSe[1];
      if (currentInput.isTouch && touchValue === 'hold' && touchDelay) {
        delay = touchDelay;
      }
      if (delay) {
        showTimeout = setTimeout(function () {
          instance.show();
        }, delay);
      } else {
        instance.show();
      }
    }
    function scheduleHide(event) {
      instance.clearDelayTimeouts();
      invokeHook('onUntrigger', [instance, event]);
      if (!instance.state.isVisible) {
        removeDocumentPress();
        return;
      }
      if (
        instance.props.trigger.indexOf('mouseenter') >= 0 &&
        instance.props.trigger.indexOf('click') >= 0 &&
        ['mouseleave', 'mousemove'].indexOf(event.type) >= 0 &&
        isVisibleFromClick
      ) {
        return;
      }
      var delay = getDelay(false);
      if (delay) {
        hideTimeout = setTimeout(function () {
          if (instance.state.isVisible) {
            instance.hide();
          }
        }, delay);
      } else {
        scheduleHideAnimationFrame = requestAnimationFrame(function () {
          instance.hide();
        });
      }
    }
    function enable() {
      instance.state.isEnabled = true;
    }
    function disable() {
      instance.hide();
      instance.state.isEnabled = false;
    }
    function clearDelayTimeouts() {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      cancelAnimationFrame(scheduleHideAnimationFrame);
    }
    function setProps(partialProps) {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('setProps'));
      }
      if (instance.state.isDestroyed) {
        return;
      }
      invokeHook('onBeforeUpdate', [instance, partialProps]);
      removeListeners();
      var prevProps = instance.props;
      var nextProps = evaluateProps(
        reference2,
        Object.assign({}, prevProps, removeUndefinedProps(partialProps), {
          ignoreAttributes: true,
        }),
      );
      instance.props = nextProps;
      addListeners();
      if (prevProps.interactiveDebounce !== nextProps.interactiveDebounce) {
        cleanupInteractiveMouseListeners();
        debouncedOnMouseMove = debounce3(onMouseMove, nextProps.interactiveDebounce);
      }
      if (prevProps.triggerTarget && !nextProps.triggerTarget) {
        normalizeToArray(prevProps.triggerTarget).forEach(function (node) {
          node.removeAttribute('aria-expanded');
        });
      } else if (nextProps.triggerTarget) {
        reference2.removeAttribute('aria-expanded');
      }
      handleAriaExpandedAttribute();
      handleStyles();
      if (onUpdate) {
        onUpdate(prevProps, nextProps);
      }
      if (instance.popperInstance) {
        createPopperInstance();
        getNestedPopperTree().forEach(function (nestedPopper) {
          requestAnimationFrame(nestedPopper._tippy.popperInstance.forceUpdate);
        });
      }
      invokeHook('onAfterUpdate', [instance, partialProps]);
    }
    function setContent2(content) {
      instance.setProps({
        content,
      });
    }
    function show() {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('show'));
      }
      var isAlreadyVisible = instance.state.isVisible;
      var isDestroyed = instance.state.isDestroyed;
      var isDisabled = !instance.state.isEnabled;
      var isTouchAndTouchDisabled = currentInput.isTouch && !instance.props.touch;
      var duration = getValueAtIndexOrReturn(instance.props.duration, 0, defaultProps.duration);
      if (isAlreadyVisible || isDestroyed || isDisabled || isTouchAndTouchDisabled) {
        return;
      }
      if (getCurrentTarget().hasAttribute('disabled')) {
        return;
      }
      invokeHook('onShow', [instance], false);
      if (instance.props.onShow(instance) === false) {
        return;
      }
      instance.state.isVisible = true;
      if (getIsDefaultRenderFn()) {
        popper2.style.visibility = 'visible';
      }
      handleStyles();
      addDocumentPress();
      if (!instance.state.isMounted) {
        popper2.style.transition = 'none';
      }
      if (getIsDefaultRenderFn()) {
        var _getDefaultTemplateCh2 = getDefaultTemplateChildren(),
          box = _getDefaultTemplateCh2.box,
          content = _getDefaultTemplateCh2.content;
        setTransitionDuration([box, content], 0);
      }
      onFirstUpdate = function onFirstUpdate2() {
        var _instance$popperInsta2;
        if (!instance.state.isVisible || ignoreOnFirstUpdate) {
          return;
        }
        ignoreOnFirstUpdate = true;
        void popper2.offsetHeight;
        popper2.style.transition = instance.props.moveTransition;
        if (getIsDefaultRenderFn() && instance.props.animation) {
          var _getDefaultTemplateCh3 = getDefaultTemplateChildren(),
            _box = _getDefaultTemplateCh3.box,
            _content = _getDefaultTemplateCh3.content;
          setTransitionDuration([_box, _content], duration);
          setVisibilityState([_box, _content], 'visible');
        }
        handleAriaContentAttribute();
        handleAriaExpandedAttribute();
        pushIfUnique(mountedInstances, instance);
        (_instance$popperInsta2 = instance.popperInstance) == null ? void 0 : _instance$popperInsta2.forceUpdate();
        invokeHook('onMount', [instance]);
        if (instance.props.animation && getIsDefaultRenderFn()) {
          onTransitionedIn(duration, function () {
            instance.state.isShown = true;
            invokeHook('onShown', [instance]);
          });
        }
      };
      mount2();
    }
    function hide2() {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hide'));
      }
      var isAlreadyHidden = !instance.state.isVisible;
      var isDestroyed = instance.state.isDestroyed;
      var isDisabled = !instance.state.isEnabled;
      var duration = getValueAtIndexOrReturn(instance.props.duration, 1, defaultProps.duration);
      if (isAlreadyHidden || isDestroyed || isDisabled) {
        return;
      }
      invokeHook('onHide', [instance], false);
      if (instance.props.onHide(instance) === false) {
        return;
      }
      instance.state.isVisible = false;
      instance.state.isShown = false;
      ignoreOnFirstUpdate = false;
      isVisibleFromClick = false;
      if (getIsDefaultRenderFn()) {
        popper2.style.visibility = 'hidden';
      }
      cleanupInteractiveMouseListeners();
      removeDocumentPress();
      handleStyles(true);
      if (getIsDefaultRenderFn()) {
        var _getDefaultTemplateCh4 = getDefaultTemplateChildren(),
          box = _getDefaultTemplateCh4.box,
          content = _getDefaultTemplateCh4.content;
        if (instance.props.animation) {
          setTransitionDuration([box, content], duration);
          setVisibilityState([box, content], 'hidden');
        }
      }
      handleAriaContentAttribute();
      handleAriaExpandedAttribute();
      if (instance.props.animation) {
        if (getIsDefaultRenderFn()) {
          onTransitionedOut(duration, instance.unmount);
        }
      } else {
        instance.unmount();
      }
    }
    function hideWithInteractivity(event) {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hideWithInteractivity'));
      }
      getDocument().addEventListener('mousemove', debouncedOnMouseMove);
      pushIfUnique(mouseMoveListeners, debouncedOnMouseMove);
      debouncedOnMouseMove(event);
    }
    function unmount() {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('unmount'));
      }
      if (instance.state.isVisible) {
        instance.hide();
      }
      if (!instance.state.isMounted) {
        return;
      }
      destroyPopperInstance();
      getNestedPopperTree().forEach(function (nestedPopper) {
        nestedPopper._tippy.unmount();
      });
      if (popper2.parentNode) {
        popper2.parentNode.removeChild(popper2);
      }
      mountedInstances = mountedInstances.filter(function (i) {
        return i !== instance;
      });
      instance.state.isMounted = false;
      invokeHook('onHidden', [instance]);
    }
    function destroy2() {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('destroy'));
      }
      if (instance.state.isDestroyed) {
        return;
      }
      instance.clearDelayTimeouts();
      instance.unmount();
      removeListeners();
      delete reference2._tippy;
      instance.state.isDestroyed = true;
      invokeHook('onDestroy', [instance]);
    }
  }
  function tippy(targets, optionalProps) {
    if (optionalProps === void 0) {
      optionalProps = {};
    }
    var plugins2 = defaultProps.plugins.concat(optionalProps.plugins || []);
    if (true) {
      validateTargets(targets);
      validateProps(optionalProps, plugins2);
    }
    bindGlobalEventListeners();
    var passedProps = Object.assign({}, optionalProps, {
      plugins: plugins2,
    });
    var elements = getArrayOfElements(targets);
    if (true) {
      var isSingleContentElement = isElement2(passedProps.content);
      var isMoreThanOneReferenceElement = elements.length > 1;
      warnWhen(
        isSingleContentElement && isMoreThanOneReferenceElement,
        [
          'tippy() was passed an Element as the `content` prop, but more than',
          'one tippy instance was created by this invocation. This means the',
          'content element will only be appended to the last tippy instance.',
          '\n\n',
          'Instead, pass the .innerHTML of the element, or use a function that',
          'returns a cloned version of the element instead.',
          '\n\n',
          '1) content: element.innerHTML\n',
          '2) content: () => element.cloneNode(true)',
        ].join(' '),
      );
    }
    var instances = elements.reduce(function (acc, reference2) {
      var instance = reference2 && createTippy(reference2, passedProps);
      if (instance) {
        acc.push(instance);
      }
      return acc;
    }, []);
    return isElement2(targets) ? instances[0] : instances;
  }
  tippy.defaultProps = defaultProps;
  tippy.setDefaultProps = setDefaultProps;
  tippy.currentInput = currentInput;
  var applyStylesModifier = Object.assign({}, applyStyles_default, {
    effect: function effect6(_ref) {
      var state = _ref.state;
      var initialStyles = {
        popper: {
          position: state.options.strategy,
          left: '0',
          top: '0',
          margin: '0',
        },
        arrow: {
          position: 'absolute',
        },
        reference: {},
      };
      Object.assign(state.elements.popper.style, initialStyles.popper);
      state.styles = initialStyles;
      if (state.elements.arrow) {
        Object.assign(state.elements.arrow.style, initialStyles.arrow);
      }
    },
  });
  tippy.setDefaultProps({
    render,
  });
  var tippy_esm_default = tippy;

  // ns-hugo:C:\Users\RazvanNicu\source\repos\hugo_alpine\assets\js\modules\storageManager.js
  function storageManager() {
    return {
      storageKeys: [],
      selectedKeys: {},
      init() {
        this.storageKeys = Object.keys(localStorage);
        this.storageKeys.forEach((key) => {
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify([]));
          }
          this.selectedKeys[key] = false;
        });
      },
      downloadSelectedData() {
        const data2 = {};
        for (const key in this.selectedKeys) {
          if (this.selectedKeys[key]) {
            data2[key] = JSON.parse(localStorage.getItem(key)) || null;
          }
        }
        const blob = new Blob([JSON.stringify(data2, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'selectedData.json';
        link.click();
        URL.revokeObjectURL(url);
      },
      uploadData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data2 = JSON.parse(e.target.result);
            for (const key in data2) {
              localStorage.setItem(key, JSON.stringify(data2[key]));
            }
            alert('Data uploaded successfully!');
            this.init();
          } catch (error2) {
            console.error('Error parsing JSON file:', error2);
            alert('Invalid JSON file.');
          }
        };
        reader.readAsText(file);
      },
    };
  }

  // <stdin>
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Alpine.js is initializing...');
    module_default.data('fieldComp', fieldComp);
    module_default.data('storageManager', storageManager);
    module_default.start();
    module_default.plugin(module_default2);
  });
  module_default.magic('tooltip', (el) => (message, duration = 1e3) => {
    let instance = tippy_esm_default(el, { content: message, trigger: 'manual' });
    instance.show();
    setTimeout(() => {
      instance.hide();
      setTimeout(() => instance.destroy(), 50);
    }, duration);
  });
  document.addEventListener('alpine:init', () => {
    module_default.magic('tooltip', (el) => (message) => {
      let instance = tippy_esm_default(el, { content: message, trigger: 'manual' });
      instance.show();
      setTimeout(() => {
        instance.hide();
        setTimeout(() => instance.destroy(), 50);
      }, 2e3);
    });
    module_default.directive('tooltip', (el, { expression }) => {
      tippy_esm_default(el, { content: expression });
    });
  });
})();
/*! Bundled license information:

@alpinejs/sort/dist/module.esm.js:
  (*! Bundled license information:
  
  sortablejs/modular/sortable.esm.js:
    (**!
     * Sortable 1.15.2
     * @author	RubaXa   <trash@rubaxa.org>
     * @author	owenm    <owen23355@gmail.com>
     * @license MIT
     *)
  *)
*/
