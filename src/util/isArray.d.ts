/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Determines if a given value is an array
 * Checks every key to verify if the index is an integer
 * @param value Value to check for array
 */
declare function isArray(value: any): value is Array<unknown>;

export = isArray;
