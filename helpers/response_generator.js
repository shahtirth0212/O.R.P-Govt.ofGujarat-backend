class Response {
    constructor(obj, err, msg) {
        this.data = obj;
        this.err = err;
        this.msg = msg;
    }
}

exports.res_generator = (obj, err, msg) => {
    return JSON.stringify(new Response(obj, err, msg));
}