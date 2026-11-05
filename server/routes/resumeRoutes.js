
const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose')
const { GridFSBucket, ObjectId } = require('mongodb')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// Allow PDF uploads only
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, callback) => {
    const isPdf =
      file.mimetype === 'application/pdf' &&
      file.originalname.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      return callback(new Error('Only PDF files are allowed.'))
    }

    callback(null, true)
  },
})

// Get GridFS bucket
function getBucket() {
  const database = mongoose.connection.db

  return new GridFSBucket(database, {
    bucketName: 'resumes',
  })
}

// Upload resume
router.post(
  '/upload',
  authMiddleware,
  upload.single('resume'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'Please select a PDF resume.',
        })
      }

      const bucket = getBucket()

      const uploadStream = bucket.openUploadStream(
        req.file.originalname,
        {
          contentType: 'application/pdf',
          metadata: {
            userId: new ObjectId(req.userId),
            uploadedAt: new Date(),
          },
        }
      )

      uploadStream.end(req.file.buffer)

      uploadStream.on('finish', () => {
        res.status(201).json({
          message: 'Resume uploaded successfully.',
          resume: {
            id: uploadStream.id,
            filename: req.file.originalname,
            size: req.file.size,
            uploadedAt: new Date(),
          },
        })
      })

      uploadStream.on('error', error => {
        console.error('Resume upload error:', error)
        res.status(500).json({
          message: 'Could not upload resume.',
        })
      })
    } catch (error) {
      console.error('Resume upload error:', error)
      res.status(500).json({
        message: 'Could not upload resume.',
      })
    }
  }
)

// Get all resumes belonging to logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bucket = getBucket()

    const resumes = await bucket.find({
      'metadata.userId': new ObjectId(req.userId),
    }).toArray()

    res.json(
      resumes.map(resume => ({
        id: resume._id,
        filename: resume.filename,
        size: resume.length,
        uploadedAt: resume.uploadDate,
      }))
    )
  } catch (error) {
    console.error('Resume fetch error:', error)
    res.status(500).json({
      message: 'Could not fetch resumes.',
    })
  }
})

// Download resume
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid resume ID.',
      })
    }

    const bucket = getBucket()
    const id = new ObjectId(req.params.id)

    const files = await bucket.find({
      _id: id,
      'metadata.userId': new ObjectId(req.userId),
    }).toArray()

    if (!files.length) {
      return res.status(404).json({
        message: 'Resume not found.',
      })
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${files[0].filename.replace(/["\\\r\n]/g, '_')}"`,
      'X-Content-Type-Options': 'nosniff',
    })

    bucket.openDownloadStream(id).pipe(res)
  } catch (error) {
    console.error('Resume download error:', error)
    res.status(500).json({
      message: 'Could not download resume.',
    })
  }
})

// Delete resume
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid resume ID.',
      })
    }

    const bucket = getBucket()
    const id = new ObjectId(req.params.id)

    const files = await bucket.find({
      _id: id,
      'metadata.userId': new ObjectId(req.userId),
    }).toArray()

    if (!files.length) {
      return res.status(404).json({
        message: 'Resume not found.',
      })
    }

    await bucket.delete(id)

    res.json({
      message: 'Resume deleted successfully.',
    })
  } catch (error) {
    console.error('Resume delete error:', error)
    res.status(500).json({
      message: 'Could not delete resume.',
    })
  }
})

module.exports = router
