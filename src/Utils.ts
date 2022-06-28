export function camelToTitleCase(s: string) {
    return !s || s.indexOf(' ') >= 0 ? s :
        (s.charAt(0).toUpperCase() + s.substring(1))
            .split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/g)
            .map((x: string) => x.replace(/(\d+)/g, '$1 '))
            .join(' ');
}


