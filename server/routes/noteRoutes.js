import express from "express";
import Note from "../models/Note.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ message: "Invalid note ID" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content ?? "",
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: "Failed to create note" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ message: "Failed to update note" });
  }
});

// DELETE: Delete a note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid note ID" });
  }
});

export default router;
