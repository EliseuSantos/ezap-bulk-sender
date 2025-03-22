export function validateAndHandle({
  schema,
  getData = (req) => req.body,
  handler,
}) {
  return async (req, res, next) => {
    try {
      const raw = getData(req);
      const validation = schema.safeParse(raw);

      if (!validation.success) {
        const errors = validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return res.status(400).json({
          data: { errors },
        });
      }

      return handler(req, res, validation.data);
    } catch (err) {
      next(err);
    }
  };
}
