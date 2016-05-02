export class AuthError extends Error{
    constructor(message, data) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.data = data;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}