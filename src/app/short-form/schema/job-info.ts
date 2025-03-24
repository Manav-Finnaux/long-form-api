import yup from '@/lib/yup'

export const formSchema = yup.object({
  workType: yup.string().required(),
  employedWithAFixedSalaryDetails: yup.object().when('workType', {
    is: 'employed-with-a-fixed-salary',
    then: () => yup.object(employedWithAFixedSalarySchema.fields),
    otherwise: (schema) => schema.notRequired(),
  }),
  freelanceOrSelfEmployedDetails: yup.object().when('workType', {
    is: 'freelance-or-self-employed',
    then: () => yup.object(freelanceOrSelfEmployedSchema.fields),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessOwnerDetails: yup.object().when('workType', {
    is: 'business-owner',
    then: () => yup.object(businessOwnerSchema.fields),
    otherwise: (schema) => schema.notRequired(),
  }),
})

export const employedWithAFixedSalarySchema = yup.object({
  companyName: yup.string().required(),
  monthlyIncome: yup.number().required().min(1),
  jobRole: yup.string().required(),
  yearsOfExperience: yup.number().required().min(1),
})

export const freelanceOrSelfEmployedSchema = yup.object({
  monthlyIncome: yup.number().required().min(1),
  jobRole: yup.string().required(),
  yearsOfExperience: yup.number().required().min(1),
})

export const businessOwnerSchema = yup.object({
  companyName: yup.string().required(),
  natureOfBusiness: yup.string().required(),
  nof: yup.number().required().min(1),
  totalGrossProfit: yup.number().required().min(1),
  totalNetProfit: yup.number().required().min(1),
})
