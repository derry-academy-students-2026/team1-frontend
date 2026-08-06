import type { Request, Response } from "express";

export function getHome(_req: Request, res: Response) {
	res.send("<!doctype html><html><body><h1>Hello world</h1></body></html>");
}
