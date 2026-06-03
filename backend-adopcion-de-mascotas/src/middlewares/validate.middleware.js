const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const messages = result.error.issues.map(i => i.message);
            return res.status(400).json({ ok: false, message: messages.join('. ') });
        }
        req[source] = result.data;
        next();
    };
};

module.exports = { validate };
