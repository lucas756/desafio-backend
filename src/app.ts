import express, { Application, Request, Response, NextFunction } from "express";

import { router as routes } from "./route";

const app: Application = express();

app.use(express.json())
app.use("/", routes);
app.use("/server-test", (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({ message: "running on port 5050" });
});

export default app;