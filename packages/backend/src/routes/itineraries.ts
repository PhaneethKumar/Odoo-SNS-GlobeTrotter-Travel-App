import { Router } from 'express';
import { param } from 'express-validator';
import { ItineraryController } from '../controllers/ItineraryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All itinerary routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/itineraries
 * @desc    Create a new itinerary
 * @access  Private
 */
router.post('/', ItineraryController.createValidation, ItineraryController.create);

/**
 * @route   GET /api/itineraries
 * @desc    Get all itineraries for the authenticated user
 * @query   status - Filter by status (draft, active, completed, cancelled)
 * @query   upcoming - Get upcoming itineraries (true/false)
 * @query   past - Get past itineraries (true/false)
 * @access  Private
 */
router.get('/', ItineraryController.getAll);

/**
 * @route   GET /api/itineraries/:id
 * @desc    Get a specific itinerary by ID (includes stops)
 * @access  Private
 */
router.get('/:id', ItineraryController.idValidation, ItineraryController.getById);

/**
 * @route   PUT /api/itineraries/:id
 * @desc    Update an itinerary
 * @access  Private
 */
router.put('/:id', ItineraryController.updateValidation, ItineraryController.update);

/**
 * @route   DELETE /api/itineraries/:id
 * @desc    Delete an itinerary (cascades to stops and activities)
 * @access  Private
 */
router.delete('/:id', ItineraryController.idValidation, ItineraryController.delete);

/**
 * @route   POST /api/itineraries/:id/stops
 * @desc    Add a stop to an itinerary
 * @access  Private
 */
router.post('/:id/stops', ItineraryController.createStopValidation, ItineraryController.addStop);

/**
 * @route   PUT /api/itineraries/:id/stops/:stopId
 * @desc    Update a stop in an itinerary
 * @access  Private
 */
router.put('/:id/stops/:stopId', ItineraryController.updateStopValidation, ItineraryController.updateStop);

/**
 * @route   DELETE /api/itineraries/:id/stops/:stopId
 * @desc    Delete a stop from an itinerary
 * @access  Private
 */
router.delete('/:id/stops/:stopId', [
  param('id').isUUID().withMessage('Invalid itinerary ID'),
  param('stopId').isUUID().withMessage('Invalid stop ID'),
], ItineraryController.deleteStop);

export default router;