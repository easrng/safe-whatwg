import { walk } from "npm:zimmerframe@1";
import { analyze, is_reference, type Scope } from "./periscopic-deno.ts";

const plugin: Deno.lint.Plugin = {
  // The name of your plugin. Will be shown in error output
  name: "no-property-access",
  // Object with rules. The property name is the rule name and
  // will be shown in the error output as well.
  rules: {
    "no-property-access": {
      // Inside the `create(context)` method is where you'll put your logic.
      // It's called when a file is being linted.
      create(context) {
        if (/[/\\]tests[/\\]/.test(context.filename)) return {};
        // Return an AST visitor object
        return {
          Program(node) {
            const { map: scopes, scope } = analyze(node);
            walk<Deno.lint.Node, { scope: Scope }>(node, { scope }, {
              // Here in this example we forbid any identifiers being named `_a`
              MemberExpression(node, ctx) {
                ctx.next();
                if (node.property.type === "PrivateIdentifier") return;
                if (node.object.type === "ThisExpression") {
                  return;
                }
                if (node.object.type === "Identifier") {
                  const decl = ctx.state.scope.find_owner(node.object.name)
                    ?.declarations.get(node.object.name);
                  if (
                    decl?.type ===
                      "ImportNamespaceSpecifier"
                  ) return;
                  const type = (decl?.type ===
                      "VariableDeclarator" &&
                    decl.id.typeAnnotation &&
                    decl.id.typeAnnotation.typeAnnotation) ||
                    (decl?.type === "Identifier" &&
                      decl.typeAnnotation?.typeAnnotation) ||
                    (decl?.type === "RestElement" &&
                      decl.typeAnnotation?.typeAnnotation) ||
                    undefined;
                  if (
                    (type?.type === "TSTypeReference" &&
                      type.typeName.type === "Identifier" &&
                      type.typeName.name === "Safe")
                  ) return;
                  if (
                    node.computed === false &&
                    node.property.type === "Identifier" &&
                    node.property.name === "length"
                  ) {
                    if (
                      type?.type === "TSArrayType" ||
                      type?.type === "TSTupleType" ||
                      type?.type === "TSStringKeyword"
                    ) return;
                    if (
                      (decl?.type === "FunctionDeclaration" ||
                        decl?.type === "FunctionExpression") &&
                      node.object.name === "arguments"
                    ) return;
                    context.report({
                      node,
                      message:
                        "`[...].length` is only allowed when variable is typed as TSArrayType or TSStringKeyword or is `arguments`, got " +
                        (type?.type ?? "no type"),
                    });
                    return;
                  }
                  if (
                    node.computed === false &&
                    node.property.type === "Identifier" &&
                    node.property.name === "prototype" &&
                    decl?.type === "ClassDeclaration"
                  ) {
                    return;
                  }
                }
                if (
                  node.computed && node.property.type === "BinaryExpression" &&
                  [
                    "&",
                    "**",
                    "*",
                    "|",
                    "^",
                    ">>>",
                    ">>",
                    "<<",
                    "-",
                    "+",
                    "%",
                    "/",
                  ].includes(node.property.operator) &&
                  ((node.property.right.type === "Literal" &&
                    typeof node.property.right.value === "number") ||
                    (node.property.left.type === "Literal" &&
                      typeof node.property.left.value === "number"))
                ) {
                  return;
                }
                if (
                  node.computed && node.property.type === "UpdateExpression"
                ) {
                  return;
                }
                if (
                  node.computed && node.property.type === "UnaryExpression" &&
                  (node.property.operator === "+" ||
                    node.property.operator === "-" ||
                    node.property.operator === "~")
                ) {
                  return;
                }
                if (
                  node.computed && node.property.type === "Literal" &&
                  typeof node.property.value === "number"
                ) {
                  return;
                }
                if (node.computed && node.property.type === "Identifier") {
                  const decl = ctx.state.scope.find_owner(node.property.name)
                    ?.declarations.get(node.property.name);
                  if (
                    decl?.type ===
                      "VariableDeclarator" &&
                    decl.init?.type === "Literal" &&
                    typeof decl.init.value === "number"
                  ) return;
                  const type = (decl?.type ===
                      "VariableDeclarator" &&
                    decl.id.typeAnnotation &&
                    decl.id.typeAnnotation.typeAnnotation) ||
                    (decl?.type === "Identifier" &&
                      decl.typeAnnotation?.typeAnnotation) ||
                    (decl?.type === "RestElement" &&
                      decl.typeAnnotation?.typeAnnotation) ||
                    undefined;
                  if (type?.type === "TSNumberKeyword") return;
                }
                context.report({
                  node,
                  message: "MemberExpression is banned ",
                });
              },
              Identifier(node, ctx) {
                if (ctx.path.at(-1)!.type === "MetaProperty") return;
                if (!is_reference(node, ctx.path.at(-1)!)) return;
                if (
                  !ctx.state.scope.find_owner(node.name)?.declarations.get(
                    node.name,
                  )
                ) {
                  context.report({
                    node,
                    message: "globals are banned",
                  });
                }
              },
              _(node, ctx) {
                if (
                  node.type.startsWith("TS") &&
                  !node.type.endsWith("Expression")
                ) {
                  return;
                }
                const scope = scopes.get(node);
                if (scope) {
                  ctx.next({ scope });
                } else {
                  ctx.next();
                }
              },
            });
          },
        };
      },
    },
  },
};
export default plugin;
