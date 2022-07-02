import {JSONSchema7} from "json-schema";

export function camelToTitleCase(s: string) {
    return !s || s.indexOf(" ") >= 0 ? s :
        (s.charAt(0).toUpperCase() + s.substring(1))
            .split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/g)
            .map((x: string) => x.replace(/(\d+)/g, "$1 "))
            .join(" ");
}

export function stripDefaultsFromJsonSchema(schema: JSONSchema7) {

    if (schema.default !== undefined) {
        delete schema.default;
    }

    if (schema.definitions !== undefined) {
        for (const key in schema.definitions) {
            stripDefaultsFromJsonSchema(schema.definitions[key] as JSONSchema7);
        }
    }

    if (schema.type === "object") {
        for (const key in schema.properties) {
            stripDefaultsFromJsonSchema(schema.properties[key] as JSONSchema7);
        }
    } else if (schema.type === "array") {
        if (schema.items as JSONSchema7) {
            stripDefaultsFromJsonSchema(schema.items as JSONSchema7);
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
            return nonEmpty(t) ? t : empty;  // <-
    }
}
