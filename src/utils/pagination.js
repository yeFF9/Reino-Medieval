function pagination(query) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

async function paginatedResult(model, where, query, include, orderBy = { createdAt: 'desc' }) {
  const { page, limit, skip, take } = pagination(query);
  const [data, total] = await Promise.all([
    model.findMany({ where, skip, take, ...(include ? { include } : {}), orderBy }),
    model.count({ where }),
  ]);

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

module.exports = { pagination, paginatedResult };
