import { JSONSchema7 } from "json-schema";

export function camelToTitleCase(s: string) {
    return !s || s.indexOf(" ") >= 0
        ? s
        : (s.charAt(0).toUpperCase() + s.substring(1))
              .split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/g)
              .map((x: string) => x.replace(/(\d+)/g, "$1 "))
              .join(" ");
}

export function deleteDefaultValues(
    obj: { [key: string]: object },
    schema: JSONSchema7 | undefined,
    rootSchema: JSONSchema7
) {
    // Recursively crawl the object and remove all default values

    if (schema?.$ref !== undefined) {
        schema = rootSchema.definitions![schema.$ref.split("/").pop() as string] as JSONSchema7;
    }

    if (schema === undefined) {
        return obj;
    }

    if (schema.type === "object" && schema.properties !== undefined) {
        for (const key in obj) {
            if (obj[key] === (schema.properties[key] as JSONSchema7).default) {
                delete obj[key];
            }
        }
        for (const key in obj) {
            deleteDefaultValues(
                obj[key] as { [key: string]: object },
                schema.properties[key] as JSONSchema7,
                rootSchema
            );
        }
    } else if (schema.type === "array") {
        for (const val of obj as unknown as object[]) {
            deleteDefaultValues(
                val as { [key: string]: object },
                schema.items as JSONSchema7,
                rootSchema
            );
        }
    }
}

// The following code removes empty objects from the form data.
// This is because rjsf makes empty objects for some reason
// Thank you, Mulan (https://stackoverflow.com/a/66105752/10958689)

function map(t: object, f: (v: object, k: string) => object) {
    switch (t?.constructor) {
        case Array:
            return (t as object[]).map(f as (o: object) => object);
        case Object:
            return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, f(v, k)]));
        default:
            return t;
    }
}

function filter(t: object, f: (v: object, k: string) => boolean) {
    switch (t?.constructor) {
        case Array:
            return (t as object[]).filter(f as (o: object) => boolean);
        case Object:
            return Object.fromEntries(Object.entries(t).filter(([k, v]) => f(v, k)));
        default:
            return t;
    }
}

const empty = Symbol("empty"); // <- sentinel

function nonEmpty(t: object | symbol) {
    switch (t?.constructor) {
        case Array:
            return (t as object[]).length > 0;
        case Object:
            return Object.keys(t).length > 0;
        default:
            return (t as symbol) !== empty; // <- all other t are OK, except for sentinel
    }
}

export function deleteEmptyObjects(t: object) {
    switch (t?.constructor) {
        case Array:
        case Object:
            return filter(map(t, deleteEmptyObjects), nonEmpty);
        default:
            return nonEmpty(t) ? t : empty; // <-
    }
}
