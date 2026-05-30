import { ExpenseCategory } from "../../enums/expense/ExpenseCategory";

export function getCategoryIcon(category: ExpenseCategory) {
  switch (category) {
    case ExpenseCategory.transport:
      return '✈';
    case ExpenseCategory.accommodation:
      return '🏨';
    case ExpenseCategory.food:
      return '🍽';
    case ExpenseCategory.tickets:
      return '🎟';
    case ExpenseCategory.shopping:
      return '🛍';
    default:
      return '📌';
  }
}