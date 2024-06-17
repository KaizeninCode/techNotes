const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');

/*
@desc GET all notes
@route GET /notes
@access Private
*/
const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean();
    if (!notes?.length) return res.status(400).json({ message: 'No notes found.' });
    res.json(notes);
});

/*
@desc POST a note
@route POST /notes
@access Private
*/
const createNote = asyncHandler(async (req, res) => {
    const { user, title, text, completed } = req.body;

    // Confirm data
    if (!user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Fetch the user by name or another unique field
    const foundUser = await User.findOne({ username: user }).exec();
    if (!foundUser) {
        return res.status(400).json({ message: 'User not found.' });
    }

    const noteObj = { user: foundUser._id, title, text, completed };

    // Create and store the new note
    const note = await Note.create(noteObj);

    if (note) {
        res.status(201).json({ message: 'Note created successfully.' });
    } else {
        res.status(400).json({ message: 'Invalid note data' });
    }
});

/*
@desc Update a note
@route PATCH /notes
@access Private
*/
const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body;

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const note = await Note.findById(id).exec();
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    // Check for duplicates
    const duplicate = await Note.findOne({ title }).lean().exec();

    // Allow updates to the original user
    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: 'Note already exists.' });
    }

    note.title = title;
    note.text = text;
    note.completed = completed;

    const updatedNote = await note.save();

    res.json({ message: `Note ${updatedNote.title} updated successfully.` });
});

/*
@desc DELETE a note
@route DELETE /notes
@access Private
*/
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: 'Note ID required.' });

    const note = await Note.findById(id).exec();
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    const result = await note.deleteOne();
    const reply = 'Note deleted successfully.';

    res.json(reply);
});

module.exports = {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
};
