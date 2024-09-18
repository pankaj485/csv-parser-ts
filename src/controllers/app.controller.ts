import { Request, Response } from "express";

const sayHello = (req: Request, res: Response) => {
  return res.status(200).send({
    success: true,
    message: "Welcome to Express server",
  });
};

export { sayHello };
