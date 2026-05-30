import { ExpenseCategory } from "../../enums/expense/ExpenseCategory";

export const ExpenseCategoryLabels: Record<ExpenseCategory, string> = {
  [ExpenseCategory.transport]: 'Transport',
  [ExpenseCategory.accommodation]: 'Accommodation',
  [ExpenseCategory.food]: 'Food & Drink',
  [ExpenseCategory.tickets]: 'Tickets',
  [ExpenseCategory.shopping]: 'Shopping',
  [ExpenseCategory.other]: 'Other',
};