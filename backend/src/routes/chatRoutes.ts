import { Router } from "express";
import * as chatController from "../controllers/chatController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// All chat routes require authentication
router.use(protect);

router.post("/", chatController.createConversation);
router.get("/", chatController.getConversations);
router.get("/:id", chatController.getConversation);
router.post("/:id/messages", chatController.sendMessage);
router.delete("/:id", chatController.deleteConversation);

export default router;
