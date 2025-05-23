// deno-lint-ignore-file prefer-primordials
const realHasInstance = Object[Symbol.hasInstance];
Object.defineProperty(Object, Symbol.hasInstance, {
  value: function (instance) {
    return (
      realHasInstance.call(Object, instance) ||
      // deno-lint-ignore no-undef
      instance instanceof HostObject
    );
  },
  writable: true,
  enumerable: true,
});
Object.getPrototypeOf = function (instance) {
  const proto = Reflect.getPrototypeOf(instance);
  // deno-lint-ignore no-undef
  if (proto === HostObject.prototype) return Object.prototype;
  return proto;
};
