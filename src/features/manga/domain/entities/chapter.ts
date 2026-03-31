/**
 * Chapter Entity - Represents a manga chapter
 */

export interface Chapter {
  number: number;
  label: string;
  price: number; // 0 = free with ads, >0 = paid
}
