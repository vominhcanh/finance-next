# Backend Specifications for Spending Warning API

**Endpoint**: `GET /v1/analytics/spending-warning`

## Overview
This document outlines the required enhancements for the Spending Warning API (`getSpendingWarning`). The goal is to provide rich, pre-calculated data to the frontend to minimize client-side logic and ensure consistent, accurate financial warnings.

## Current Response Structure
Currently, the API returns the following fields:

```json
{
    "currentSpending": 12511301,
    "monthlyLimit": 20000000,
    "percentUsed": 62.5,
    "alertLevel": "SAFE" // Enum: SAFE | WARNING | OVERSPENT | URGENT
}
```

## Required New Fields & Logic
Please add the following fields to the response. **All calculations should be performed on the backend.**

### 1. `projectedSpending` (Number)
*   **Description**: The estimated total spending by the end of the month if the current spending trend continues.
*   **Backend Logic**:
    *   Calculate `dailyAverage` = `currentSpending` / `currentDayOfMonth`.
    *   `projectedBase` = `dailyAverage` * `daysInMonth`.
    *   *Refinement*: Add any **Upcoming Fixed Payments** (e.g., Debt Installments, Recurring Bills) due before the end of the month to this projection for higher accuracy.
    *   **Formula**: `(currentSpending / currentDay) * daysInMonth + Sum(UpcomingFixedBills)`

### 2. `spendingTrend` (Number)
*   **Description**: Percentage comparison of current spending vs. the same period last month.
*   **Backend Logic**:
    *   Fetch `spendingSamePeriodLastMonth` (e.g., if today is 15th, get spending from 1st-15th of last month).
    *   Calculate percentage difference.
    *   **Formula**: `((currentSpending - spendingSamePeriodLastMonth) / spendingSamePeriodLastMonth) * 100`
    *   **Example**: `15.5` (trending 15.5% higher), `-5.0` (trending 5% lower).

### 3. `dailyAverage` (Number)
*   **Description**: Average amount spent per day so far this month.
*   **Backend Logic**: `currentSpending / currentDayOfMonth`.

### 4. `safeDailySpend` (Number)
*   **Description**: The recommended maximum daily spending amount for the rest of the month to stay within the `monthlyLimit`.
*   **Backend Logic**:
    *   Identify `disposableBudget` = `monthlyLimit` - `currentSpending`.
    *   Subtract `upcomingFixedBills` (mandatory payments due this month) from `disposableBudget` to get the measure of "true" disposable income.
    *   Divide by `daysRemaining`.
    *   **Formula**: `(monthlyLimit - currentSpending - Sum(UpcomingFixedBills)) / daysRemaining`
    *   *Note*: If result is negative, return `0`.

### 5. `topCategory` (Object)
*   **Description**: The expense category that has consumed the most budget this month.
*   **Structure**:
    ```json
    {
        "name": "Food & Dining",
        "amount": 5000000,
        "percent": 40 // Percentage of total current spending
    }
    ```
*   **Backend Logic**: Aggregation of expenses by category for the current month, sort descending by amount, pick top 1.

### 6. `adviceMessage` (String)
*   **Description**: A dynamic, human-readable advice string based on the data analysis.
*   **Backend Logic**: Generate a string based on conditions.
    *   *Scenario A (Safe)*: "You are on track. Keep it up!"
    *   *Scenario B (Projected Overspend)*: "At this rate, you will exceed your budget by [Amount]. Try creating a limit for [TopCategory]."
    *   *Scenario C (Overspent)*: "You have exceeded your limit. Please review your [TopCategory] expenses."
    *   *Scenario D (Limit = 0)*: "No budget set. Please set a monthly limit to track your spending effectively."

## Final Proposed JSON Structure

```json
{
    "currentSpending": 12511301,
    "monthlyLimit": 20000000,
    "percentUsed": 62.5,
    "alertLevel": "SAFE",

    // NEW FIELDS
    "projectedSpending": 21000000,
    "spendingTrend": 12.5, // +12.5% vs last month
    "dailyAverage": 417000,
    "safeDailySpend": 350000, // Adjusted for upcoming bills
    "topCategory": {
        "name": "Ăn uống",
        "amount": 5000000,
        "percent": 40
    },
    "adviceMessage": "Bạn đang chi tiêu nhiều hơn 12.5% so với tháng trước. Hãy chú ý mục Ăn uống."
}
```
