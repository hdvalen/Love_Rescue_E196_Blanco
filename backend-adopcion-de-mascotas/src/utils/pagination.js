const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

const getPaginationResponse = (count, page, limit) => ({
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit)
});

module.exports = { getPagination, getPaginationResponse };
