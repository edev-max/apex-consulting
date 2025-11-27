"use client"

import { useAuth } from "./useAuth"
import { useSupabaseData } from "./useSupabaseData"

interface BudgetData {
  clientName: string
  projectName: string
  projectDescription: string
  budgetItems: any[]
  reportNumber: number
  total: number
}

export const useBudgetStorage = () => {
  const { user } = useAuth()
  const { saveBudget, getNextBudgetNumber } = useSupabaseData()

  const saveBudgetData = async (budgetData: BudgetData) => {
    if (!user) return null

    const savedBudget = await saveBudget({
      clientName: budgetData.clientName,
      projectName: budgetData.projectName,
      projectDescription: budgetData.projectDescription,
      budgetItems: budgetData.budgetItems,
      reportNumber: budgetData.reportNumber,
      total: budgetData.total,
    })

    return savedBudget
  }

  const getNextNumber = async () => {
    if (!user) return 589
    return await getNextBudgetNumber()
  }

  return {
    saveBudget: saveBudgetData,
    getNextBudgetNumber: getNextNumber,
  }
}
