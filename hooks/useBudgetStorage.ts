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
  const { saveBudget, getNextBudgetNumber, updateBudget: updateBudgetData } = useSupabaseData()

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

  const updateBudget = async (budgetId: string, budgetData: BudgetData) => {
    if (!user) return null

    const updatedBudget = await updateBudgetData(budgetId, {
      client_name: budgetData.clientName,
      project_name: budgetData.projectName,
      project_description: budgetData.projectDescription,
      items: budgetData.budgetItems,
      total: budgetData.total,
      number: budgetData.reportNumber.toString(),
    })

    return updatedBudget
  }

  const getNextNumber = async () => {
    if (!user) return 589
    return await getNextBudgetNumber()
  }

  return {
    saveBudget: saveBudgetData,
    updateBudget,
    getNextBudgetNumber: getNextNumber,
  }
}
