import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req?.["client"]?.id || req.ip,
  message: {
    error: "Too many requests, please try again later.",
  },
});

export default rateLimiter;
