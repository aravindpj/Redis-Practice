import type { Response } from "express";

export const successResponse = (
  res: Response,
  data: any,
  message: string = "success"
) => {
  return res.status(200).json({ success: true, message, data });
};

export const errorResponse = (res: Response, status: number, error: string) => {
  return res.status(status).json({ success: false, error });
};
