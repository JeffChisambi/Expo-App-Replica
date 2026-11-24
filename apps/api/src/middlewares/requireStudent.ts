import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

export const requireStudent: RequestHandler = (req, res, next) => {
  if (!getAuth(req).userId) {
    res.status(401).json({ message: "Sign in to access student resources." });
    return;
  }

  next();
};
