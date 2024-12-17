import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const validateFilePayload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const shema = z.object({
    file_id: z.string({
      required_error: "File Id is required",
      invalid_type_error: "File Id must be a string",
    }),
    header_row: z
      .number({
        invalid_type_error: "Header row must be greater than or equal to 1",
      })
      .gte(1)
      .default(1),
  });

  const requestBody = shema.safeParse(req.body);

  if (!requestBody.success) {
    return res.status(400).json({
      success: false,
      message: requestBody.error.errors,
    });
  }

  next();
};

export { validateFilePayload };
