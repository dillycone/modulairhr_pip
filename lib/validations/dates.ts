import { z } from 'zod';

/**
 * Date validation utilities for consistent date validation across forms
 */
export const dateValidations = {
  /**
   * Ensures end date is on or after start date
   */
  endDateAfterStartDate: <T extends { end_date?: Date | null; start_date?: Date | null }>(data: T) => {
    return !data.end_date || !data.start_date || data.end_date >= data.start_date;
  },
  
  /**
   * Ensures review date is after start date
   */
  reviewDateAfterStartDate: <T extends { review_date?: Date | null; start_date?: Date | null }>(data: T) => {
    return !data.review_date || !data.start_date || data.review_date > data.start_date;
  },
  
  /**
   * Ensures reviewDate is after startDate (camelCase version)
   */
  reviewDateAfterStartDateCamel: <T extends { reviewDate?: Date | null; startDate?: Date | null }>(data: T) => {
    return !data.reviewDate || !data.startDate || data.reviewDate > data.startDate;
  }
};

/**
 * Create a Zod refinement for end date after start date
 * @param errorMessage Custom error message
 * @param path Field to attach the error to
 */
export function createEndDateAfterStartDateRefinement(errorMessage = "End date must be on or after the start date", path = ["end_date"]) {
  return z.object({}).refine(dateValidations.endDateAfterStartDate, {
    message: errorMessage,
    path: path,
  });
}

/**
 * Create a Zod refinement for review date after start date
 * @param errorMessage Custom error message
 * @param path Field to attach the error to
 */
export function createReviewDateAfterStartDateRefinement(errorMessage = "Review date must be after the start date", path = ["review_date"]) {
  return z.object({}).refine(dateValidations.reviewDateAfterStartDate, {
    message: errorMessage,
    path: path,
  });
}

/**
 * Create a Zod refinement for reviewDate after startDate (camelCase version)
 * @param errorMessage Custom error message
 * @param path Field to attach the error to
 */
export function createReviewDateAfterStartDateCamelRefinement(errorMessage = "Review date must be after the start date", path = ["reviewDate"]) {
  return z.object({}).refine(dateValidations.reviewDateAfterStartDateCamel, {
    message: errorMessage,
    path: path,
  });
}