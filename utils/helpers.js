
import {boroughMap, neighborhoodMap} from './borough_neighborhood_map.js';




/**
 * Enrich a raw API item with borough_full and neighborhoods.
 * @param {Object} item - Raw project item from NYC Open Data API.
 * @returns {Object} Enriched project document for MongoDB.
 */
export function enrichData(item) {
  const boroughCode = (item.borough || '').trim().toUpperCase();
  const district = parseInt(item.council_district);
  const key = `${boroughCode}-${district}`;

  return {
    id: item.id || null,
    reported: item.reported || null,
    fiscal_year: item.fiscal_year || null,
    borough: boroughCode,
    borough_full: boroughMap[boroughCode] || "Unknown",
    council_district: isNaN(district) ? null : district,
    neighborhoods: neighborhoodMap[key] || [],
    sponsor: item.sponsor || null,
    title: item.title || null,
    description: item.description || null,
    budget_line: item.budget_line || null,
    award: item.award ? parseFloat(item.award) : 0
  };
}

export function throwError(message) {
  throw new Error(message);
}

export function validateAndReturnString(text, fieldName) {
  if (!text || typeof text !== "string")
    throwError(`${fieldName} should be a string`);
  text = text.trim();
  if (text.length === 0) throwError(`${fieldName} cannot be empty`);

  return text;
}

export function validateAge(age) {
  if (!age || typeof age !== "number" || isNaN(age)) throwError("Age should be a number");
  if (age < 0 || age > 100) throwError("Age should be between 0 and 100");
  if(age < 14) throwError(`You cannot register due to underage!!`);
}

export const getErrorMessage = (message) => ({errorMessage : message});