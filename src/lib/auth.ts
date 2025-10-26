export function authIsPasswordValid(password: string) {
    const match = new RegExp(/^.*(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*([^\w\d]|[_])).*$/, 'i');

    return match.test(password);
}

export function authGeneratePasswordFormula() {
    return "Password should contain at least 8 characters, an uppercase letter and lowercase letter, a number and a symbol.";
}