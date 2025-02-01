import type { Response } from "express";

export const successResponse = (
  res: Response,
  data: any,
  message: string = "success"
) => res.status(200).json({ success: true, message, data });

export const errorResponse = (res: Response, status: number, error: string) =>
  res.status(status).json({ success: false, error });
