import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ItineraryModel, StopModel } from '../models';

export class ItineraryController {
  /**
   * Validation middleware for creating itinerary
   */
  static createValidation = [
    body('title')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must not exceed 5000 characters'),
    body('start_date')
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    body('end_date')
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (new Date(value) < new Date(req.body.start_date)) {
          throw new Error('End date must be after or equal to start date');
        }
        return true;
      }),
    body('status')
      .optional()
      .isIn(['draft', 'active', 'completed', 'cancelled'])
      .withMessage('Status must be one of: draft, active, completed, cancelled'),
  ];

  /**
   * Validation middleware for updating itinerary
   */
  static updateValidation = [
    param('id').isUUID().withMessage('Invalid itinerary ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must not exceed 5000 characters'),
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    body('status')
      .optional()
      .isIn(['draft', 'active', 'completed', 'cancelled'])
      .withMessage('Status must be one of: draft, active, completed, cancelled'),
  ];

  /**
   * Validation middleware for itinerary ID parameter
   */
  static idValidation = [
    param('id').isUUID().withMessage('Invalid itinerary ID'),
  ];

  /**
   * Validation middleware for creating stop
   */
  static createStopValidation = [
    param('id').isUUID().withMessage('Invalid itinerary ID'),
    body('destination_name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Destination name must be between 1 and 255 characters'),
    body('destination_code')
      .optional()
      .trim()
      .isLength({ max: 10 })
      .withMessage('Destination code must not exceed 10 characters'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('arrival_date')
      .isISO8601()
      .withMessage('Arrival date must be a valid ISO 8601 date'),
    body('departure_date')
      .isISO8601()
      .withMessage('Departure date must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (new Date(value) < new Date(req.body.arrival_date)) {
          throw new Error('Departure date must be after or equal to arrival date');
        }
        return true;
      }),
    body('order_index')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Order index must be a positive integer'),
  ];

  /**
   * Validation middleware for updating stop
   */
  static updateStopValidation = [
    param('id').isUUID().withMessage('Invalid itinerary ID'),
    param('stopId').isUUID().withMessage('Invalid stop ID'),
    body('destination_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Destination name must be between 1 and 255 characters'),
    body('destination_code')
      .optional()
      .trim()
      .isLength({ max: 10 })
      .withMessage('Destination code must not exceed 10 characters'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('arrival_date')
      .optional()
      .isISO8601()
      .withMessage('Arrival date must be a valid ISO 8601 date'),
    body('departure_date')
      .optional()
      .isISO8601()
      .withMessage('Departure date must be a valid ISO 8601 date'),
    body('order_index')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Order index must be a positive integer'),
  ];

  /**
   * Create a new itinerary
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { title, description, start_date, end_date, status, metadata } = req.body;
      const userId = req.user!.id;

      const itinerary = await ItineraryModel.create({
        user_id: userId,
        title,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status,
        metadata,
      });

      res.status(201).json({
        message: 'Itinerary created successfully',
        itinerary,
      });
    } catch (error) {
      console.error('Error creating itinerary:', error);
      res.status(500).json({
        error: 'Failed to create itinerary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all itineraries for the authenticated user
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { status, upcoming, past } = req.query;

      let itineraries;

      if (status && typeof status === 'string') {
        itineraries = await ItineraryModel.findByUserIdAndStatus(
          userId,
          status as 'draft' | 'active' | 'completed' | 'cancelled'
        );
      } else if (upcoming === 'true') {
        itineraries = await ItineraryModel.findUpcoming(userId);
      } else if (past === 'true') {
        itineraries = await ItineraryModel.findPast(userId);
      } else {
        itineraries = await ItineraryModel.findByUserId(userId);
      }

      res.json({
        itineraries,
        count: itineraries.length,
      });
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      res.status(500).json({
        error: 'Failed to fetch itineraries',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get a specific itinerary by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user!.id;

      // Check if user owns the itinerary
      const isOwner = await ItineraryModel.isOwner(id, userId);
      if (!isOwner) {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      const itinerary = await ItineraryModel.findById(id);
      const stops = await StopModel.findByItineraryId(id);

      res.json({
        itinerary: {
          ...itinerary,
          stops,
        },
      });
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      res.status(500).json({
        error: 'Failed to fetch itinerary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update an itinerary
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user!.id;

      // Check if user owns the itinerary
      const isOwner = await ItineraryModel.isOwner(id, userId);
      if (!isOwner) {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      const updateData = { ...req.body };
      if (updateData.start_date) {
        updateData.start_date = new Date(updateData.start_date);
      }
      if (updateData.end_date) {
        updateData.end_date = new Date(updateData.end_date);
      }

      const itinerary = await ItineraryModel.update(id, updateData);

      res.json({
        message: 'Itinerary updated successfully',
        itinerary,
      });
    } catch (error) {
      console.error('Error updating itinerary:', error);
      res.status(500).json({
        error: 'Failed to update itinerary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete an itinerary
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user!.id;

      // Check if user owns the itinerary
      const isOwner = await ItineraryModel.isOwner(id, userId);
      if (!isOwner) {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      const deleted = await ItineraryModel.delete(id);

      if (!deleted) {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      res.json({
        message: 'Itinerary deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      res.status(500).json({
        error: 'Failed to delete itinerary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Add a stop to an itinerary
   */
  static async addStop(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user!.id;

      // Check if user owns the itinerary
      const isOwner = await ItineraryModel.isOwner(id, userId);
      if (!isOwner) {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      const stopData = {
        ...req.body,
        itinerary_id: id,
        arrival_date: new Date(req.body.arrival_date),
        departure_date: new Date(req.body.departure_date),
      };

      const stop = await StopModel.create(stopData);

      res.status(201).json({
        message: 'Stop added successfully',
        stop,
      });
    } catch (error) {
      console.error('Error adding stop:', error);
      res.status(500).json({
        error: 'Failed to add stop',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update a stop in an itinerary
   */
  static async updateStop(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { id, stopId } = req.params;
      const userId = req.user!.id;

      // Check if user owns the itinerary
      const isOwner = await ItineraryModel.isOwner(id, userId);
      if (!isOwner) {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      // Check if stop belongs to the itinerary
      const belongsToItinerary = await StopModel.belongsToItinerary(stopId, id);
      if (!belongsToItinerary) {
        res.status(404).json({
          error: 'Stop not found',
        });
        return;
      }

      const updateData = { ...req.body };
      if (updateData.arrival_date) {
        updateData.arrival_date = new Date(updateData.arrival_date);
      }
      if (updateData.departure_date) {
        updateData.departure_date = new Date(updateData.departure_date);
      }

      const stop = await StopModel.update(stopId, updateData);

      res.json({
        message: 'Stop updated successfully',
        stop,
      });
    } catch (error) {
      console.error('Error updating stop:', error);
      res.status(500).json({
        error: 'Failed to update stop',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete a stop from an itinerary
   */
  static async deleteStop(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { id, stopId } = req.params;
      const userId = req.user!.id;

      // Check if user owns the itinerary
      const isOwner = await ItineraryModel.isOwner(id, userId);
      if (!isOwner) {
        res.status(404).json({
          error: 'Itinerary not found',
        });
        return;
      }

      // Check if stop belongs to the itinerary
      const belongsToItinerary = await StopModel.belongsToItinerary(stopId, id);
      if (!belongsToItinerary) {
        res.status(404).json({
          error: 'Stop not found',
        });
        return;
      }

      const deleted = await StopModel.delete(stopId);

      if (!deleted) {
        res.status(404).json({
          error: 'Stop not found',
        });
        return;
      }

      res.json({
        message: 'Stop deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting stop:', error);
      res.status(500).json({
        error: 'Failed to delete stop',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}