import { walk } from "npm:zimmerframe@1";
type Node = Deno.lint.Node;
type Identifier = Deno.lint.Identifier;

/**
 * @param {Node} node
 * @param {Node} parent
 * @returns {boolean}
 */
export function is_reference(node: Node, parent: Node): boolean {
  if (parent.type === "ImportAttribute") {
    return false;
  }
  if (node.type === "MemberExpression") {
    return !node.computed && is_reference(node.object, node);
  }

  if (node.type !== "Identifier") return false;

  switch (parent?.type) {
    // disregard `bar` in `foo.bar`
    case "MemberExpression":
      return parent.computed || node === parent.object;

    // disregard the `foo` in `class {foo(){}}` but keep it in `class {[foo](){}}`
    case "MethodDefinition":
      return parent.computed;

    // disregard the `meta` in `import.meta`
    case "MetaProperty":
      return parent.meta === node;

    // disregard the `foo` in `class {foo=bar}` but keep it in `class {[foo]=bar}` and `class {bar=foo}`
    case "PropertyDefinition":
      return parent.computed || node === parent.value;

    // disregard the `bar` in `{ bar: foo }`, but keep it in `{ [bar]: foo }`
    case "Property":
      return parent.computed || node === parent.value;

    // disregard the `bar` in `export { foo as bar }` or
    // the foo in `import { foo as bar }`
    case "ExportSpecifier":
    case "ImportSpecifier":
    case "ImportDefaultSpecifier":
    case "ImportNamespaceSpecifier":
      return node === parent.local;

    // disregard the `foo` in `foo: while (...) { ... break foo; ... continue foo;}`
    case "LabeledStatement":
    case "BreakStatement":
    case "ContinueStatement":
      return false;

    default:
      return true;
  }
}

/** @param {Node} expression */
export function analyze(expression: Node): {
  map: WeakMap<Deno.lint.Node, Scope>;
  scope: Scope;
  globals: Map<string, Deno.lint.Node>;
} {
  /** @typedef {Node} Node */

  /** @type {WeakMap<Node, Scope>} */
  const map: WeakMap<Node, Scope> = new WeakMap();

  /** @type {Map<string, Node>} */
  const globals: Map<string, Node> = new Map();

  const scope = new Scope(null, false);

  /** @type {[Scope, Identifier][]} */
  const references: [Scope, Identifier][] = [];

  /** @type {Scope} */
  let current_scope: Scope = scope;

  /**
   * @param {Node} node
   * @param {boolean} block
   */
  function push(node: Node, block: boolean) {
    map.set(node, current_scope = new Scope(current_scope, block));
  }

  walk(/** @type {Node} */ (expression), null, {
    _(node, context) {
      switch (node.type) {
        case "Identifier": {
          const parent = context.path.at(-1);
          if (parent && is_reference(node, parent)) {
            references.push([current_scope, node]);
          }
          return;
        }

        case "ImportSpecifier":
        case "ImportDefaultSpecifier":
        case "ImportNamespaceSpecifier":
          current_scope.declarations.set(node.local.name, node);
          return;
        case "ExportNamedDeclaration":
          if (node.source) {
            map.set(node, current_scope = new Scope(current_scope, true));
            for (const specifier of node.specifiers) {
              current_scope.declarations.set(
                specifier.local.type === "Identifier"
                  ? specifier.local.name
                  : specifier.local.value,
                specifier,
              );
            }
            return;
          }
          break;

        case "FunctionExpression":
        case "FunctionDeclaration":
        case "ArrowFunctionExpression":
          if (node.type === "FunctionDeclaration") {
            if (node.id) {
              current_scope.declarations.set(node.id.name, node);
            }

            push(node, false);
          } else {
            push(node, false);

            if (node.type === "FunctionExpression" && node.id) {
              current_scope.declarations.set(node.id.name, node);
            }
          }

          if (node.type !== "ArrowFunctionExpression") {
            current_scope.declarations.set("arguments", node);
          }

          for (const param of node.params) {
            for (const id of extract_identifiers(param)) {
              current_scope.declarations.set(
                id.name,
                id.parent.type === "RestElement" ? id.parent : id,
              );
            }
          }
          break;

        case "ForStatement":
        case "ForInStatement":
        case "ForOfStatement":
        case "BlockStatement":
        case "SwitchStatement":
          push(node, true);
          break;

        case "ClassDeclaration":
        case "VariableDeclaration":
          current_scope.add_declaration(node);
          break;

        case "CatchClause":
          push(node, true);

          if (node.param) {
            for (const name of extract_names(node.param)) {
              if (node.param) {
                current_scope.declarations.set(name, node.param);
              }
            }
          }
          break;
      }

      context.next();

      if (map.has(node) && current_scope !== null && current_scope.parent) {
        current_scope = current_scope.parent;
      }
    },
  });

  for (let i = references.length - 1; i >= 0; --i) {
    const [scope, reference] = references[i];

    if (!scope.references.has(reference.name)) {
      add_reference(scope, reference.name);
    }
    if (!scope.find_owner(reference.name)) {
      globals.set(reference.name, reference);
    }
  }

  return { map, scope, globals };
}

/**
 * @param {Scope} scope
 * @param {string} name
 */
function add_reference(scope: Scope, name: string) {
  scope.references.add(name);
  if (scope.parent) add_reference(scope.parent, name);
}

export class Scope {
  /** @type {Scope | null} */
  parent: Scope | null;

  /** @type {boolean} */
  block: boolean;

  /** @type {Map<string, Node>} */
  declarations: Map<string, Node>;

  /** @type {Set<string>} */
  initialised_declarations: Set<string>;

  /** @type {Set<string>} */
  references: Set<string>;

  /**
   * @param {Scope | null} parent
   * @param {boolean} block
   */
  constructor(parent: Scope | null, block: boolean) {
    /** @type {Scope | null} */
    this.parent = parent;

    /** @type {boolean} */
    this.block = block;

    /** @type {Map<string, Node>} */
    this.declarations = new Map();

    /** @type {Set<string>} */
    this.initialised_declarations = new Set();

    /** @type {Set<string>} */
    this.references = new Set();
  }

  /**
   * @param {VariableDeclaration | ClassDeclaration} node
   */
  add_declaration(
    node:
      | Deno.lint.VariableDeclaration
      | Deno.lint.ClassDeclaration,
  ): void {
    if (node.type === "VariableDeclaration") {
      if (node.kind === "var" && this.block && this.parent) {
        this.parent.add_declaration(node);
      } else {
        for (const declarator of node.declarations) {
          for (const name of extract_names(declarator.id)) {
            this.declarations.set(name, declarator);
            if (declarator.init) this.initialised_declarations.add(name);
          }
        }
      }
    } else if (node.id) {
      this.declarations.set(node.id.name, node);
    }
  }

  /**
   * @param {string} name
   * @returns {Scope | null}
   */
  find_owner(name: string): Scope | null {
    if (this.declarations.has(name)) return this;
    return this.parent && this.parent.find_owner(name);
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  has(name: string): boolean {
    return (
      this.declarations.has(name) || (!!this.parent && this.parent.has(name))
    );
  }
}

/**
 * @param {Node} param
 * @returns {string[]}
 */
export function extract_names(
  param: Node | Deno.lint.TSParameterProperty,
): string[] {
  return extract_identifiers(param).map((node) => node.name);
}

/**
 * @param {Node} param
 * @param {Identifier[]} nodes
 * @returns {Identifier[]}
 */
export function extract_identifiers(
  param: Node | Deno.lint.TSParameterProperty,
  nodes: Identifier[] = [],
): Identifier[] {
  switch (param.type) {
    case "Identifier":
      nodes.push(param);
      break;

    case "MemberExpression": {
      let object: Deno.lint.Expression = param;
      while (object.type === "MemberExpression") {
        object = object.object;
      }
      if (object.type !== "Identifier") {
        throw new Error("must be an identifier");
      }
      nodes.push(object);
      break;
    }

    case "ObjectPattern":
      for (const prop of param.properties) {
        if (prop.type === "RestElement") {
          extract_identifiers(prop.argument, nodes);
        } else {
          extract_identifiers(prop.value, nodes);
        }
      }

      break;

    case "ArrayPattern":
      for (const element of param.elements) {
        if (element) extract_identifiers(element, nodes);
      }

      break;

    case "RestElement":
      extract_identifiers(param.argument, nodes);
      break;

    case "AssignmentPattern":
      extract_identifiers(param.left, nodes);
      break;
  }

  return nodes;
}
