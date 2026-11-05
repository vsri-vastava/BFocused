
const express = require('express')
const router = express.Router()

const Application = require('../models/Application')
const authMiddleware = require('../middleware/authMiddleware')

// Protect every route below this line
router.use(authMiddleware)

// GET: Fetch logged-in user's applications
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find({
      userId: req.userId,
    }).sort({ createdAt: -1 })

    res.status(200).json(applications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST: Add an application for the logged-in user
router.post('/', async (req, res) => {
  try {
    const newApplication = new Application({
      ...req.body,
      userId: req.userId,
    })

    const savedApplication = await newApplication.save()

    res.status(201).json(savedApplication)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// PUT: Update an application belonging to the logged-in user
router.put('/:id', async (req, res) => {
  try {
    const { _id, userId, ...updatedData } = req.body

    const updatedApplication = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      updatedData,
      { new: true, runValidators: true }
    )

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' })
    }

    res.status(200).json(updatedApplication)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE: Delete an application belonging to the logged-in user
router.delete('/:id', async (req, res) => {
  try {
    const deletedApplication = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!deletedApplication) {
      return res.status(404).json({ message: 'Application not found' })
    }

    res.status(200).json({
      message: 'Application deleted successfully',
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router
