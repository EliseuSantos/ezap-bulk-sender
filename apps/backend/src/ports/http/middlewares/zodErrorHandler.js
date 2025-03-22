import { ZodError } from "zod";

export function zodErrorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      data: {
        errors,
      },
    });
  }

  return next(err);
}
