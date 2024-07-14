import { Router } from "express";
import SurveyController from "./controllers/SurveyController";
import ResponseController from "./controllers/ResponseController";

const router = Router();

router.post("/survey", SurveyController.create);
router.put("/survey/:id", SurveyController.update);

router.post("/survey/:id/responses", ResponseController.create)
router.get("/survey/responses", ResponseController.index)
router.get("/survey/download-csv", ResponseController.dowloadCsv)

export { router };